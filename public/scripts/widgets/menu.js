/**
 * Menu shows all items categorized.
 * The categories appear in left column as a list.
 * The list items on click, shows the items in 
 * right column.
 * Same item may appear in multiple categories
 */


import Item     from '../model/item.js';
import Category from './category.js';
import Action   from '../action.js';
import Application   from '../app.js';

const CATEGORY_LABELS = {
	'veg' : 'Vegeterian',
	'non-veg': 'Non-vegeterian',
	'seffood': 'Seafood'
}

class Menu {
	constructor() {
		this.categories = {}
	}
	
	createHeaderRow() {
		var $row = $('<div>')
		$row.attr('id', 'menu-header')
		$row.addClass('row')

		var $header = $('<label>')
		$header.addClass('col col-12 text-center')
		$header.text('Menu')

		$row.append($header)

		return $row
	}

	/**
	 * populates two pre-defiened DOM elements
	 * '#category-column' shows a list of iten categories
	 * '#category-items'  shows a list of items with images
	 */
	render() {
		var $itemColumn     = Application.$el('#category-items')
		var $categoryList   = Application.$el('#category-list')
		for (var label in this.categories) {
			var $li = this.categories[label].render($itemColumn)
			$categoryList.append($li)
		}
		$categoryList.children().first().trigger('click')
	}
	
	/**
	 * categorizes given item
	 * @return dictionary of categories 
	 * indexed by category label
	 * 
	 */
	categorize(items) {
		for (var i = 0; i < items.length; i++) {
			var item = new Item(items[i])
//			console.log('item ' + item.sku + ' is in ' + cats + ' categories')
			if (!item.category) {
				this.categorizeItemByLabel('uncategorized', item)
			} else {
				var label = this.mapCategoryLabel(item.category)
				this.categorizeItemByLabel(label, item)
			}
		}
	}

	mapCategoryLabel(category) {
		return (category in CATEGORY_LABELS) ? CATEGORY_LABELS[category] : 'Uncategorized' 
	}

	categorizeItemByLabel(label, item) {
		var categoryObj
		if (label in this.categories) {
			categoryObj = this.categories[label]
		} else {
			categoryObj = new Category(label)
			this.categories[label] = categoryObj
		}
		categoryObj.items.push(item)
	}
	/**
	 * fetch all items from server. on completion
	 * of this asynchronous call, the items are
	 * categories and rendered
	 */
	fetchItemCatalog($container) {
		Action.fetchItemCatalog((items) => {
			this.categorize(items)
			$container.append(this.render())
		})
	}

}

export default Menu