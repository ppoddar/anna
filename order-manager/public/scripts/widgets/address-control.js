import Address       from '../model/address.js';
import AddressWizard from '../forms/address-wizard.js'
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
	 * @param addresses an arry of address
	 */
	constructor(addresses) {
		this.addresses = addresses
		this.group           = 'address-group'
		this.$addressChoices = $('<ul>')
		this.$addressDisplay = $('<div>')
		this.$addressChoices.addClass('col-sm-4 list-unstyled')
		this.$addressDisplay.addClass('col-sm-8')
		this.$main = $('<div>')
		this.$main.addClass('container')
		var $row = $('<div>')
		$row.addClass('row no-gutters')
		$row.append(this.$addressChoices, this.$addressDisplay)
		this.$main.append($row)
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
		for (var i = 0; i < this.addresses.length; i++) {
			var checked = (i == selectIndex)
			var address = this.addresses[i]
			console.log(`showing ${i}-th address [${address.kind}] checked=${checked}`)
			var $choice = this.createAddressChoice(this.group, address, checked)
			this.$addressChoices.append($choice)
			if (checked) this.showAddress(address)
		}
		// creating new address is a choice
		let $newAddress = this.createNewAddressChoice(this.group)
		this.$addressChoices.append($newAddress)

		return this.$main
	}
	
	/**
	 * finds the selected address id
	 */
	getSelectedAddressId() {
		let selector = `input[name='${this.group}']:checked`
		let kind = $(selector).val();
		for (var i = 0; i < this.addresses.length; i++) {
			let address = this.addresses[i]
			if (address.kind == kind) {
				return address.id
			}
		}
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

		$radio.addClass('m-1')

		var $label = $('<label>')
		$label.text(address.kind)
		$label.attr('id', `m-1 address-${kind}`)
		$label.addClass(`address-label`)

		var $span = $('<span>')
		$span.append($radio, $label)

		let $li = $('<li>')
		$li.append($span)
		$li.on('click',  this.showAddress.bind(this, address))

  		return $li
	}
	
	/**
	 * create a button that would open up a 
	 * form to add details of an address.
	 * The new address will be displayed
	 */
	createNewAddressChoice() {
		let $button = $('<button>')
		$button.addClass('btn btn-success round')
		$button.text('new address')
		$button.on('click', ()=>{
			let wizard = new AddressWizard()
			wizard.onComplete((data) => {
				const address = new Address(data)
				this.addresses.push(address)
				this.render(this.addresses.length-1)
			}) 
			wizard.open()
		})
		return $button
	}

	/**
	 * shows given address on address display area
	 * The radio button corresponding to the address is highlighted
	 * @param addr an Address object
	 */
	showAddress(address) {
		this.$addressDisplay.empty()
		this.$addressDisplay.append(address.render())

		$('.address-label').each(function(idx) {
			let text = $(this).text()
			if (text == address.kind) {
				$(this).addClass('text-primary')
				$(this).addClass('font-weight-bold')
			} else {
				$(this).removeClass('text-primary')
				$(this).removeClass('font-weight-bold')
			}		
		})
		
	}

	
}

export default AddressControl