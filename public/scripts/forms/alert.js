import BasicDialog from './basic-dialog.js'
import BasicForm from './basic-form.js'
/*
 * A message box, 
 */
class Alert extends BasicDialog {

	constructor(title, msg) {
		super('alert', {type:'warning'})
		const form = new BasicForm(this, {title:title})
		const $msg = $('<p>')
		$msg.html(msg) 
		form.addInput($msg)
		this.setForm(form)
		this.createAction({label: 'OK', action: this.close.bind(this)})
	}

	
}

export default Alert