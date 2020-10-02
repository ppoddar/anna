import Application   from '../app.js'
import Action        from '../action.js'
import BasicDialog   from './basic-dialog.js'
import LoginForm     from './login-form.js'
import Alert         from './alert.js'

/**
 * LoginDialog provides a dialog with login inputs.
 * @see LoginForm
 * 
 */
class LoginDialog extends BasicDialog {
    /*
     * Create login dialog with given options.
     * Uses a LoginForm as its form.
     * The options will be passed to the form as well.
     */
	constructor(opts) {
        super('login-dialog', opts)
        this.form = new LoginForm(this, opts)
        this.createAction({id:'login', label: 'login', 
            action: this.login.bind(this)})
        this.createAction({id:'login-as-guest', label: 'login as guest', 
            type:'secondary', 
            action: this.loginAsGuest.bind(this)})
    }

    login() {
        const uid = this.form.getFormInput('username').getValue()
        const pwd = this.form.getFormInput('password').getValue()
        const role = 'customer'
        Action.login(uid, pwd, role, (err, response)=>{
            if (err) {
                Application.eraseCookie()
                new Alert('login error', err.responseText).open()
            } else {
                Application.setUser(response)
                Application.open()
            }
        })
    }

    loginAsGuest() {
        Action.loginAsGuest((err)=>{
            if (err) {
                Application.eraseCookie()
                new Alert(err).open()
            } else {
                Application.open()
            }
        })
    }
}

    

export default LoginDialog