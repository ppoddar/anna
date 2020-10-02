import Amount from "../widgets/amount.js"

const STYLES = {
	'TAX':      'text-danger',
	'DISCOUNT': 'text-success',
	'PRICE':     '',
	'TOTAL':     'invoice-total'
}
/*
 * a model object 
 */
class InvoiceItem {
	constructor(obj) {
		this.kind 	= obj['kind']
		this.amount = obj['amount']
		this.description = obj['description']
		
	}
	
	/**
	 * renders as a row
	 */
	render(opts) {
		const options = opts || {}
		var $row = $('<div>')
		//$row.addClass('d-flex flex-row justify-content-between no-gutters')
		$row.addClass('row no-gutters invoice-item')
		const col1 = options['description-column'] || 'col-8'
		const col2 = options['amount-column']      || 'col-4'

		let style = STYLES[this.kind]
		let $col1 = $('<div>')
		$col1.addClass(col1)

		let $label = $('<label>')
		$label.addClass(style)

		$label.text(this.description)
		$col1.append($label)

		let $col2 = $('<div>')
		$col2.addClass(col2)
		let $amount = new Amount(this.amount).render(options)
		$amount.addClass(style)
		$col2.append($amount)

		$row.append($col1, $col2)
		return $row
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
}

export default InvoiceItem