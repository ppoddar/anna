const SubApplication = require('./sup-app')
/**
 * @classdesc
 * PricingService computes prices for each line item, 
 * texaes, and discounts
 */
class PricingService extends SubApplication{
    constructor(database,options) {
        super(database,options)
    }
    /**
     * computes discount on given lineitem
     * 
     * @param {} lineitem 
     * @param {*} user 
     * 
     * @returns null if no discount
     */
    computeDiscount(lineitem, user) {
        // TODO: apply discount rules
        return 
    }

    /**
     * computes price on given lineitem
     * 
     * @param {} lineitem 
     * @param {*} user 
     * 
     * @returns 
     */
    computePrice(li, user) {
        var amount = this.toAmount(li.units * li.price)
        return {name: li.name, amount: amount}
    }

    /**
     * computes price on given lineitem
     * 
     * @param {} lineitem 
     * @param {*} user 
     * 
     * @returns 
     */
    computeTax(amount) {
        var taxRate = 7
        var salesTax = this.toAmount(amount * taxRate *0.01);
        return [{name: `sales tax @${taxRate}%`, amount: salesTax}]
    }

    toAmount(val) {
        return parseFloat(val.toFixed(2))

    }

}

module.exports = PricingService