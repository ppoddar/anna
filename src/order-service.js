const httpStatus = require('http-status-codes')
const SubApplication = require('./sub-app')

class OrderService extends SubApplication{

    constructor(database,options) {
        super(database,options)

        this.app.post('/:uid', this.createOrder.bind(this))
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
            //console.debug(`createOrder  uid=${uid}`)
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
                let item = await this.itemService.findItem(e.sku)
                let price = item.price * e.units
                total += price
                let li = {sku:e.sku, name: item.name,units: e.units,comment:e.comment}
                order['items'].push (li) 
                await this.db.executeSQLInTxn(txn, 'insert-order-item', 
                    [order.id, li.sku, li.name, li.units, li.comment])
            }
            await this.db.commit(txn)
        
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