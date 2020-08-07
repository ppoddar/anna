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
	 * returns an Address[] via callback
	 */
	static async getAddresses(uid, cb) {
		$.ajax({
			url : `/user/${uid}/addresses/`
		}).done(function(addresses) {
			cb.call(null, null, addresses)
		}).fail(function(err){
			new Alert('Get Addresses', err.responseText).open()
		})
	}

	static async getAddressById(uid, address_id, cb) {
		$.ajax({
			url : `/user/${uid}/address-by-id/${address_id}/`
		}).done(function(response) {
			cb.call(null, null, response)
		}).fail(function(err){
			new Alert('Get Address by Id', err.responseText).open()
		})
	}

	static async getAddressByKind(uid, address_kind, cb) {
		$.ajax({
			url : `/user/${uid}/address-by-kind/${address_kind}/`
		}).done(function(response) {
			cb.call(null, null, response)
		}).fail(function(err){
			new Alert('Get Address by kind', err.responseText).open()
		})
	}


	static fetchItemCatalog(cb) {
		var url = '/item/catalog/'
		$.ajax({
			url: url,
			contentType: 'application/json'
		}).done(function(items) {
			if (items.length == 0) {
				new Alert('fetch catalog', 'no menu item').open()
			} else {
				cb.call(null, null, items)
			}
		}).fail(function(err){
			new Alert('fetch catalog', err.responseText).open()
		})
	}

	static createUser(user, cb) {
		$.ajax({
			url: `/user/${user.id}`,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(user)
		}).done(function (response) {
			cb.call(null, response)
		}).fail(function(err){
			new Alert('Create User', err.responseText).open()
		})
	}

	/**
	 * creates a new order by content of the cart.
	 * The response is a JSON string. It is passed to callback
	 * function which will convert it to a MOdel Object by
	 * JSON.parse() function
	 * @param {*} cart content of the cart. The content is a dictionary,
	 * but payload is an array of values
	 * @param {*} callback 
	 */
	static createOrder(items, callback) {
		const user = Application.getCurrentUser()
		var values = []
		Object.keys(items).forEach((k)=>{values.push(items[k])})
		$.ajax({url:`/order/${user.id}`,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(values)
		}).done(function(order) { 
			// received as a JSON object. 
			console.log(`server response is a ${order.constructor.name}`)
			callback.call(null, null, order)
		}).fail(function(err){
			new Alert('Create Order', err.responseText).open()
		})		
	}

	static createInvoice(oid,  callback) {
		const user = Application.getCurrentUser(true)
		$.ajax({url:`/invoice/${user.id}/${oid}`,
			method: 'POST',
			contentType: 'application/json'
		}).done(function(invoice) { 
			callback.call(null, null, invoice)
		}).fail(function(err){
			new Alert('Create Invoice', err.responseText).open()
		})		
	}

	static setDeliveryAddress(oid, address_id, callback) {
		$.ajax({url:`/invoice/address?oid=${oid}&address-id=${address_id}`,
			method: 'POST',
			contentType: 'application/json'
		}).done(function(invoice) { 
			callback.call(null, null, invoice)
		}).fail(function(err){
			new Alert('Error: delivery address', err.responseText).open()
		})		
	}

	static getInvoice(oid, callback) {
		$.ajax({url:`/invoice?oid=${oid}`})
		.done(function(response) { 
			callback.call(null, null, response)
		}).fail(function(err){
			new Alert('Error: get invoice', err.responseText).open()
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
	 * 
	 * Server sets a cookie and sends a response of a user with
	 * an authentication token which is a session id
	 * 
	 * @param user id identity of an user to 
	 * @param pwd password of the user in clear text
	 * @param function with (err, response)
	 */
	static login(user, pwd, cb) {
		var basicAuth = 'Basic ' + btoa(user + ':' + pwd)
		var header = {'Authorization' : basicAuth}
		console.log('/user/login POST header=' + JSON.stringify(header))
		$.ajax({
			url: '/user/login', 
			method: 'POST',
			headers: header,
			withCredentials:true, // glag for browser to set the cookie
			crossDomain:true
		}).success(function(response) {
			console.log('response /usr/login')
			console.log(response)
			cb.call(null, null, response) 
		}).fail(function(err) {
			new Alert("login error", err.responseText).open()
		}).complete(function(data, status, xhr) {
			console.log(`cookies after response is received:${document.cookie}`)
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
			new Alert('Guest Login', err.responseText).open()
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

	static isUserNameTaken(name, cb) {
		$.ajax({
			url: `/user/?uid=${name}`
		}).success(function(response){
			if (response.statusCode == 200) {
				cb.call(null, new Error(`user with name ${name} exists`))
			}
		}).fail(function(){
			cb.call(null,null)
		})
	}

	/*
	 * validates user name.
	 * If name is invalid, response status is !200.
	 * The response message is reason for name being invald. 
	 */
	static validateUsername(name, cb) {
		$.ajax({
            headers: { 'content-type': 'application/json' },
			url: `/validate/username/`,
			method: 'POST',
			contentType: 'application/json',
            data: JSON.stringify({username:name})
        }, function (err, res, body) {
			if (res.statusCode == 200) {
				cb.call(null, null, null)
			} else {
				cb.call(null,new Error(res.reason),null)
			}
        })
	}

	static validatePassword(pwd, cb) {
		$.ajax({
            headers: { 'content-type': 'application/json' },
			url: `/validate/password/`,
			method: 'POST',
			contentType: 'application/json',
            data: JSON.stringify({password:pwd})
        }, function (err, res, body) {
			if (res.statusCode == 200) {
				cb.call(null, null, null)
			} else {
				cb.call(null,new Error(res.reason),null)
			}
        })
	}


	static getPaymentOptions (cb) {
		$.ajax({url: `/invoice/payment-options`})
		.success(function(data){
			cb.call(null, null, data)
		}).fail(function(err){
			new Alert('Error: getPaymentOptions', err.responseText).open()
		})
	}
}

export default Action


