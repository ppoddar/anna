"use strict";

import Address from './address.js';
/**
 * 
 */
class User {
	constructor(obj) {
		this.id    = obj['id']
		this.name  = obj['name']
		this.auth  = ('auth' in obj) ? obj['auth'] : ''
		this.email = obj['email']
		this.phone = obj['phone']
		this.roles = obj['roles']
		this.home  = obj['home']
		this.image = obj['image']
		this.addresses = {}
		for (var name in obj['addresses']) {
			this.addresses[name] = 
				new Address(obj['addresses'][name])
		}
	}
	
	/**
	 * renders a User as his/her profile image 
	 */
	render() {
		var $div = $('<div>')
		var $image = $('<img>')
		$image.attr('src', this.image || './images/no_user_image.png')
		$image.css('display', 'block')
		$image.css('width', '32px')
		$image.css('height', 'auto')
		$image.css('border-radius', '50%')
		var $name = $('<strong>')
		$name.text(this.id)
		
		$div.append($image, $name)
		return $div
	}
	
}

export default User