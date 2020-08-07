const httpStatus      = require('http-status-codes')
const SubApplication = require('./sub-app')

class ItemService extends SubApplication {
    constructor(database, options)  {
        super(database, options)
        this.app.post('/',      this.createItem.bind(this))
        this.app.get('/',       this.findItem.bind(this))
        this.app.get('/catalog', this.getCatalog.bind(this))
        
        this.populate()

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
            var item = this.postBody(req, false)
            await this.newItem(item)
            res.status(httpStatus.OK).json({message:`created item ${item.sku}`})
        } catch(e) {
            next(e)
        }
    }

    async newItem(item) {
        let txn = await this.db.begin()
        await this.db.executeSQLInTxn(txn, 'insert-item', [item.sku, item.name, item.category, item.description, item.price, item.image])
        for (var i = 0; item.tags && i < item.tags.length; i++) {
            await this.db.executeSQLInTxn(txn, 'add-item-tag', [item.sku, item.tags[i]])

        }
        // TODO: rating
        let rating = 3
        await this.db.executeSQLInTxn(txn, 'insert-rating', ['admin', item.sku, rating, 'initial'])
        this.db.commit(txn)

    }

    async existsItem(sku) {
        let row = await this.db.executeSQL('exists-item', [sku])
        return row != null
    }
    
    async populate() {
        var fs = require('fs')
        var path = require('path')
        var yaml = require('js-yaml')
        var data_dir = path.join(__dirname, '../data/items')
        //console.log(`data directory ${data_dir}`)
        if (fs.existsSync(data_dir)) {
            console.log(`populating items from ${data_dir}`)
            var files = fs.readdirSync(data_dir, {withFileTypes:true})
            for (var i = 0; i < files.length; i++) {
                const file = files[i]
                if (file.isDirectory()) continue
                //console.log(`populating item from ${file.name}`)
                const file_path = path.join(__dirname, '../data/items', file.name)
                let fileContents = fs.readFileSync(file_path, 'utf8');
                let item = yaml.safeLoad(fileContents);
                if (! await this.existsItem(item.sku)) {
                    console.log(`saving item ${item.sku}:${item.name} from `)
                    this.newItem(item)
                }
        }
    }}
   
}

module.exports =  ItemService