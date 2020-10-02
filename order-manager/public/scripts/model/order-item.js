import Amount from "../widgets/amount.js"

class OrderItem {
	constructor(obj) {
		this.sku     = obj['sku']
		this.name    = obj['name']
		this.image   = obj['image']
		this.units   = obj['units']
		this.comment = obj['comment']
		this.price   = obj['price']
	}
	
	/**
	 * renders as a row
	 */
	render(options) {
		var $row = $('<div>')
		$row.addClass('d-flex flex-row justify-content-between no-gutters')
		$row.append(
			this.makeImageColumn('col-4', this.image), 
			this.makeColumn     ('col-1', this.units), 
			this.makeColumn    ('col-5 flex-grow-1 font-weight-bold', this.name),
			this.makeAmountColumn('col-2', this.price))
		return $row
	}


	makeColumn(col, text, bold) {
		let $col = $('<div>')
		$col.addClass(col)

		let $label = $('<label>')
		if (bold) $label.css('font-weight', 'bold')
		$label.text(text)
		$col.append($label)
		return $col
	}

	makeImageColumn(col, img) {
		let $col = $('<div>')
		$col.addClass(col)

		let $image = $('<img>')
		$image.addClass('img-fluid')
		$image.attr('src', img)
		$image.attr('width', '64px')
		$image.attr('height', '64px')
		$col.append($image)
		return $col
	}

	makeAmountColumn(col, amount) {
		let $col = $('<div>')
		$col.addClass(col)
		let $amount = new Amount(amount).render()
		$col.append($amount)
		return $col
	}
}

export default OrderItem