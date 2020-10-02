import Counter     from '../widgets/counter.js';
import BasicDialog from './basic-dialog.js';
import Application from '../app.js'
import Cart 	   from '../model/cart.js'

const MAX_ROWS = 4
const MAX_COLS = 40
const MAX_LENGTH = MAX_ROWS * MAX_COLS;
/**
 * form to order a food item.
 */
class OrderForm extends BasicDialog {
	constructor(item) {
		super('ordr-item-dialog')
		this.item  = item
		this.$counter = new Counter()
		this.$comment = this.createCommentSection()
		this.$dialog  = this.createModalDialog(
				this.$counter, this.$comment)
	}
	
	open() {
		this.$dialog.modal('show')
	}
	
	
	createModalDialog($conter, $comment) {
		var $dialog  = $('<div>')
		$dialog.addClass('modal')
		var $modal   = $('<div>')
		$modal.addClass('modal-dialog')
		$modal.append(this.createContent())
		$dialog.append($modal)
		
		return $dialog
	}
	
	/**
	 * create elements that are dialog 
	 * content
	 */
	createContent() {
		var $content = $('<div>')
		$content.addClass('modal-content  mx-2')
		$content.append(
				this.createHeader(), 
				this.createBody(), 
				this.createFooter())
		return $content
	}
	
	createHeader() {
		var $header  = $('<div>')
		var $title   = $('<h2>')
		$header.addClass('modal-header')
		
		$title.text('Order')
		var $close = $('<button>')
		$close.addClass('close')
		$close.attr('data-dismiss', 'modal')
		$close.html('&times;')
		
		$header.append($title, $close)
		return $header
	}
	
	createBody() {
		var $body = $('<div>')
		$body.addClass('modal-body container-fluid m-1 p-4')
		$body.append(this.item.render('form'))
		
		$body.append(this.comment)
		
		return $body
	}
	
	/**
	 * dialog footer houses the buttons
	 */
	createFooter() {
		var $footer  = $('<div>')
		$footer.addClass('modal-footer my-1')
			
		var $group1 = $('<div>')
		$group1.addClass('btn-group')

		var $addItem = $('<button>')
		$addItem.text('add')
		$addItem.attr('id', `order-item-${this.item.sku}`)
		$addItem.addClass('btn btn-primary')
		// gets Cart from DOM
		var cart = $('#cart').data('cart')
		$addItem.on('click', () => {
			this.$dialog.modal('hide')
			cart.addLineItem(this.item, this.$counter.val(), this.$comment.val())
		})

		$group1.append(this.$counter.render(), $addItem)
		$footer.append($group1)
		
		return $footer
	}
	
	createCommentSection() {
		var $comment = $('<textarea>')
		$comment.addClass('m-1')
		$comment.attr('rows', MAX_ROWS)
		$comment.attr('cols', MAX_COLS)
		$comment.attr('maxlength', MAX_LENGTH)
		$comment.attr('readonly', false)
		$comment.attr('required', false)
		$comment.attr('wrap', 'hard')
		$comment.attr('placeholder', 
		   'any comment (' + MAX_LENGTH + ' chars max)')
		
		$comment.on('change', function() {
			var text = $(this).val()
			if (text >= MAX_LENGTH) {
				$(this).attr('readonly', true)
			}
		})
		return $comment
	}
}
export default OrderForm