import BasicDialog from "./basic-dialog.js";
import BasicForm from "./basic-form.js";


class ChangeOrderStatusDialog extends BasicDialog {
    constructor() {
        super()
        this.form = new BasicForm('Accept Order')
        let $label = $('<label>')
        $label.text('accept order')
        this.form.inputs = [
            {type:'html',    element:$label}
        ]
        this.actions = [
           {label: 'OK'},
           {label: 'Cancel'}
        ]
    }
}
export default  ChangeOrderStatusDialog