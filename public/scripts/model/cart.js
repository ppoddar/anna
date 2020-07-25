import Application   from '../app.js'
import OrderItem      from './order-item.js'

/**
 * cart contains a set of lineitems indexed by Item sku.
 */
class Cart {
    constructor(obj) {
		this.items = obj['items'] || {}
	}

	isEmpty() {
		return Object.keys(this.items).length == 0
	}

	
	/**
	 * adds/updates a order item.
	 * not synced to server. but refreshes session storage
	 */
    addLineItem(item, units, comment) {
		let sku = item.sku
        if (sku in this.items) {
			let existing = this.items[sku]
            //console.log(`addLineItem ${units} to update existing item-${sku}`)
			existing.units  += units 
			existing.comment = comment 
        } else {
			//console.log(`addLineItem ${units} to new item ${sku}`)
			this.items[sku] = new OrderItem({
				sku: item.sku,
				name:item.name, 
				image: item.image,
				units:units, 
				comment:comment})
        }
		Application.saveCart(this)
		$('#cart').trigger('click')
		//$('#checkout').attr('disabled', false)

        return this
    }

	/**
	 * renders each line item
	 * 
	 * @return an array of row
	 */
	render() {
		let $main = $('<div>')
		
		if (this.isEmpty()) {
			let $label = $('<label>')
			$label.text('empty')
			$label.addClass('text-danger')
			$main.append($label)
		} else {
			for (var sku in this.items) {
				var li   = this.items[sku]
				var $p = this.createLineItem(li)
				$main.append($p)
			}
		}
		return $main
	}

	createLineItem(li) {
		let addButton = this.createButton('&plus;', 'text-success')
		addButton.on('click', ()=>{
			li.units += 1
			Application.saveCart(this)
		 	$('#cart').trigger('click')
		})

		let reduceButton = this.createButton('&minus;', 'text-danger')
		reduceButton.attr('disabled', li.units>1)
		reduceButton.on('click', ()=>{
			li.units -= 1
			Application.saveCart(this)
		 	$('#cart').trigger('click')
		})

		let removeButton = this.createButton('&cross;', 'text-danger')
		removeButton.on('click', ()=>{
			delete this.items[li.sku]
			Application.saveCart(this)
		 	$('#cart').trigger('click')
		})

		let $buttonGroup = $('<div>')
		$buttonGroup.addClass('button-group')
		$buttonGroup.append([addButton, reduceButton, removeButton])

		let $row = $('<div>')
		$row.addClass('d-flex row no-gutters')
		let $units = $('<div>')
		$units.addClass('col col-1')
		$units.text(li.units)
		let $name = $('<div>')
		$name.addClass('col flex-grow')
		$name.text(li.name)

		let $buttons = $('<div>')
		$buttons.addClass('col')
		$buttons.append($buttonGroup)

		$row.append([$units, $name, $buttons])

		return $row
	}

	createButton(symbol, style) {
		let b = $('<span>')
		b.addClass('btn border small m-1 p-1')
		b.addClass(style)
		b.html(symbol)
		return b
	}
	clear() {
		this.items = {}
		Application.saveCart(this)
		$('#cart').trigger('click')
	}

}
export default Cart