import LoginDialog from './forms/login-dialog.js'
import User from './model/user.js'
import Alert from './forms/alert.js'
import Action from './action.js'
/** ---------------------------------------------------------------
 * 		Main application
 * 
 * local storage has longer lifetime than session
 * storage.
 * ----------------------------------------------------------------
 */
const USER_KEY    = 'user'
const INVOICE_KEY = 'invoice'
const BILLING_ADDRESS_KEY = 'billing-address'
const DELIVERY_ADDRESS_KEY = 'delivery-address'

var user
/**
 * each part of the application is represented by a page.
 * By default, user.role points to its home page
 * However, an user can set his/her own home page
 * A page initializes itself from local/session storage. 
 */
const PAGES = {
	'customer': { title: 'order', page: '/html/customer/menu.html' },
	'delivery': { title: 'deliver', page: 'html/delivery/index.html' },
	'packing': { title: 'pay', page: 'html/packing/index.html' },
	'kitchen': { title: 'kitchen', page: 'html/kitchen/index.html' },
	'admin': { title: 'kitchen', page: 'html/admin/index.html' }
}
const COOKIE_NAME='hiraafood'

var Singleton = (function () {
    var instance;
 
    function createInstance() {
		instance = new Application()
		return instance;
    }
 
    return {
        getInstance: function () {
            if (instance == null) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

class Application {
	constructor () {
		console.log(`creating Application`)
		var user = localStorage.getItem(USER_KEY)
		if (user) {
			this.user = new User(JSON.parse(user))
		} else {
			console.log(`no user is defined in localstorage by key ${USER_KEY}`)
		}
	}

	/** ---------------------------------------------------------------
	 * Starting point of application.
	 * 
	 * Note: must set an authenticated user before open(), otherwise 
	 * LoginDialog will open
	 * ----------------------------------------------------------------
	 */
	open() {
		const loginOptions = {title:'Login', role:'customer'}
		if (this.user) {
			console.log(`current user ${JSON.stringify(this.user)}`)
			Action.isLoggedIn(this.user.id, (err,response)=>{
				if (err) {
					new LoginDialog(loginOptions).open()
				} else {
					const homepage = this.getHomePage(this.user)
					console.log(`==================== opening application for ${this.user.id} home page=${homepage}`)
					window.location = homepage
				}
			})
		} else {
			new LoginDialog(loginOptions).open()
		}
		
	}

	/*
	 * A home page can be defined for each user. If not defined, an homepage
	 * is decided by role of the user. 
	 */
	getHomePage(user) {
		if (user.home) {
			return PAGES[this.user.home].page
		} else {
			const role = user.role
			if (role in PAGES) {
				return PAGES[role].page
			} else {
				new Alert('ERROR', `user ${user.id} in ${user.role} role has no home page`)
			}
		}
	}

	/**
	 * get an item from session storage
	 * @param {string} key 
	 * @returns JSON parsed object
	 */
	 getItem(key) {
		let item = sessionStorage.getItem(key)
		if (!item) {
			const message = `${key} is not found. This error can happen if ${key} has not been saved earlier`
			new Alert("error", message).open()

			throw new Error(message)
		}
		return JSON.parse(item)
	}

	saveItem(key, data) {
		console.assert(data, `can not save undefiend/null data for ${key}`)
		console.log(`saving [${key}] ...`)
		console.log(data)
		sessionStorage.setItem(key, JSON.stringify(data))
	}

	setUser(u) {
		console.log(`============== settting user ${u.id} for session ${u.session} ==================`)
		this.user = u
		localStorage.setItem(USER_KEY, JSON.stringify(u))
	}

	getCurrentUser(mustExist) {
		if (this.user) {
			console.log(`current application user ${this.user.id}`)
			return this.user
		}
		if (mustExist) {
			console.warn(`no current user. opening login dialog`)
			new LoginDialog().open()
		}
		console.warn(`no current user. returning null`)
		return user
	}

	/*
	 * ----------------------------------------------------------------
	 * gets and saves objects between pages in session storage
	 * The objects are JSONified for storage
	 * The caller must parse the result to object of his/her choice
	 */
	getInvoice () {
		return this.getItem(INVOICE_KEY)
	}

	saveInvoice (invoice) {
		return this.saveItem(INVOICE_KEY, invoice)
	}

	getBillingAddress () {
		return this.getItem(BILLING_ADDRESS_KEY)
	}

	saveBillingAddress (addr) {
		return this.saveItem(BILLING_ADDRESS_KEY, addr)
	}

	getDeliveryAddress () {
		return this.getItem(DELIVERY_ADDRESS_KEY)
	}

	saveDeliveryAddress (addr) {
		return this.saveItem(DELIVERY_ADDRESS_KEY, addr)
	}

	logout () {
		window.location = '/'
		this.user = null
	}
}

export default Singleton.getInstance()
