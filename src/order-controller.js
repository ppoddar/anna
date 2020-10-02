const httpStatus = require('http-status-codes')
const ItemController = require('./item-controller')
const PriceController = require('./price-controller')
/*
 * Service is web-facing component in this architecture.
 * A service uses one or more controller.
 * A controller is databse-facing, not  web-facing.
 * 
 * This OrderService uses ItemController
 */
class OrderController {
    constructor(database) {
        this.db = database
        this.itemController = new ItemController(database)
        this.priceController = new PriceController(database)

    }

    /**
     * create an order for given user and with given lineitems.
     * Order is assigned an automatic id by the database.
     * <p>
     * Price of each line items is calculated without discount
     * or tax
     * @param {*} uid id of an user
     * @param {*} lineitems array of lineitems (sku,units,comment?)
     * 
     * @returns an order with its lineitems
     * 
     * exception:  The method body is enclosed in try-catch. The functions
     * in the method body can throw asynchronous exception.
     * The cath block call next(e) -- not rethorw e
     * The last line of defence is ErrorHandler in app.js that would
     * proess the error for end-user consumption.
     */
    async createOrder(uid, lineitems) {
            let txn    = await this.db.begin()
            let result = await this.db.executeSQL('insert-order', [uid])
            let order  = {id:result['id'].toString(), user: result['user_id'],
                created: result['created'], time_offset: result['time_offset'],
                status : result['status']}
            console.debug(`database order create returned [${JSON.stringify(order)}]`)
            order['items'] = []
            let total = 0
            for (var i = 0; i < lineitems.length; i++) {
                let e    = lineitems[i]
                let item = await this.itemController.getItem(e.sku)
                let price = item.price * e.units
                total += price
                let li = {sku:e.sku, name: item.name,units: e.units,comment:e.comment}
                order['items'].push (li) 
                await this.db.executeSQLInTxn(txn, 'insert-order-item', 
                    [order.id, li.sku, li.name, li.units, li.comment])
            }
            await this.db.commit(txn)
            return order
        
    }
 
    async changeOrderStatus(oid, status) {
        let txn  = await this.db.begin()
        let s = status.toUpperCase()
        await this.db.executeSQLInTxn(txn, 'chnage-order-status', [s, oid])
        await this.db.executeSQLInTxn(txn, 'record-order-event',  [oid, s])
        await this.db.commit(txn)
    }

    /**
     * get orders with given statues
     * @param {string[]} statuses array of string 
     */
    async selectOrdersByStatuses(statuses) {
        console.log(`order service input ${statuses}`)
        let result = []
        for (var i = 0; i < statuses.length; i++) {
            let s = statuses[i].trim().toUpperCase()
            let selected = await this.db.executeSQL('select-order-by-status', [s])
            if (selected.length>0)
                result = result.concat(selected)
        }
        console.log(`order service returns ${result.length} rows`)

        return result
    }

    async selectOrdersByStatusesAndTimeRange(statuses, timerange) {
        let result = await this.selectOrdersByStatuses(statuses)
        result = result.filter((order)=>{return !this.inRange(order,timerange)})
            
        return result
    }

    inRange(order, range) {
        if (!range) return true
        let t = order.created
        if (range.start) {
            if (t < range.start) {
                return false
            }
        }
        if (range.end) {
            if (t > range.end) {
                return false
            }
        }
        return true    
    }

    async findInvoice(id) {
        let invoice = await this.db.executeSQL('find-invoice', [id])
        let rs = await this.db.executeSQL('select-invoice-items', [id])
        invoice['items'] = this.arrangeLineitems(rs)
        return invoice
    }

    async findOrder(id) {
        let order = await this.db.executeSQL('find-order', [id])
        let rs = await this.db.executeSQL('select-order-items', [id])
        order.items = this.arrangeLineitems(rs)
        return order
    }

    async getAllOrders() {
        let orders = await this.db.executeSQL('select-all-orders')
        return orders
    }

    /**
     * Arranges array of lineitems into a set indexed by item sku.
     * combining multiple items if necessary
     * @param {*} array of lineitems
     * @returns a map sku -> lineitem
     */
    arrangeLineitems2(rs) {
        console.log(`arrangeLineitems() result set has ${rs.length} rows`)
        let result = {}
        for (var i = 0; i < rs.length; i++) {
            let li = rs[i]
            console.log(`row[${i}]=${JSON.stringify(li)}`)
            let sku = li.sku
            if (sku in result) {
                let existing = result[sku]
                existing.units += li.units
                existing.comment += li.comment
            } else {
                result[sku] = li
            }
        }
        return result
    }

    arrangeLineitems(rs) {
        console.log(`result set has ${rs.length} rows`)
        let result = []
        for (var i = 0; i < rs.length; i++) {
            let li = rs[i]
            console.log(`row[${i}]=${JSON.stringify(li)}`)
            result.push(li)
        }
        return result
    }


    async createInvoice(oid,uid) {
            let lineitems = await this.db.executeSQL('select-order-items', [oid])
            let txn = await this.db.begin()
            let invoice = {id: oid, items: []}
            // order of SQL execution is important
            await this.db.executeSQLInTxn(txn, 'insert-invoice', [invoice.id])

            let totalPrice   = 0.0
            let totalDiscount = 0.0
            for (var i = 0; i < lineitems.length; i++) {
                let li = lineitems[i]
                let price = (await this.priceController.computePrice(li,uid)).amount
                totalPrice += price
                await this.addInvoiceItem(txn, invoice, 'PRICE', li.sku, li.name, price)
                let discount = await this.priceController.computeDiscount(li, uid)
                if (discount != null) {
                    console.log(`discount for line item ${li.sku}=${discount}`)
                    totalDiscount += discount.amount
                    await this.addInvoiceItem(txn, invoice, 'DISCOUNT', li.sku, discount.name, discount.amount)
                } 
            }
            var totalTax = 0.0
            var taxes = await this.priceController.computeTax(totalPrice)
            for (var j = 0; j < taxes.length; j++) {
                var tax = taxes[j]
                totalTax += tax.amount
                // Tax may have no particular item
                await this.addInvoiceItem(txn, invoice, 'TAX', '', tax.name, tax.amount)
            }
            invoice.amount = this.priceController.toAmount(totalPrice - totalDiscount + totalTax)
            console.log(`invoice.amount=${invoice.amount}`)
            //let payorder = await this.createPayorder(invoice.id, invoice.amount)
            //invoice.payorder = payorder
            //await this.db.executeSQLInTxn(txn, 'insert-payorder',         [payorder.id, invoice.id, payorder.amount_due])
            //await this.db.executeSQLInTxn(txn, 'update-invoice-payorder', [invoice.id, invoice.payorder.id, invoice.amount])
            await this.db.commit(txn)
            return invoice
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

    async getInvoice(oid) {
            const invoice = await this.db.executeSQL('select-invoice', [oid])
            const invoiceItems = await this.db.executeSQL('select-invoice-items', [oid])
            const payorder = await this.db.executeSQL('select-payorder', [invoice.id])
            invoice.items    = invoiceItems
            invoice.payorder = payorder
            return invoice
    }

    async setDeliveryAddress(oid, address_id) {
        await this.db.executeSQL('update-delivery-address', [oid, address_id])        
    }

    async setPayorder(oid, payorder) {
        let txn = await this.db.begin()
        await this.db.executeSQLInTxn(txn, 'insert-payorder',         [payorder.id, oid,  payorder.amount_due])
        await this.db.executeSQLInTxn(txn, 'update-invoice-payorder', [oid,  payorder.id, payorder.amount_due])
        await this.db.commit(txn)
    }

}
module.exports = OrderController