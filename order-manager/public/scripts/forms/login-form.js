import BasicForm    from "./basic-form.js";
import UserSignupDialog from "./user-signup-dialog.js"
import WidgetFactory from '../widgets/widget-factory.js'
class LoginForm extends BasicForm {
    constructor(dialog, opts) {
        super(dialog, opts)
        this.options = Object.assign({'base':'html/customer/'}, opts)
        this.addFormInput({id:'uid', 
            label: 'id', 
            type: 'text', 
            required:true,                
            validator: this.checkEmpty.bind(this)})

        const basePath = this.options['base']
        this.createLink('forgot user id?', 
        this.getPath(basePath, 'forgot-uid.html'),
        'text-right text-primary')
        
        this.addFormInput({id:'password', label: 'Password', 
            type:'password', value: '',
            required:true,
            validator: this.checkEmpty.bind(this)})
        this.createLink('forgot password?', 
            this.getPath(basePath, 'forgot-password.html'),
            'text-right text-primary')

        let $hr = $('<hr>')

        let $text = $('<span>')
        $text.text('not registered? ')
        var $signup = WidgetFactory.createButton({label:'Signup'})
        $signup.text('signup')
        $signup.on('click', ()=>{
            new UserSignupDialog().open()
        })

        var $signupLink = $('<div>')
        $signupLink.append([$text, $signup])
        $signupLink.addClass('mx-auto')

        this.addInput($signupLink)
        this.addInput($hr)

        

    }

    // When in script, paths are relative to displayed page
    // this function appends a path to base path
    getPath(basePath, path) {
        return basePath ? basePath + path : path
    }

    
    createLink(text, href, style) {
        //console.log(`current page ${window.location.href}`)
        var $link = $('<p>')
        var $text = $('<small>')
        $text.text(text)
        $link.append($text)
        $link.addClass(style)
        $link.on('click', (e)=>{
            e.stopPropagation()
            e.preventDefault()
            window.location = href
        })
        this.addInput($link)
    }

    /*
     * a validation function must have a specifc signature.
     * 
     * This function calls given callback function 
     */
    checkEmpty(/* function(err) */ cb) {
        const uid = this.getFormInput('uid').getValue()

        if (!uid || uid.trim().length == 0) {
            cb.call(null, new Error('must not be empty'))
        }
    }


    
}

export default  LoginForm 