const httpStatus      = require('http-status-codes')
const SubApplication = require('./sub-app')
const ItemController = require('./item-controller')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')
const { retry } = require('async')

/*
 * Creates and manages menu items.
 */
class ItemService extends SubApplication {

    constructor(database, options)  {
        super(database, options)
        this.controller = new ItemController(database)

        this.app.post('/',          this.createItem.bind(this))
        this.app.get('/find/:sku',  this.getItem.bind(this))
        this.app.get('/catalog',    this.getCatalog.bind(this))
    }

    /*
     * Populates with items 
     */
    async populate() {
        await this.controller.populate()
        await this.controller.enumerateItems()
    }

    /*
     * gets all items
     */
    async getCatalog(req,res,next) {
        try {
            const catalog = await this.controller.getCatalog()
            res.status(httpStatus.OK).json(catalog)
        } catch(e) {
            next(e)
        }
    }

    /*
     * get an item by sku
     */
    async getItem(req,res,next) {
        try {
            const sku = req.params.sku
            let item =  await this.controller.getItem(sku)
            if (item == null) {
                res.status(httpStatus.NOT_FOUND).json({message:`item ${sku} not found`})
            } else {
                res.status(httpStatus.OK).json(item)
            }
        } catch (e) {
            next(e)
        }
    }

    /*
     * Create an item. The request body is the item 
     */
    async createItem(req,res,next) {
        var item = this.postBody(req, false)
        if (!('sku' in item)) {
            return res.status(httpStatus.BAD_REQUEST).send({message:'no sku for item data'})
        }
        var exists = await this.controller.existsItem(item.sku)
        if (exists) {
            return res.status(httpStatus.NOT_MODIFIED).json({message:`item with sku ${item.sku} exists`})
        }
        try {
            await this.controller.createItem(item)
            res.status(httpStatus.OK).json({message:`created item ${item.sku}`})
        } catch(e) {
            next(e)
        }
    
    }
}

module.exports =  ItemService