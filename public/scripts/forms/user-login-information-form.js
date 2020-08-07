import BasicForm from "./basic-form.js";
import FormInput from "./form-input.js";
import Action    from "../action.js";

class UserLoginInformationForm extends BasicForm {
    constructor(dialog, options) {
        super(dialog, options)
        this.hasRequiredInput = true
        this.addFormInput({id:'user-name', label:'User name',  required:true})
            .addValidator(this.validateUserName.bind(this))
            .addValidator(this.checkIfUserNameExists.bind(this))

        this.addFormInput({id:'password',  label:'Password', type:'password'})
            .addValidator(this.validatePassword.bind(this))
        
        this.addFormInput({id:'verify-password', label:'verify password', type:'password'})
            .addValidator(this.matchPassword.bind(this))
        
    }

    
    matchPassword(pwd2, cb) {
        if (this.getFormInput('password').getValue() != pwd2) {
            cb.call(null, new Error('passwords do not match'))
        } else {
            cb.call(null, null)
        }
    }

    validateUserName(name, cb) {
        Action.validateUserName(name, (err)=> {
            cb.call(null, err)
        })
    }

    validatePassword(name, cb) {
        Action.validatePassword(name, (err)=> {
            cb.call(null, err)
        })
    }

    checkIfUserNameExists(name, cb) {
        Action.isUserNameTaken(name, (err, response) => {
            if (response == true)
                cb.call(null, new Error(`${name} is taken`))
        })
    }
}

 export default UserLoginInformationForm 