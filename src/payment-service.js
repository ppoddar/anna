const Razorpay = require('razorpay')
const SubApplication = require('./sub-app')
const httpStatus = require('http-status-codes')
const OrderController = require('./order-controller')

/**
 * payment service .
 * Service methods are async and they throw exception.
 */
class PaymentService extends SubApplication {
    constructor(db,options) {
        super(db,options)
        this.PaymentGatewayCredentials = options
        this.merchant_id = options.merchant_id
        this.razorPay = new Razorpay({
            key_id:     options.key_id,
            key_secret: options.key_secret
        })
        this.controller = new OrderController(db)
        
        this.app.post('/:oid/user/:uid',         this.createInvoice.bind(this))
        this.app.post('/:oid/address/:address_id',  this.setDeliveryAddress.bind(this))
        this.app.get('/find/:oid',               this.getInvoice.bind(this))
        this.app.get('/payment-gateway-credentials',   this.getPaymentGatewayCredentials.bind(this))
        
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
            var invoice = await this.controller.createInvoice(oid,uid)
            let payorder = await this.createPayorder(invoice.id, invoice.amount)
            await this.controller.setPayorder(oid, payorder)
            invoice.payorder = payorder

            res.status(httpStatus.OK).json(invoice)
        } catch (e) {
            next(e)
        }

    }

    async getInvoice(req,res,next) {
        try {
            const oid = req.params.oid
            const invoice = await this.controller.getInvoice(oid)
            res.status(httpStatus.OK).json(invoice)
        } catch (e) {
            next(e)
        }
    }
    async setDeliveryAddress(req, res, next) {
        try {
            var oid          = req.params.oid
            var address_id   = req.params.address_id
            await this.controller.setDeliveryAddress(oid, address_id)
            res.status(httpStatus.OK)
        } catch (e) {
            next(e)
        }
    }

    async getPaymentGatewayCredentials(req, res, next) {
        res.status(httpStatus.OK).json(this.PaymentGatewayCredentials)

    }
}
module.exports = PaymentService