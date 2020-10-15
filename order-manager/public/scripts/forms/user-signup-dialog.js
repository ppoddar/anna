import BasicDialog    from "./basic-dialog.js"
import UserSignupForm from "./user-signup-form.js"
import Alert from  "./alert.js"

class UserSignupDialog extends BasicDialog {
    constructor(opts) {
        super(opts)
        this.form = new UserSignupForm(this, opts)
        this.createAction({id:'signup', label: 'signup', 
            validate:true,
            action: this.signup.bind(this)})
        this.createAction({id:'cancel', label: 'Cancel', 
            type:'secondary', 
            action: this.close.bind(this)})
    }

    signup() {
        const uid = this.form.getFormInput('uid').getValue()
        const pwd = this.form.getFormInput('password').getValue()
        const name = this.form.getFormInput('name').getValue()
        const phone = this.form.getFormInput('phone').getValue()
        const ctx = this
        $.ajax('/user/',
            {method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({id:uid, password:pwd, name:name, phone:phone, 
            roles:['customer']})
        }).done(function (response) {
            ctx.close()
        }).fail(function(err){
            new Alert('Create User', err.responseText).open()
        })
        

    }
}

export default UserSignupDialog