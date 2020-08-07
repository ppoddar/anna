import LoginDialog from './forms/login-dialog.js'
import User from './model/user.js'
/** ---------------------------------------------------------------
 * 		Main application
  
 * local storage has longer lifetime than session
 * storage.
 * ----------------------------------------------------------------
 */
const USER_KEY = 'user'
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

	constructor () {
		if (this.user != null) return
		var user = localStorage.getItem(USER_KEY)
		if (user) this.user = new User(JSON.parse(user))

		const cookie = this.readCookie(COOKIE_NAME)
		if (cookie != null) {
			try {
				const parsed = JSON.parse(cookie)
				if (parsed != null) {
					console.log(`================= setting user from cookie ${parsed}`)
					this.user = parsed
				}
			} catch (e) {
				console.warn(`invalid cookie for hiraafood ${cookie}. can not parse as a JSON`)
			}
		} else {
			console.warn(`application user can not be initailized from cookies. No cookie ${COOKIE_NAME}. Must set user by other means`)
		}
	}
	

	setUser(u) {
		console.log(`============== settting user ${u.id} for session ${u.session} ==================`)
		this.user = u
		localStorage.setItem(USER_KEY, JSON.stringify(u))
	}


	/**
	 * Starting point of application.
	 * Note: must set an authenticated user before open(), otherwise 
	 * LoginDialog will open
	 */
	open() {
		if (this.user) {
			console.log(`==================== opening application for ${this.user.id}`)
			window.location = PAGES[this.user.home].page
		} else {
			new LoginDialog().open()
		}

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

	/*
	/**
	 * gets exiting DOM element with given id.
	 * 
	 * @param id id of a DOM element.
	 * if does not start with '#', it would be added
	 * @throws error if no DOM elemnt exists
	 
	$el(id) {
		var domId = (id.startsWith('#') ? '' : '#') + id
		var $el = $(domId)
		if ($el.length == 0) {
			throw new Error('no DOM element with id [' + domId + ']')
		} else {
			return $el
		}
	}
	*/
	// ---------------------------------------------------------
	createCookie (name, value, days) {
		console.log(`createCookie for ${days} days ${JSON.stringify(value)}`)
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		}
		else var expires = "";
		document.cookie = name + "=" + JSON.stringify(value) + expires + "; path=/";
	}
	/*
	 * reads cookie from document. 
	 * @return string value of a cookie. Which is a JSON string
	 */
	readCookie (name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		console.log(`reading document cookie for ${name} cookie`)
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) {
				var cookieString = c.substring(nameEQ.length, c.length)
				//cookieString = decodeURIComponent(cookieString)
				console.log(`found cookie: ${name}  = ${cookieString}`)
				return cookieString;
			}
		}
		console.warn(`readCookie: no cookie (${name}) found. Returning null`)
		return null;
	}

	eraseCookie (name) {
		//createCookie(name, "", -1);
	}
}

//alert(Singleton.getInstance() == Singleton.getInstance())

export default Singleton.getInstance()
