import Application from './app.js'
import Alert from './forms/alert.js'

/**
 * Action carries out all server side requests via AJAX on behalf
 * of clients.
 * The methods accept a callback function with signature
 *   	callback(err,data)
 *  where data is the response received from server converted
 *  to a JSON object
 *  If a server ajax call fails, an Alert is displayed. 
 *  The caller may decide to further process teh error
 */
class Action {
	/**
	 * Fetch all addresses of current user.
	 */
	static async fetchAddress(cb) {
		var user = Application.getCurrentUser(true)
		$.ajax({
			url : `/user/addresses/?uid=${user.id}`
		}).done(function(addresses) {
			cb.call(null, null, addresses)
		}).fail(function(err){
			new Alert().show(err)
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
			cb.call(null, null, items)
		}).fail(function(err){
			new Alert().show(err)
		})
	}

	static createUser(user, cb) {
		$.ajax({
			url: '/user/',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(user)
		}).done(function (response) {
			cb.call(null, response)
		}).fail(function(err){
			new Alert().show(err)
		})
	}

	/**
	 * creates a new order by content of the cart.
	 * @param {*} cart content of the cart. The content is a dictionary,
	 * but payload is an array of values
	 * @param {*} callback 
	 */
	static createOrder(items, callback) {
		const user = Application.getCurrentUser(true)
		var values = []
		Object.keys(items).forEach((k)=>{values.push(items[k])})
		$.ajax({url:`/order/?uid=${user.id}`,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(values)
		}).done(function(order) { 
			callback.call(null, null, order)
		}).fail(function(err){
			new Alert().show(err)
		})		
	}

	static createInvoice(oid,  callback) {
		$.ajax({url:`/invoice/?oid=${oid}`,
			method: 'POST',
			contentType: 'application/json'
		}).done(function(invoice) { 
			callback.call(null, null, invoice)
		}).fail(function(err){
			new Alert().show(err)
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
		$.ajax({
			url: '/user/login', 
			method: 'POST',
			headers: header
		}).success(function(data) {
			cb.call(null, null, data)
		}).fail(function(err) {
			new Alert().show(err)
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
	static loginAsGuest(cb) {
		$.ajax({
			url: '/user/loginAsGuest', 
			method: 'POST'
		}).success(function(response) { // send no credentials
			cb.call(null, null, data)
		}).fail(function(err) {
			new Alert().show(err)
		})
	}

	static logout() {
		//TODO:
	}
	
	
	static about() {
		//TODO:
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