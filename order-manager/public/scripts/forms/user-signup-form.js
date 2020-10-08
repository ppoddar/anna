import BasicForm from "./basic-form.js";

class UserSignupForm extends BasicForm {
    constructor(dialog, options) {
        super(dialog, options)
        this.hasRequiredInput = true
        this.addFormInput({id:'uid', label:'Id', 
            comment:'user id must be unique and at least 5 characters', 
            required:true})
            .addValidator(this.validateUserId.bind(this))
            .addValidator(this.existsUserId.bind(this))

        this.addFormInput({id:'password',  label:'Password', 
            comment:'password must be at least 5 characters. No spaces', 
            required: true,
            type:'password'})
            .addValidator(this.validatePassword.bind(this))
        
        this.addFormInput({id:'verify-password', label:'verify password', type:'password'})
            .addValidator(this.matchPassword.bind(this))

        this.addFormInput({id:'name',   label:'Full Name'})
        this.addFormInput({id:'phone',  label:'Phone'})
        
    }

    
    matchPassword(pwd2, cb) {
        if (this.getFormInput('password').getValue() != pwd2) {
            cb.call(null, new Error('passwords do not match'))
        } else {
            cb.call(null, null)
        }
    }

    /*
	 * validates user id.
	 * If uid is invalid, response status is !200.
	 * The response message is reason for id being invald. 
	 */
    async validateUserId(uid, cb) {
        
		await $.ajax(`/validate/userid/`, {
			method: 'POST',
			contentType: 'application/json',
            data: JSON.stringify({userid:uid})
		})
		.done(function(res){
			if (res.statusCode == 200) {
				cb.call(null, null, null)
			} else {
				cb.call(null,new Error(res.reason),null)
			}
		}).fail(function(err){
			cb.call(null,new Error(err.responseText),null)

		})
		
	}

	async validatePassword(pwd, cb) {
		await $.ajax(`/validate/password/`, {
			method: 'POST',
			contentType: 'application/json',
            data: JSON.stringify({password:pwd})
		}).done(function(res){
			if (res.statusCode == 200) {
				cb.call(null, null, null)
			} else {
				cb.call(null,new Error(res.reason),null)
			}
		}).fail(function(err){
			cb.call(null,new Error(err.responseText),null)

		})
	}
  
    async existsUserId(uid, cb) {
        await $.ajax(`/user/exists/${uid}`)
        .done(function(response) {
            console.log(`/user/exists/${uid} response ${response.statusCode}`)
            if (response.statusCode == 404) {
                cb.call(null, new Error(`${uid} is taken. Use another id`))
            } else {
                cb.call(null, null)
            }
        })
        .fail(function(err){
            cb.call(null, new Error(`${uid} can not validate. Use another id`))

        })
    }
}

 export default UserSignupForm