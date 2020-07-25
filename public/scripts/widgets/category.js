/**
 * represents a list of items belonging to 
 * a category 
 */
import Item from '../model/item.js';


class Category {
	/**
	 * create a category with a label
	 */
   constructor(label) {
	   this.label = label
	   this.items = []
   }
   
   /**
    * renders a category.
    * A category renders as a list
    * The list element on click shows all items
    * of this category in separate given container
    * 
    * @param $itemContainer the container where
    * the items will be rendered
    * @param a order (optional) if defined, an
    * 'order' button will be rendered to add the item
    * to the order
    */
   render($itemContainer) {
	   var $li = $('<li>')
	   var $text  = $('<span>')
	   $text.addClass('category-label')
	   $text.addClass('h6 small')
	   var $badge = $('<span>')
	   $text.text(this.label)
	   $badge.addClass('badge badge-primary mr-2')
	   $badge.text(this.items.length)
	   $li.on('click', () => {
	//	   console.log(`category ${this.label} clicked`)
		   $('.category-label').removeClass('font-weight-bold')
		   $(this).find('.category-label').addClass('font-weight-bold')
		   this.renderItems($itemContainer)
		})
	   $li.append($badge, $text)
	   return $li
   }
   /**
    * render list of item in given container
    * emptying it first
    */
   renderItems($container) {
	   $container.empty()
	   var $list = $('<div>')
	   $list.addClass('container-fluid')
	   //console.log('render ' + this.items.length + ' items')
	   for (var i = 0; i < this.items.length; i++) {
		   var $item = this.items[i].render('list')
		   var $hr = $('<hr>')
		   $hr.addClass('solid')
		   $list.append($item, $hr)
	   }
	   $container.append($list)
   }
}

export default Category