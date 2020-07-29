const express         = require('express')
const httpStatus      = require('http-status-codes')
const BaseController = require('./base-controller')
class ItemService extends BaseController {
    constructor(database, options)  {
        super()
        this.db      = database
        this.app     = express()
        this.app.post('/',      this.createItem.bind(this))
        this.app.get('/',       this.findItem.bind(this))
        this.app.get('/catalog', this.getCatalog.bind(this))

    }
    async getCatalog(req,res,next) {
        try {
            const catalog = await this.db.executeSQL('get-catalog', [])
            res.status(httpStatus.OK).json(catalog)
        } catch(e) {
            next(e)
        }
    }
    async findItem(req,res,next) {
        var sku = this.queryParam(req,res,'sku')
        let item = await this.db.executeSQL('find-item', [sku])
        res.status(httpStatus.OK).json(item)
    }

    async findItem(sku) {
        console.debug(`findItem [${sku}]`)
        let item = await this.db.executeSQL('find-item', [sku])
        if (!item) throw new Error(`item ${sku} not found`)
        if (item.tags)
        item['tags'] = item.tags.split(',')
        return item
    }

    async createItem(req,res,next) {
        try {
            var item = this.postBody(req, res, false)
            let txn = await this.db.begin()
            await this.db.executeSQLInTxn(txn, 'insert-item', [item.sku, item.name, item.category, item.description, item.price, item.image])
            for (var i = 0; item.tags && i < item.tags.length; i++) {
                await this.db.executeSQLInTxn(txn, 'add-item-tag', [item.sku, item.tags[i]])

            }
            // TODO: rating
            let rating = 3
            await this.db.executeSQLInTxn(txn, 'insert-rating', ['admin', item.sku, rating, 'initial'])
            this.db.commit(txn)
            res.status(httpStatus.OK).json({message:`created item ${item.sku}`})
        } catch(e) {
            next(e)
        }
    }
    

    async existsItem(sku) {
        let row = await this.db.executeSQL('exists-item', [sku])
        return row
    }
    
   
}

module.exports =  ItemService