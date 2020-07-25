
class ItemService {
    constructor(database)  {
        this.db      = database
    }

    /**
     * gets all items
     * @returns array of items
     */
    async getCatalog() {
        return await this.db.executeSQL('get-catalog', [])
        
    }

    async existsItem(sku) {
        let row = await this.db.executeSQL('exists-item', [sku])
        return row

    }
    /**
     * 
     * @param {*} sku 
     */
    async findItem(sku) {
        console.debug(`findItem [${sku}]`)
        let item = await this.db.executeSQL('find-item', [sku])
        if (!item) return
        if (item.tags)
            item['tags'] = item.tags.split(',')
        return item
    }

    /**
     * Creates item.
     * If the item exists, throws exception
     * @param {*} item all fields 
     */
    async createItem(item) {
        let txn = await this.db.begin()
        await this.db.executeSQLInTxn(txn, 'insert-item', [item.sku, item.name, item.category, item.description, item.price, item.image])
        
        for (var i = 0; item.tags && i < item.tags.length; i++) {
            await this.addTag(txn, item.sku, item.tags[i])
        }
        let rating = 3
        await this.db.executeSQLInTxn(txn, 'insert-rating', ['admin', item.sku, rating, 'initial'])

        this.db.commit(txn)
    }

    async addTag(txn, sku, tag) {
        await this.db.executeSQLInTxn(txn, 'add-item-tag', [sku, tag])
    }
}

module.exports =  ItemService