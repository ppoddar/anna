const SubApplication = require('./sub-app')
const ItemController = require('./item-controller')
/**
 * @classdesc
 * PricingService computes prices for each line item, 
 * texaes, and discounts
 */
class PricingController {
    constructor(database) {
        this.db = database
        this.itemController = new ItemController(database)
        this.prices = {}
    }
    /**
     * computes discount on given lineitem
     * 
     * @param {} lineitem 
     * @param {*} user 
     * 
     * @returns null if no discount
     */
    async computeDiscount(lineitem, user) {
        // TODO: apply discount rules
        return null
    }

    /**
     * computes price on given lineitem
     * 
     * @param {} lineitem 
     * @param {*} user 
     * 
     * @returns 
     */
    async computePrice(li, uid) {
        var p
        if (li.sku in this.prices) {
            p = this.prices[li.sku]
            //console.log(`${this.constructor.name} item ${li.sku} price ${p}`)
        } else {
            //console.log(`${this.constructor.name} fecth item ${li.sku}`)
            const item = await this.itemController.getItem(li.sku);
            p = item.price
            //console.log(`${this.constructor.name} item ${item.sku} price ${p}`)
            this.prices[item.sku] = p
        }
        var amount = this.toAmount(li.units * p)
        //console.log(`${this.constructor.name} compute price ${li.sku} price ${amount}`)
        return {name: li.name, amount: amount}
    }

    /**
     * computes tax on total price
     * 
     * @param {} lineitem 
     * @param {*} user 
     * 
     * @returns an array of taxes 
     */
    async computeTax(amount) {
        var taxRate = 7
        var salesTax = this.toAmount(amount * taxRate *0.01);
        return [{name: `sales tax @${taxRate}%`, amount: salesTax}]
    }

    toAmount(val) {
        return parseFloat(val.toFixed(2))

    }

}

module.exports = PricingController