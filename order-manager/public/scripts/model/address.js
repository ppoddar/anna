/**
 * an address is a renderable class.
 * A renderable class creates a div (with minmal style)
 * that acts as a container of content.
 *  
 */
class Address {
	constructor(obj) {
		//console.log(obj)
		console.assert('id'    in obj, `missing [id] in object`)
		console.assert('kind'  in obj, `missing [kind] in object`)
		console.assert('line1' in obj, `missing [line1] in object`)
		console.assert('zip'   in obj)
		this.id      = obj['id']
		this.kind    = obj['kind']
		this.line1   = obj['line1']
		this.line2   = obj['line2']
		this.city    = obj['city']
		this.zip     = obj['zip']
		this.phone   = obj['phone']
		this.tips    = obj['tips']
	}
	/**
	 * render an address
	 */
	render(opts) {
		let options = opts || {}
		var $div   = $('<div>')
		$div.addClass('address')
		$div.addClass('m-1 p-1')
		$div.append(
			this.textLine(this.line1),
			this.textLine(this.line2),
			this.textLine(this.city),
			this.textLine(this.zip),
			this.textLine(this.phone))
		return $div
	}

	textLine(text) {
		if (text) {
			var $line = $('<p>')
			$line.addClass('address-line')
			$line.text(text)
			return $line
		}
	}
}


export default Address