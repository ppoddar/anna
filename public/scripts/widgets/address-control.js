import AddressForm from '../forms/address-form.js';
import Address from '../model/address.js';
import WidgetFactory from './widget-factory.js'
import Application 		from '../app.js'
import BasicDialog from '../forms/basic-dialog.js';
/**
 * shows a set of named addresses.
 * Each address is identified by its kind.
 * 
 * Shows a set of radio buttons for address.
 * The address details is displayed when a radio is selected
 * 
 * A new address can be added opening a new form.
 */
class AddressControl {
	/**
	 * @param addresses a dictinary of address keyed in by kind
	 */
	constructor(addresses) {
		this.addresses = {}
		for (var kind in addresses) {
			let addr = addresses[kind]
			if (addr instanceof Address) {
				this.addresses[kind] = addr
			} else {
				this.addresses[kind] = new Address(addr)
			}

		}
		this.group     = 'address-group'
		this.$addressChoices = Application.$el('#address-choices')
		this.$addressDisplay = Application.$el('#address-selected')
	}
	

	/**
	 * Shows a group of radio buttons on address-choices
	 * shows the address corresponding to selected button
	 * 
	 * @param select a number. when address index is shown
	 */
	render(select) {
		var selectIndex = select || 0
		this.$addressChoices.empty()
		var i = 0
		//console.log(`select at ${selectIndex}`)
		for (var kind in this.addresses) {
			var checked = (i == selectIndex)
			var address = this.addresses[kind]
			console.log(`showing ${i}-th address [${address.kind}] checked=${checked}`)
			var $choice = this.createAddressChoice(this.group, address, checked)
			let $li = $('<li>')
			$li.append($choice)
			this.$addressChoices.append($li)
			if (checked) this.showAddress(address)
			i++
		}
		// creating new address is a choice
		let $newAddress = this.createNewAddressChoice(this.group)
		this.$addressChoices.append($newAddress)
	}
	
	/**
	 * finds the selected address kind
	 */
	getSelectedAddress() {
		let selector = `input[name='${this.group}']:checked`
		let kind = $(selector).val();
		return this.addresses[kind]
	}
	
	/**
	 * create a radio button for given address.
	 * when radio button is clicked,  corresponding 
	 * address will be shown in given display
	 */
	createAddressChoice(group, address, checked) {
		if (checked) this.showAddress(address)
		var kind = address.kind

  		var $radio = $('<input>')
  		$radio.attr('type', 'radio')
  		$radio.attr('name',    group)
  		$radio.attr('checked', checked)
  		$radio.attr('value',   kind)
		$radio.attr('id', `radio-${kind}`)

		$radio.addClass('m-1')

  		var $label = WidgetFactory.createLabel(kind, 'label', kind)
		if (checked) $label.addClass('font-weight-bold')
  		$label.on('click', () => {
			//console.log('selection changed to ' + kind)
			$('label').removeClass('text-primary')
			$('label').removeClass('font-weight-bold')
			$(this).addClass('text-primary font-weight-bold')
			this.showAddress.bind(this, this.addresses[kind])()
		  })
		  $radio.on('click', ()=>this.showAddress(this.addresses[kind]))

		  var $span = $('<span>')
		  $span.append($radio, $label)

  		  return $span
	}
	
	/**
	 * create a button that would open up a 
	 * form to add details of an address.
	 * The new address will be displayed
	 */
	createNewAddressChoice(group) {
		let $button = $('<button>')
		$button.addClass('btn btn-success round')
		$button.text('new address')
		$button.on('click', ()=>{
			let dialog = new BasicDialog('new-address-dialog', 'New Address')
			dialog.form = new AddressForm()
			dialog.createAction({
				label:'Add address', 
				validate:true, 
				action:this.addAddress.bind(this)})
			dialog.createAction({
				label:'Cancel',
				validate:false,
				action: dialog.close.bind(dialog)})
			dialog.open()
		})

		
		return $button
	}

	addAddress(addr) {
		console.log('addAddress')
		console.log(addr)
		if (!(addr instanceof Address)) {
			addr = new Address(addr)
		}
		this.addresses[addr.kind] = addr
		var n = Object.keys(this.addresses).length
		this.render(n-1)
	}

	/**
	 * shows given address on address display area
	 * 
	 * @param addr an Address object
	 */
	showAddress(addr) {
		let address
		if (addr instanceof Address) {
			address = addr
		} else {
			console.log(`given ${addr.constructor.name} is converetd to Address object`)
			address = new Address(addr)
		}
		this.$addressDisplay.empty()
		this.$addressDisplay.append(address.render())
		
	}

	
}

export default AddressControl