const CURRENCY_SYMBOL = '&#x20B9;'

class Amount {
	constructor(value) {
		this.value = value
	}
	render(options) {
		var $span = $('<span>')
		$span.addClass('p-2')
		var html = (options && options.showCurrencySymbol ? CURRENCY_SYMBOL : '')
			 + Math.abs(this.value).toFixed(2)
		$span.html(html)  
		return $span
	}
}

export default Amount