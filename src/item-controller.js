const logger = require('./logger')
/*
 */
class ItemController {
    constructor(database) {
        this.db = database        
    }

    async getCatalog() {
        const catalog = await this.db.executeSQL('get-catalog')
        return catalog
    }


    /*
     * get an item by sku
     */
    async getItem(sku) {
        let item = await this.db.executeSQL('select-item-by-sku', [sku])
        item['categories'] = (item && item.categories)  ? item.categories.split(',') : []
        item['tags'] = (item && item.tags)  ? item.tags.split(',') : []
        return item
    }


    async createItem(item) {
        let txn = await this.db.begin()
        await this.db.executeSQLInTxn(txn, 'insert-item', [item.sku, item.name, item.description, item.price, item.image])
        for (var i = 0; item.categories && i < item.categories.length; i++) {
            await this.db.executeSQLInTxn(txn, 'insert-item-category', [item.sku, item.categories[i]])
        }
        for (var i = 0; item.tags && i < item.tags.length; i++) {
            await this.db.executeSQLInTxn(txn, 'insert-item-tag', [item.sku, item.tags[i]])
        }
        //TODO: rating
        let rating = 3
        await this.db.executeSQLInTxn(txn, 'insert-rating', [null, item.sku, rating, ''])
        this.db.commit(txn)
    }

    /*
     * affirms if an item of given sku exists
     */
    async existsItem(sku) {
        let row = await this.db.executeSQL('find-item', [sku])
        return row !== null
    }

    /*
     * Populate menu items in databse.
     * Each menu item is described in ./data/items/*.json file
     * relative to parent directory of this script.
     */
    async populate() {
        var fs = require('fs')
        var path = require('path')
        const data_dir = path.join(__dirname, './data/items')
        var files = fs.readdirSync(data_dir, { withFileTypes: true })
        for (var i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.isDirectory()) continue
            if (!file.name.endsWith('.json')) continue
            const file_path = path.join(data_dir, file.name)
            logger.debug(`populating items from ${file_path}`)
            let fileContents = fs.readFileSync(file_path, 'utf8');
            let item = JSON.parse(fileContents)
            if (! await this.existsItem(item.sku)) {
                logger.debug(`saving item ${item.sku}:${item.name}`)
                await this.createItem(item)
            }
        }
        
    }

    async enumerateItems() {
        const catalog = await this.getCatalog()
        for (var i = 0; i < catalog.length; i++) {
            logger.debug(`${i} ${catalog[i].sku}\t${catalog[i].name}`)
        }
        logger.info(`(${catalog.length} items in menu)`)
    }

}

module.exports = ItemController