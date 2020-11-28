import OrderItem from './order-item.js'
/**
 * A cart contains a set of lineitems to be ordered.
 * Each line item is indexed by Item SKU.
 * A cart is attached to a DOM element and acts both 
 * as a model and a view.
 */

class Cart {
    constructor($dom) {
		this.items = {}
		this.$dom = $dom
	}
//  ===========================================================
//     Cart as a model
//  ===========================================================
	isEmpty() {
		return Object.keys(this.items).length == 0
	}

	clear() {
		this.items = {}
		Application.saveCart(this)
		this.render()
	}
	/**
	 * adds/updates a order item.
	 */
    addLineItem(item, units, comment) {
		let sku = item.sku
        if (sku in this.items) {
			let existing = this.items[sku]
            //console.log(`addLineItem ${units} to update existing item-${sku}`)
			existing.units  += units 
			if (comment) existing.comment = comment 
        } else {
			//console.log(`addLineItem ${units} to new item ${sku}`)
			this.items[sku] = new OrderItem({
				sku: item.sku,
				name:item.name, 
				image: item.image,
				units:units, 
				comment:comment})
        }
		this.render() // updates the view
        return this
	}
	
	reduceLineItem(item, units) {
		let sku = item.sku
        if (sku in this.items) {
			let existing = this.items[sku]
            //console.log(`addLineItem ${units} to update existing item-${sku}`)
			existing.units  += units 
		} 
		this.render() // updates the view
    }

//  ---------------------------------------------------------
//      Cart as a view
//  ---------------------------------------------------------	
	/**
	 * renders each line item and appends it t DOM element
	 */
	render() {
		this.$dom.empty()
		if (this.isEmpty()) {
			let $label = $('<label>')
			$label.text('empty')
			$label.addClass('text-muted')
			this.$dom.append($label)
		} else {
			for (var sku in this.items) {
				var li   = this.items[sku]
				var $p = this.createLineItem(li)
				this.$dom.append($p)
			}
		}
	}

	createLineItem(li) {
		let addButton = this.createButton('&plus;', 'text-success')
		addButton.on('click', ()=>{
			li.units += 1
		 	$('#cart').trigger('click')
		})

		let reduceButton = this.createButton('&minus;', 'text-danger')
		reduceButton.attr('disabled', li.units>1)
		reduceButton.on('click', ()=>{
			li.units -= 1
		 	$('#cart').trigger('click')
		})

		let removeButton = this.createButton('&cross;', 'text-danger')
		removeButton.on('click', ()=>{
			delete this.items[li.sku]
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

	/*
	 * create a button to add/subtract or remove an ordered item
	 * @param symbol symbol on the button
	 * @param style button style 
	*/
	createButton(symbol, style) {
		let b = $('<span>')
		b.addClass('btn border small m-1 p-1')
		b.addClass(style)
		b.html(symbol)
		return b
	}
	

}
export default Cart