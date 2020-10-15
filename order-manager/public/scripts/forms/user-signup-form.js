import BasicForm from "./basic-form.js";

class UserSignupForm extends BasicForm {
    constructor(dialog, options) {
        super(dialog, options)
        this.hasRequiredInput = true
        this.addFormInput({id:'uid', label:'Id', 
            comment:'user id must be unique and at least 5 characters', 
            required:true,
            validator:this.validateUserId.bind(this)})

        this.addFormInput({id:'password',  label:'Password', 
            comment:'password must be at least 5 characters. No spaces', 
            required: true,
            type:'password',
            validator:this.validatePassword.bind(this)})
        
        this.addFormInput({id:'verify-password', 
            label:'verify', 
            type:'password',
            validator:this.matchPassword.bind(this)})

        this.addFormInput({id:'name',   label:'Full Name'})
        this.addFormInput({id:'phone',  label:'Phone'})
    }

    /*
     * validation function
     */
    matchPassword(cb) {
        const pwd  = this.getFormInput('password').getValue()
        const pwd2 = this.getFormInput('verify-password').getValue()
        if ( pwd != pwd2) {
            cb.call(null, 'passwords do not match')
        } 
    }

    /*
	 * validates user id.
	 * If uid is invalid, response status is !200.
	 * The response message is reason for id being invald. 
	 */
    validateUserId(cb) {
        const uid  = this.getFormInput('uid').getValue()
		$.ajax(`/validate/userid/`, {
			method: 'POST',
			contentType: 'application/json',
            data: JSON.stringify({userid:uid})
        }).fail(function(err){
            cb.call(null, err.responseJSON.reason)
		})
		
	}

	validatePassword(cb) {
        const pwd  = this.getFormInput('password').getValue()
		$.ajax(`/validate/password/`, {
			method: 'POST',
			contentType: 'application/json',
            data: JSON.stringify({password:pwd})
		}).fail(function(err){
            cb.call(null, err.responseJSON.reason)
		})
	}
    
}

 export default UserSignupForm