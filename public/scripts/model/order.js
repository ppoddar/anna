import OrderItem    from './order-item.js'
import Amount 		from '../widgets/amount.js'

/**
 * cart contains a set of lineitems indexed by Item sku.
 */
class Order {
    constructor(obj) {
		console.log('crete order form')
		console.log(obj)
		this.id    = obj['id']
		this.total = obj['total']
		this.items = obj['items']
	}

	/**
	 * renders each line item and total
	 * 
	 * @return an array of row
	 */
	render() {
		$('#order-number').text(this.id)
		for (var sku in this.items) {
			var li   = new OrderItem(this.items[sku])
			let $row = li.render()
			$('#order-items').append($row)
		}
		$('#order-total').append(new Amount(this.total).render())
	}

}
export default Order