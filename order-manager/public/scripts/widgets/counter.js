/**
 * a widget similar to a spinner
 */
class Counter {
	
	constructor() {
		this.$units = this.createButton('1')
	}
	/**
	 * renders as pair of buttons to increment
	 * and decrement a number
	 */
	render() {
		var $inc = this.createButton('&plus;')
		var $dec = this.createButton('&minus;')
		
		$inc.on('click', this.increment.bind(this))
		$dec.on('click', this.decrement.bind(this))
		this.$units.text('1')
		this.$units.addClass('col-sm-1')
		
		var $group = $('<div>')
		$group.addClass('btn-group border')
		$group.append($dec, this.$units, $inc)
		
		return $group
	}
	
	increment() {
		var val = this.val()
		this.$units.text( (val+1).toString())
		
	}
	decrement() {
		var val = this.val()
		if (val <= 1) return;
		this.$units.text( (val-1).toString())
	}
	
	createButton(symbol, cls) {
		var $button = $('<button>')
		$button.attr('type', 'button')
		$button.addClass('btn')
//		$button.css('width', '30px')
//		$button.css('height', '30px')
//		$button.css('border-radius', '15px')
//		$button.css('font-size', '24px')
		$button.css('text-align', 'center')
		$button.css('border','none')
		$button.html(symbol)
		$button.addClass('btn font-weight-bold')
		return $button
		
	}
	
	val() {
		return parseInt(this.$units.text())
	}
}

export default Counter