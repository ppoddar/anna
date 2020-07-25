import BasicDialog from './basic-dialog.js'
import SignupForm from './signup-form.js'

class SignupDialog extends BasicDialog {
    constructor() {
        super({id:'signup-dialog', title:'Signup'})
        this.setForm(new SignupForm())
        this.createAction({
            label: 'signup',
            validate: true
        })
        this.createAction({
            label: 'Cancel',
            action: back
        })
    }
}

function back() {
    console.log(document.referrer)
    //window.history.back()
    window.location = ''
}
export default SignupDialog