const Razorpay = require('razorpay')
const SubApplication = require('./sub-app')
const httpStatus = require('http-status-codes')

/**
 * payment service .
 * Service methods are async and they throw exception.
 */
class PaymentService extends SubApplication {
    constructor(db,options) {
        super(db,options)
        this.merchant_id = 'E6zizYl3YOaAtT'
        this.razorPay = new Razorpay({
            key_id: 'rzp_test_5GjkKK47NrE4b0',
            key_secret: 'kpwjzn4pPpaVdDlXBqmYq5Ku'
        })

        this.app.post('/:oid/:uid',         this.createInvoice.bind(this))
        this.app.get('/:oid',               this.findInvoice.bind(this))
        this.app.post('/:oid/:address_id',  this.setDeliveryAddress.bind(this))
        this.app.get('/payment-options',    this.getPaymentGatewayOptions.bind(this))
    }

    async createPayorder(oid, amount) {
        console.debug(`creating payorder of ${amount} for order [${oid}]`)
        let payload = {
            amount: parseInt(amount * 100),
            currency: 'INR',
            receipt: oid,
            payment_capture: 1
        }
        let payOrder = await this.razorPay.orders.create(payload)
        console.debug('created payOrder in RazorPay')
        console.debug(JSON.stringify(payOrder))
        return payOrder
    }

    async confirmPayorder(oid) {
        await this.db.query('update-invoice-status', [oid, 'PAYMENT_CONFIRMED'])
        await this.db.query('record-order-event', [oid, 'PAYMENT_CONFIRMED'])
        return { 'order': oid, 'status': 'PAYMENT_CONFIRMED' }
    }

    async pay(invoice, customer, cb) {
        var options = this.createRazorPayOptions(invoice, customer, cb)
        new Razorpay(options).open();
    }

    /**
	 * Creates the options to be passed to payment gateway
	 */
    createRazorPayOptions(invoice, customer, cb) {
        var self = this;
        var options = {
            "key": self.key.id,
            "amount": invoice.payorder.amount_due,
            "currency": invoice.payorder.currency,
            "name": "HiraaFood",
            "description": "best food in town",
            "image": "/images/logo.png",
            "order_id": invoice.payorder.id,
            "prefill": {
                "name": customer.name,
                "email": customer.email,
                "contact": customer.phone
            },
            "notes": {
                "address": "note value"
            },
            "theme": {
                "color": "#3b5998"
            },
			/**
			 * callback on success of payment operation
			 */
            "handler": (response) => { this.onPaymentSuccess(response, invoice, cb) },
			/**
			 * callback when payment dialog is closed. Razor Pay automatically
			 * retries on failure.
			 */
            "modal": {
                "ondismiss": () => {

                }
            }
        };
        return options;
    }

	/**
     * Creates an invoice (bill) for given line items.
     * Creates an order for the given line items.
     * Then calculates price with discount and taxes with pricing service
     * Contacts Payment Service to create a payorder
     * 
     * @param {*} user id of  an user
     * @param {*} lineitems set of lineitems indexed by sku
     */
    async createInvoice(req, res, next) {
        try {
            const oid = req.params.oid
            const uid = req.params.uid
            let lineitems = await this.db.executeSQL('select-order-items', [oid])
            let txn = await this.db.begin()
            let invoice = {id: oid, items: []}
            // order of SQL execution is important
            await this.db.executeSQLInTxn(txn, 'insert-invoice', [invoice.id])

            let totalPrice   = 0.0
            let totalDiscount = 0.0
            for (var i = 0; i < lineitems.length; i++) {
                let li = lineitems[i]
                let price = (await this.pricingService.computePrice(li,uid)).amount
                totalPrice += price
                await this.addInvoiceItem(txn, invoice, 'PRICE', li.sku, li.name, price)
                let discount = await this.pricingService.computeDiscount(li, uid)
                if (discount != null) {
                    console.log(`discount for line item ${li.sku}=${discount}`)
                    totalDiscount += discount.amount
                    await this.addInvoiceItem(txn, invoice, 'DISCOUNT', li.sku, discount.name, discount.amount)
                } 
            }
            var totalTax = 0.0
            var taxes = await this.pricingService.computeTax(totalPrice)
            for (var j = 0; j < taxes.length; j++) {
                var tax = taxes[j]
                totalTax += tax.amount
                // Tax may have no particular item
                await this.addInvoiceItem(txn, invoice, 'TAX', '', tax.name, tax.amount)
            }
            invoice.amount = this.pricingService.toAmount(totalPrice - totalDiscount + totalTax)
            console.log(`invoice.amount=${invoice.amount}`)
            let payorder = await this.createPayorder(invoice.id, invoice.amount)
            invoice.payorder = payorder
            await this.db.executeSQLInTxn(txn, 'insert-payorder',         [payorder.id, invoice.id, payorder.amount_due])
            await this.db.executeSQLInTxn(txn, 'update-invoice-payorder', [invoice.id, invoice.payorder.id, invoice.amount])
            await this.db.executeSQLInTxn(txn, 'record-order-event', [oid, 'CREATED'])

            await this.db.commit(txn)

            res.status(httpStatus.OK).json(invoice)
        } catch (e) {
            next(e)
        }

    }

	/*
     *
     */
    async addInvoiceItem(txn, invoice, kind, sku, desc, amount) {
        var n = Object.keys(invoice.items).length
        console.debug(`invoice ${invoice.id} add item   ${n} ${kind} ${desc} ${amount}`)
        var item = { invoice: invoice.id, id: n, kind: kind, sku: sku, description: desc, amount: amount }
        await this.db.executeSQLInTxn(txn, 'insert-invoice-item',
            [invoice.id, n, kind, sku, desc, amount])
        invoice.items.push(item)
    }

    async findInvoice(req,res,next) {
        try {
            const oid = req.params.oid
            const invoice = await this.db.executeSQL('select-invoice', [oid])
            const invoiceItems = await this.db.executeSQL('select-invoice-items', [oid])
            invoice.items = invoiceItems
            res.status(httpStatus.OK).json(invoice)
        } catch (e) {
            next(e)
        }
    }
    async setDeliveryAddress(req, res, next) {
        try {
            var oid          = req.params.oid
            var address_id   = req.params.address_id
            await this.db.executeSQL('update-delivery-address', [oid, address_id])
            res.status(httpStatus.OK)
        } catch (e) {
            next(e)
        }
    }


    /**
	 * Creates the options to be passed to payment gateway
	 */
	async getPaymentGatewayOptions(req,res,next) {
        var options = {
			"key": this.razorPay.key_id
		};
		return options;
	}
    

}
module.exports = PaymentService