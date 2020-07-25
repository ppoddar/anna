import BasicForm from './basic-form.js'


/**
 * form to add an address
 */
class AddressForm extends BasicForm {
	constructor() {
		super()
		// this.createFormInput({id:'kind',
		// 	label:'kind', 
		// 	type:'text', required:true, for:'kind',
		// 	placeholder:'kind of address such as home, office etc', 
		// 	comment: 'can add address of different kinds',
		// 	validator: validateName})

		this.createFormInput({id:'line1',label:'Address', required:true})
		this.createFormInput({id:'line2', label:'Address 2'})
		this.createFormInput({id:'city',label:'City'})
		this.createFormInput({id:'zip',
			label:'PIN', 
			type:'text', reuired:true, 
			comment: 'delivery available only within a zone',
			validator:this.validateZip.bind(this)})
		
		this.createFormInput({id:'tip', label:'Directions', 
			comment:'any tips to find this address'})
		
	}

	validateZip(zip, cb) {
		let response = {}
		response = {valid:true}
		cb.call(null,response)
	}
}




export default AddressForm