// menu is categoried
// each category has a list of Item
import Item from './item.js'
class Menu {
    constructor(items) {
        this.categories = {}
        this.categorize_items(items)
    }

    /**
   * given an array of items, categorize them into bins.
   * @returns a map of array of items indexed by category name 
   */
   categorize_items(items) {
    console.log(`categorize_items ${items.length} items`)
    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      // an item has one opr more category separated by comma
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
  }

  get_categories() {
      return Object.keys(this.categories)
  }

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