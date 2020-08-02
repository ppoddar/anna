import BasicForm    from "./basic-form.js";

class LoginForm extends BasicForm {
    constructor(dialog) {
        super(dialog)
        this.createFormInput({id:'username', 
            label: 'User name', 
            type: 'text',                 
            validator: this.checkEmpty.bind(this)})
        this.createLink('forgot username?', 
            './html/customer/forgot-username.html', 
            'text-right text-primary')
        
        this.createFormInput({id:'password', label: 'Password', 
            type:'password', 
            validator: this.checkEmpty.bind(this)})
        this.createLink('forgot password?', 
            './html/customer/forgot-password.html', 
            'text-right text-primary')

        let $hr = $('<hr>')
        $hr.addClass('solid')
        this.addInput($hr)
        
        this.createLink('not a member? Sign up', 
        './html/customer/signup.html', 
        'text-center text-primary')

    }

    createLink(text, href, style) {
        var $link = $('<p>')
        $link.text(text)
        $link.addClass(style)
        $link.on('click', (e)=>{
            e.stopPropagation()
            e.preventDefault()
            window.location = href
        })
        this.addInput($link)
    }

    checkEmpty(input, cb) {
        if (input && input.trim().length > 0) {
            cb.call(null, null, {valid:true})
        } else {
            cb.call(null, {valid:false, reason:'must not be empty'}, null)
        }
    }
}

export default  LoginForm 