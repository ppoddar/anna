import User from  './model/user.js'
import Cart from  './model/cart.js'
import Order from  	 './model/order.js'
import Invoice from  './model/invoice.js'
import Address from  './model/address.js'

/** ---------------------------------------------------------------
 * 		Main application
 * 
 * Main application consistes of many pages that are all housed in a single page.
 * This single page (app.html) has a Navigation Bar, main area and footer.
 * Each page renders these areas.
 * This main application populates a page with contextual variable (such as 
 * delivery address which is collected as user input in one page and required
 * in another) prior to rendering a page.
 * 
 * Main application also maintains state (user and cart) in local and session storage.
 * 
 * The shared state is saved and retrieved
 * to and from local storage for user and
 * session storage for cart.
 * 
 * The objects can only be stored as JSON string.
 * This class receives and retrieves then as
 * objects.
 * 
 * local storage has longer lifetime than session
 * storage.
 * 
 */
const USER_KEY      = 'user'
const CART_KEY      = 'cart'
const ORDER_KEY     = 'order'
const INVOICE_KEY   = 'invoice'
const BILLING_ADDRESS_KEY  = 'billing-address'
const DELIVERY_ADDRESS_KEY = 'delivery-address'

/**
 * each part of the application is represented by a page.
 * A page initializes itself from local/session storage. 
 */
const PAGES = {
	'customer'  : {title:'order',   page: 'html/customer/index.html'},
	'delivery'	: {title:'deliver', page: 'html/delivery/index.html'},
	'packing'   : {title:'pay',     page: 'html/packing/index.html'},
	'kitchen'	: {title:'kitchen', page: 'html/kitchen/index.html'},
	'admin'	    : {title:'kitchen', page: 'html/admin/index.html'}
}
	
class Singleton {
	static getInstance() {
		if (!Singleton.instance) {
			Singleton.instance = new Application()
		}
		return Singleton.instance
	}
}

class Application {
	/**
	 * Starting point of application.
	 * Open home page for current user.
	 * 
	 */
	open() {
		let user = this.getUser(true)
		console.assert(user.home in PAGES, `no page assigned to ${user.home}`)
		window.location = PAGES[user.home].page
	}

	getOrder() {
		return new Order(this.getItem(ORDER_KEY))
	}

	saveOrder(order) {
		return this.saveItem(ORDER_KEY, order)
	}

	getInvoice() {
		return new Invoice(this.getItem(INVOICE_KEY))
	}

	saveInvoice(invoice) {
		return this.saveItem(INVOICE_KEY,invoice)
	}

	getBillingAddress() {
		return new Address(this.getItem(BILLING_ADDRESS_KEY))
	}

	saveBillingAddress(addr) {
		return this.saveItem(BILLING_ADDRESS_KEY, addr)
	}

	getDeliveryAddress() {
		return new Address(this.getItem(DELIVERY_ADDRESS_KEY))
	}

	saveDeliveryAddress(addr) {
		return this.saveItem(DELIVERY_ADDRESS_KEY, addr)
	}

	/**
	 * get an item from session storage
	 * @param {string} key 
	 * @returns JSON parsed object
	 */
	getItem(key) {
		let item = sessionStorage.getItem(key)
		console.assert(item, `${key} not in session storage`)
		return JSON.parse(item)
	}

	saveItem(key, data) {
		console.assert(data, `can not save undefiend/null data for ${key}`)
		console.log(`saving [${key}] ...`)
		console.log(data)
		sessionStorage.setItem(key, JSON.stringify(data))
	}
	/**
	 * fiils in main section of current page with given input.
	 * 
	 * @param {*} key key of the page
	 * @param {*} input dictionary of input
	 */
	fillSection(page, input) {
		//console.assert(key in PAGES, `no page with ${key}. Known pages are ${Object.keys(PAGES)}`) 
		
		//let obj = PAGES[key]
		//let page = Object.create(obj.page)
		if (input) page.init(input)

		let $main = this.$el('main')
		//this.$el('page-title').text(obj.title)

		$main.empty()
		$main.append(page.render())
		return page
	}
	/**
	 * gets current user from local storage.
	 * 
	 * @param mustExist
	 * 
	 * @returns undefined if no user in local storage
	 * or throws exception id mustExist is true
	 */
	getUser(mustExist) {
		var userString = localStorage.getItem(USER_KEY)
		if (!this.isNull(userString)) {
			return new User(JSON.parse(userString))
		} else if (mustExist) {
			throw new Error('***ERROR no ' + USER_KEY + ' in local storage')
		} else {
			return null
		}
	}
	
	/**
	 * saves session in local storage. 
	 * Session id becomes auth token for user
	 * The user must have auth token
	 */
	
	saveSession(session) {
		var user = session.user
		user['auth'] = session.id
		//console.log('saved session ' + user.id + ':' + user.auth)
		localStorage.setItem(USER_KEY, JSON.stringify(user))
	}

	/**
	 * retrieves cart object from sesssion storage.
	 * If not, creates an empty cart.
	 * @param {*} mustExist 
	 */
	getCart() {
		let cartString = sessionStorage.getItem(CART_KEY)
		let cart
		if (cartString) {
			cart = new Cart(JSON.parse(cartString))
		} else {
			console.log('creating empty cart')
			cart = new Cart({})
			this.saveCart(cart)
		}
		return cart
	}

	/**
	 * cart is saved in session storage
	 * @param {Cart} cart 
	 */
	saveCart(cart) {
		sessionStorage.setItem(CART_KEY, JSON.stringify(cart))
	}

	/**
	 * clears user from local storage 
	 */
	clearUser() {
		localStorage.removeItem(USER_KEY)
	}
	/**
	 * clears cart from session storage
	 */
	clearCart() {
		this.getCart()
		sessionStorage.removeItem(CART_KEY)

	}
	
		
	isNull(obj) {
		return (obj == undefined)
			|| (obj == null)
			|| (obj == 'undefined')
			|| (typeof obj === 'undefined');
	}
	

	/**
	 * gets exiting DOM element with given id.
	 * 
	 * @param id id of a DOM element.
	 * if does not start with '#', it would be added
	 * @throws error if no DOM elemnt exists
	 */
	$el(id) {
		var domId = (id.startsWith('#') ? '' : '#') + id
		var $el = $(domId)
		if ($el.length == 0) {
			throw new Error('no DOM element with id [' + domId + ']')
		} else {
			return $el
		}
	}
	
}

export default Singleton.getInstance()