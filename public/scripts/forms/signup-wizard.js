import Wizard               from './wizard.js'
import UserInformationForm  from './user-information-form.js'
import UserLoginInformationForm  from './user-login-information-form.js'
import UserAddressForm      from './user-address-form.js'

class SignupWizard extends Wizard {
    constructor() {
        super()
        this.addIntroPage('Welcome', 
            `we are glad that you have chosen to be a member.<br>
            Please answer the following questions to register
            as a Hiraafood customer`)

        this.addPage(new UserInformationForm(this, {title:'User info'}))
        this.addPage(new UserLoginInformationForm(this, {title:'User login info'}))
        this.addPage(new UserAddressForm(this, {title:'address'}))
    }

    onComplete(userinputs) {
        console.log(userinputs)
    }
}

export default SignupWizard