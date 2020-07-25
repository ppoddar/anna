import Action       from    '../action.js'
import BasicForm    from './basic-form.js'

class SignupForm extends BasicForm {
	constructor(dialog) {
        super(dialog)
        let $autocomplete = $('<input>')
        $autocomplete.attr('autocomplete', 'off')
        $autocomplete.attr('name', 'hidden')
        $autocomplete.attr('type', 'text')
        $autocomplete.css('display', 'none')

        this.addInput($autocomplete)
        

        let $username = this.createFormInput({ id:'id', label:'User Name', 
            type:'text', 
            value: '',
            required:true, 
            validator: Action.validateUserName,
            comment:'name must be unique with 5 or more letters, no spaces'})


        this.createFormInput({id:'name', label:'Full name',   
            type:'text',  
            required:true,   
            validator: this.checkNotEmpty.bind(this)})

        let $password = this.createFormInput({id:'password', label:'Password', 
            type:'password', 
            required:true,
            validator:Action.validatePassword,
            comment: 'password must contain at least one number'})

        $password.on('focus', function(){ $(this).text('')})

        this.createFormInput({id:'password2', label:'Password again', 
            type:'password', required:true,
            validator:this.matchPassword.bind(this),
            comment:'same password for verification'})

        
            let $notice = $('<span><superscript>*</superscript> bold fields are required</span>')
            $notice.addClass('float-right text-danger')
            this.addInput($notice)
    }

    createBody() {
        let $form = super.createBody()
        $form.attr('autocommplete', 'off')
        return $form
    }

    checkNotEmpty(name, cb) {
        if (name) {
            cb.call(null, {valid:true})
        } else {
            cb.call(null, {valid:false, reason:'name must not be empty'})
        }
    }
    matchPassword(pwd2, cb) {
        if (this.getInputValue('password') != pwd2) {
            cb.call(null, {valid:false, reason:'passwords do not match'})
        } else {
            cb.call(null, {valid:true})
        }
    }
}

export default SignupForm