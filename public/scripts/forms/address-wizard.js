import Wizard             from "./wizard.js"
import AddressFormBasic   from "./address-form-basic.js"
import AddressFormDetails from "./address-form-details.js"
import AddressFormExtra   from "./address-form-extra.js"


class AddressWizard extends Wizard {
    constructor() {
        super()
        this.addPage(new AddressFormBasic())
        this.addPage(new AddressFormDetails())
        this.addPage(new AddressFormExtra())
    }
}

export default AddressWizard