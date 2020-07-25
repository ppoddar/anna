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
	constructor() {
        super({id:'login-dialog', title:'Login', type:'info', size:'large'})
        this.form = new LoginForm(this)
        this.createAction(
           {label: 'login', 
            action: () => {
                var inputs = this.form.collectInputs()
                Action.login(inputs.username, inputs.password, (err,response) => {
                    if (err) this.handleServerResponse('login', err)
                    else this.handleServerResponse('login', response)
            })}
        }),
        this.createAction(
            {label: 'login as guest', 
            type:'secondary', 
            action: ()=> { Action.loginAsGuest((err,response)=>{
                if (err) this.handleServerResponse('loginAsGuest', err)
                else this.handleServerResponse('loginAsGuest', response)
            })}
        }),

        this.createAction({
            label:'Cancel', 
            type: 'secondary',
            action: ()=>{this.close()}
        })
    }


    /**
     * Response from login 
     * @param {Response} response 
     */
    handleServerResponse(req, response) {
        console.log(`${req} server response`)
        let session = response
		console.log(session)
		Application.saveSession(session)
		Application.open()
    }

    handleServerError(req, error) {
        console.log(`${req} server error`)
        console.log(error)
        Application.clearUser()
        this.close()
        new Alert('Login Error', response.responseJSON.message).open()
    }
}
export default LoginDialog