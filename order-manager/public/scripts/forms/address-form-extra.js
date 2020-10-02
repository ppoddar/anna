import BasicForm from './basic-form.js'
/**
 * form to add an address
 */
class AddressFormExtra extends BasicForm {
	constructor() {
		super(null, {title:'Address Tips'})
		this.addFormInput({id:'tip', label:'Directions', 
			comment:'any tips to find this address'})
	}
}




export default AddressFormExtra