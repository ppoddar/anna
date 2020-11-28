// menu is categoried items
// each category has a list of Item
import Item from './item.js'
class Menu {
    constructor(items) {
        this.categories = {}
        this.categorize_items(items)
    }

  /**
   * given an array of items, categorize them into bins.
   * @returns a map of array of items indexed by category name.
   * An item may belong to multiple categories 
   */
   categorize_items(items) {
    console.log(`categorize_items ${items.length} items`)
    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      // an item has one or more category separated by comma
      var categories = item.categories.split(',')
      //console.log(`item ${item.sku} ${categories.length} categories: ${item.categories}`)
      // items in a category is in a list. an item may be in multiple categories
      for (var j = 0; j < categories.length; j++) {
        var category = categories[j]
        var list =  (category in this.categories) ? this.categories[category] : []
        list.push(new Item(item))
        this.categories[category] = list
      }
    }
    for (var c in this.categories) {
      const items = this.get_items(c)
      console.log(`category ${c} has ${items.length} items`)
    }

  }

  /*
   * get list of all category names
   */
  get_categories() {
      return Object.keys(this.categories)
  }

  /*
   * get list of items in given category
   */
  get_items(category) {
      if (category in this.categories) {
        return this.categories[category]
      } else {
          console.error(`menu has no category ${category}`)
          return []
      }
  }
}

export default Menu