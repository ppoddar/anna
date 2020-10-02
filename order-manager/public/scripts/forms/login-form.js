import BasicForm    from "./basic-form.js";

class LoginForm extends BasicForm {
    constructor(dialog, opts) {
        super(dialog, opts)
        this.options = Object.assign({'base':'html/customer/'}, opts)
        this.addFormInput({id:'username', 
            label: 'User name', 
            type: 'text',                 
            validators: [this.checkEmpty.bind(this)]})

        const basePath = this.options['base']
        this.createLink('forgot username?', 
        this.getPath(basePath, 'forgot-username.html'),
        'text-right text-primary')
        
        this.addFormInput({id:'password', label: 'Password', 
            type:'password', 
            validators: [this.checkEmpty.bind(this)]})
        this.createLink('forgot password?', 
            this.getPath(basePath, 'forgot-password.html'),
            'text-right text-primary')

        let $hr = $('<hr>')
        $hr.addClass('solid')
        this.addInput($hr)
        
        this.createLink('not a member? Sign up', 
        this.getPath(basePath, 'signup.html'),
        'text-center text-primary')

    }

    // When in script, paths are relative to displayed page
    // this function appends a path to base path
    getPath(basePath, path) {
        return basePath ? basePath + path : path
    }

    
    createLink(text, href, style) {
        //console.log(`current page ${window.location.href}`)
        var $link = $('<p>')
        $link.text(text)
        $link.addClass('small')
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
    checkEmpty(/* string */input, /* function(err) */ cb) {
        if (input && input.trim().length > 0) {
            cb.call(null, null)
        } else {
            cb.call(null, new Error('must not be empty'))
        }
    }


    
}

export default  LoginForm 