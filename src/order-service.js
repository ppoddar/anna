const httpStatus = require('http-status-codes')
const SubApplication = require('./sub-app')
const ItemController = require('./item-controller')
const OrderController = require('./order-controller')
const PriceController = require('./price-controller')

/*
 * Service is web-facing component in this architecture.
 * A service uses one or more controller.
 * A controller is databse-facing, not  web-facing.
 * 
 * This OrderService uses ItemController
 */
class OrderService extends SubApplication{

    constructor(database,options) {
        super(database,options)
        this.orderController = new OrderController(database)
        this.itemController  = new ItemController(database)
        this.priceController = new PriceController(database)
        this.app.post('/:uid',     this.createOrder.bind(this))
        //this.app.get('/find/:oid', this.getOrder.bind(this))
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
    async createOrder(req,res,next) {
        try {
            var lineitems = this.postBody(req, true)
            var uid   = req.params.uid
            let order = await this.orderController.createOrder(uid, lineitems)
            res.status(httpStatus.OK).json(order)
        } catch (e) {
            next(e)
        }
        
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

    async getAll() {
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

}
module.exports = OrderService