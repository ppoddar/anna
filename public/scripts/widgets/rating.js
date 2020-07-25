const MAX_RATING = 5
const FILLED   = '/images/star-filled.svg'
const UNFILLED = '/images/star-unfilled.svg'

/**
 * Renders Ratings with five stars.
 * The stars are filled to represent rating.
 * If a star is clicked, that becomes the rating
 * and stars are filled accordingly
 */
class Rating  {
	constructor(value, editable) {
		this.rating = value
		this.editable = editable
		this.stars  = []
		for (var i = 1; i <= MAX_RATING; i++) {
			this.stars.push(this.createStar(i,editable))
		}
	}
	
	/**
	 * create a star.
	 * a star is filled if given index is less 
	 * than or equal to current rating represented by 
	 * this component, otherwise it is empty.
	 * 
	 */
	createStar(i,editable) {
		var $star = $('<img>')
		$star.attr('src', (i <= this.rating ? FILLED : UNFILLED))
		if (editable) {
			$star.on('click', this.handleClick.bind(this,i))
		} 
		return $star;
	}
	
	render() {
		var $div = $('<div>')
		for (var i = 0; i < MAX_RATING; i++) {
			var $star = this.stars[i]
			$star.attr('src', i < this.rating ? FILLED : UNFILLED)
			$div.append($star)
		} 
		return $div
	}
	
	handleClick(i) {
		this.rating = i
		for (var i = 0; i < MAX_RATING; i++) {
			var img = (i < this.rating) ? FILLED : UNFILLED
			this.stars[i].attr('src', img)
		} 
	}
}

export default Rating