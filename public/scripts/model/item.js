/**
 * represents a food item to be ordered.
 */

import Amount from    '../widgets/amount.js'
import Rating from    '../widgets/rating.js'
import OrderForm from '../forms/order-form.js'

class Item {
	/**
	 * create an item from data
	 */
	constructor(obj) {
		// console.log('item.create()')
		// console.log(obj)
		this.sku        = obj['sku']
		this.name       = obj['name']
		this.description = obj['description']
		this.price  = obj['price']
		this.rating = obj['rating']
		// image URL is absolute
		this.image  = this.absolute(obj['image'])
		// server send as comma-separted string
		this.category   = obj['category'] || ''
		let tags        = obj['tags'] || ''
		this.tags       = tags.split(',')
	//	console.log('item.created ')
	//	console.log(this)
	}
	absolute(s) {
		if (!s) return '/'
		if (s.startsWith('/')) return s
		return '/'+s
	}
	
	/**
	 * creates a row. The first column shows image,
	 * second column details.
	 * @param 
	 */
	render(view) {
		var $img = $('<img>')
		$img.attr('src', this.image)
		$img.addClass('img-fluid')
		$img.css('display', 'block')
		
		var $orderButton = $('<button>')
		$orderButton.addClass('btn btn-primary btn-sm my-1 order-button')
		$orderButton.text('order')
		$orderButton.on('click', () => {new OrderForm(this).open()})
			
		var $title = $('<p>')
		$title.addClass('item-name' )
		$title.text(this.name)
		
		var $category = $('<p>')
		$category.addClass('item-category' )
		$category.text(this.category)

		var $tags = $('<p>')
		for (var i = 0; this.tags && i < this.tags.length; i++) {
			var $tag = $('<span>')
			$tag.addClass('item-tag' )
			$tag.text(this.tags[i])
			$tags.append($tag)
		}

		var $description = $('<p>')
		$description.addClass('item-description' )
		$description.text(this.description)

		var $price  = new Amount(this.price).render()
		var $rating = new Rating(this.rating, false).render()

		var $row = $('<div>')
		var $col1 = $('<div>')
		var $col2 = $('<div>')
		$row.addClass('row')
		$col1.addClass('col')
		$col2.addClass('col')
		$row.append($col1, $col2)
		if ('list' === view) {
			$col1.append($img, $price, $rating, $orderButton)
			$col2.append($title, $category, $tags)
			return $row
		} else if ('form' === view) {
			$col1.append($img, $price, $rating)
			$col2.append($title, $description, $category, $tags)
			return $row
		} else {
			throw new Error('unknown view [' + view + ']')
		}
		
		return $row
	}
	
}

export default Item