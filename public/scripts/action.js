import Application from './app.js'
import LoginDialog from './forms/login-dialog.js'
import Alert from './forms/alert.js'

const DEBUG = true
/**
 * Action carries out all server side requests via AJAX on behalf
 * of clients.
 * The response is transmitted back to the caller via callback.
 */
class Action {
	/**
	 * Fetch addresses of current user
	 * @param {} cb 
	 */
	static async fetchAddress(cb) {
		var user = Application.getUser(true)
		$.ajax({
			url : `/user/addresses/?uid=${user.id}`,
			headers: Action.authHeader()
		}).done(function(addresses) {
			if (DEBUG) console.log(`fetched ${Object.keys(addresses)} addresses for user [${user.id}]`)
			if (DEBUG) console.log(addresses)
			cb.call(null, addresses)
		}).fail(function(err){
			console.log(err)
		})
	}

	static fetchItemCatalog(cb) {
		//console.log('fetching items')
		var url = '/item/catalog'
		$.ajax({
			url: url,
			contentType: 'application/json'
		}).done(function(items) {
			//console.log(`fetched ${items.length} items`)
			cb.call(null, items)
		})
	}

	static createUser(user, cb) {
		$.ajax({
			url: '/user/',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(user)
		}).done(function (response) {
			cb.call(response)
		}).fail(function(err){
			console.log(err)
			alert(JSON.stringify(err))
		})
	}

	/**
	 * creates a new order by content of the cart
	 * @param {*} cart 
	 * @param {*} callback 
	 */
	static createOrder(items, callback) {
		if (DEBUG) console.log('checkout cart items')
		if (DEBUG) console.log(items)
		$.ajax({url:`/order/?uid=${Action.getCurrentUser().id}`,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(items),
			headers: Action.authHeader()
		}).done(function(order) { 
			if (DEBUG) console.log('received order')
			if (DEBUG) console.log(order)
			callback.call(null, order)
		}).fail(function(err){
			console.log(err)
		})		
	}

	static createInvoice(order, deliveryAddress, billingAddress, callback) {
		console.log('creating invoice')
		let payload = {
			deliveryAddress: deliveryAddress,
			billingAddress : billingAddress
		}
		$.ajax({url:`/invoice/?uid=${Action.getCurrentUser().id}&oid=${order.id}`,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(payload),
			headers: Action.authHeader()
		}).done(function(invoice) { 
			if (DEBUG) console.log('received invoice')
			if (DEBUG) console.log(invoice)
			callback.call(null, invoice)
		}).fail(function(err){
			console.log(err)
		})		
	}

	
	static clearCart() {
		Application.getCart().clear()
		var cartSize = Application.$el('cart-size')
		cartSize.text('0')
		Application.$el('checkout').attr('disabled', true)
	}
	
	/**
	 * logs in a user with id and password
	 * * A request with basic authentication header
	 * is posted to server.
	 * On success, determines the target page based on user home.
	 * On failure, opens LoginDialog 
	 * 
	 * @param user id identity of an user to 
	 * @param pwd password of the user in clear text
	 */
	static login(user, pwd, cb) {
		var basicAuth = 'Basic ' + btoa(user + ':' + pwd)
		var header = {'Authorization' : basicAuth}
		console.log('/user/login POST header=' + JSON.stringify(header))
		$("body").css("cursor", "progress");
		$.ajax({
			url: '/user/login', 
			method: 'POST',
			headers: header
		}).success(function(data) {
			console.log(`success /user/login ${data}`)
			cb.call(null, null, data)
		}).fail(function(err) {
			console.log(`failure /user/login ${err}`)
			cb.call(null, err, null)	
		}).always(function(response){
			$("body").css("cursor", "default");
		})
	}
	
	
	/**
	 * logs in a user without id and password
	 * @param user id of an user to identity
	 * of an user on server.
	 * A request with basic authentication header
	 * is posted to server.
	 * @param pwd password of the user in clear text
	 * @param success function called back
	 * after server login is successful. The function
	 * is called with complete server response
	 * @param failure function called back
	 * if server login fails. The function
	 * is called with complete server response
	 */
	static loginAsGuest() {
		$.ajax({
			url: '/user/loginAsGuest', 
			method: 'POST'
		}).success(function(response) { // send no credentials
			if (DEBUG) console.log('response form /user/login')
			if (DEBUG) console.log(response)
			Application.saveSession(response)
			Application.open()
		}).fail(function(err) {
			Application.clearUser()
			console.error(err)
		})
	}
	
	/**
	 * header with auth token for current user
	 */	
	static authHeader() {
		let user   = Application.getUser(true)
		var header = {
			'x-auth-token' : user.auth,
			'x-user'       : user.id
		}
		//console.log(JSON.stringify(header))
		return header
	}

	static getCurrentUser() {
		let user   = Application.getUser(true)
		return user
	}
	/**
	 * 
	 * @param {*} user 
	 * @param {*} target 
	 */
	static relogin() {
			var url = `/user/relogin`
			$.ajax({
				url: url, 
				method: 'POST',
				headers : Action.authHeader()
			}).success(function(session) {
				if (DEBUG) console.log('relogin success ')
				if (DEBUG) console.log(session)
				Application.saveSession(session)
				
				Application.open()
			}).fail(function(response) {
				console.log('relogin error ')
				console.log(response)
				Application.clearUser()
				new LoginDialog().open()
			})
		}
	
	
	static logout() {
		var user = Application.getUser()
		$.ajax({
			url: '/user/logout',
			method: 'POST'
		}).always(function(){
			Application.removeUser()
		})
	}
	
	
	static about() {
		
		
	}
	
	static bindAction(id, view) {
		if (!view) {
			console.log('can not bind action to undefiend view')
			return
		}
		var ACTIONS = {
			'checkout': Action.transition.bind(null, 'deliver'),
			'clear'   : Action.clearCart,	
			'login'   : Action.login,	
			'relogin' : Action.relogin,	
			'logout'  : Action.logOut,	
			'about'   : Action.about	
		}
		if (!(id in ACTIONS)) {
			console.log(`can not bind ${id} action to view`)
			return
		}
		var action = ACTIONS[id]
		view.on('click', function() {
			action.call(null)
		})
	}


	static fetchOrdersByStatuses(statuses, cb) {
		let url = `/order/status/?statuses=${statuses}`
		$.ajax({url:url
        }).done(function(response){
            cb.call(null, response)
        }).fail(function(err){
            console.error(err)
        })
	}

	
	static validateUserName(name, cb) {
		$.ajax({
			url: '/validate/username',
			method: 'POST',
			data: JSON.stringify({username:name}),
			contentType: 'application/json',
		}).success(function(response) {
			cb.call(null,null,response)
		}).fail(function(err) {
			cb.call(null, err, null)
		})
	}

	static validatePassword(pwd, cb) {
		$.ajax({
			url: '/validate/password',
			method: 'POST',
			data: JSON.stringify({password:pwd}),
			contentType: 'application/json',
		}).done(function(response) {
			cb.call(null,null,response)
		}).fail(function(err) {
			cb.call(null, err, null)
		})

	}
}

export default Action



/**
 * /**
	 * transition to a target 'page'
	 * @param {*} phase 
	 * @param {*} input 
	 
	static transition(phase, input) {
		try {
			let page = Stage.newPage(phase, input)

			let $navbar = Application.$el('#navbar')

			$navbar.empty()
			let navbar = new Navbar()
			$navbar.append(navbar.render())
			$('#page-title').text(phase)
			//let dropdowns = page.getNavigation()
			//let $navbar = Application.$el('#navbar')
			//$navbar.empty() 
			//$navbar.append(new Navbar(dropdowns).render())
			//let $flow = Application.$el('#flow')
			//$flow.empty()
			//$flow.append(new ProcessFlow(phase).render())
			var $main = Application.$el('#main')
			$main.empty()
			$main.append(page.render())
		} catch (err) {
			console.log(err)
		}
	}
 */