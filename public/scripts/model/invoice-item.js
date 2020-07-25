import Amount from "../widgets/amount.js"

class InvoiceItem {
	constructor(obj) {
		//console.log('create invoice item from')
		//console.log(obj)
		this.kind 	= obj['kind']
		this.amount = obj['amount']
		this.description = obj['description']
		
	}
	
	/**
	 * renders as a row
	 */
	render() {
		var $row = $('<div>')
		$row.addClass('d-flex flex-row justify-content-between no-gutters')

		let style =  ''
		if (this.kind == 'TAX') 	 style = 'text-danger' 
		if (this.kind == 'DISCOUNT') style = 'text-success' 
		$row.append(
			this.makeColumn('col-4 flex-grow-1', this.description, style),
			this.makeAmountColumn('col-2', this.amount))
		return $row
	}

	makeColumn(col, text, style) {
		let $col = $('<div>')
		$col.addClass(col)

		let $label = $('<label>')
		if (style) $label.addClass(style)
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

export default InvoiceItem