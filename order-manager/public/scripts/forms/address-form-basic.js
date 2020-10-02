import BasicForm from './basic-form.js'


/**
 * form to add an address
 */
class AddressFormBasic extends BasicForm {
	constructor() {
		super(null, {title:'Address Kind'})
		this.addFormInput({id:'kind',label:'Kind', required:true})
	}
}




export default AddressFormBasic