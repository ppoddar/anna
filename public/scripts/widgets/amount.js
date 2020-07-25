const CURRENCY_SYMBOL = '&#x20B9;'

class Amount {
	constructor(value) {
		this.value = value
	}
	render() {
		var $span = $('<span>')
		$span.addClass('p-2')
		var html =  this.toCurrency(this.value)
		$span.html(html)  
		return $span
	}
	
	
	toCurrency(v) {
		var str = (v < 0) ? '-' : ''
		str += CURRENCY_SYMBOL
		str += Math.abs(v).toFixed(2)
		return str
	}
	
}

export default Amount