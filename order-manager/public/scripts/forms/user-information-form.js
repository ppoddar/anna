import BasicForm from "./basic-form.js";

class UserInformationForn extends BasicForm {
    constructor(dialog, options) {
        super(dialog, options)
        this.hasRequiredInput = true
        this.addFormInput({id:'user-id',label:'Id',  required:true})
        this.addFormInput({id:'full-name',label:'Name'})
        this.addFormInput({id:'email', label:'email'})
        this.addFormInput({id:'phone', label:'phone'})
        let $note = $('<p>')
        $note.addClass('small float-right text-warning')
        $note.html('<b>bold</b> fields must be filled up')
        this.addInput($note)
   }
}

 export default UserInformationForn 