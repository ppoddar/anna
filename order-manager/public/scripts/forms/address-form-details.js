import BasicForm from './basic-form.js'


/**
 * form to add an address
 */
class AddressFormDetails extends BasicForm {
	constructor() {
		super(null, {title:'Address Details'})
		this.hasRequiredInput = true
		this.addFormInput({id:'line1',label:'Address', required:true})
		this.addFormInput({id:'line2', label:'Address 2'})
		this.addFormInput({id:'city',label:'City'})
		this.addFormInput({id:'zip',
			label:'PIN', 
			type:'text', reuired:true, 
			comment: 'delivery available only within a zone'})
			.addValidator(this.validateZip.bind(this))
		

	}
	// TODO: validate only if within a range
	validateZip(zip, cb) {
		cb.call(null,null, null)
	}
}




export default AddressFormDetails