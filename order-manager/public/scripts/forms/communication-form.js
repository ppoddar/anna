import BasicForm    from './basic-form.js'

class CommunicationForm extends BasicForm {
	constructor(dialog) {
        super(dialog)
        
        this.createFormInput( 
            {id:'email', label:'email',  
            type:'email', required:false, 
            placeholder:'email', 
            comment: 'will use this email to send coupons and special offers'})
        
        this.createFormInput( 
            {id:'phone', label:'phone',  
            type:'tel',   required:false, 
            placeholder:'phone', 
            comment: 'will call only if urgent'})
            
        this.createFormInput(  
            {id:'birthday',label:'birth day',  
            type:'date',   required:false, 
            placeholder:'birth date', 
            comment: ''})
    }

    
}


export default CommunicationForm