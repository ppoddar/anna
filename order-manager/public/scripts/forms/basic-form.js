import FormInput from './form-input.js'
/**
 * A form houses identifiable input and jQuery elements.
 * Each input element can be attached with a validator function.
 * 
 * A form becoems a part of a dialog.
 * 
 * A form is an array of inputs. 
 * A form element can be a object that describes a form input
 * or a jQuery object with its own handler. 
 */
 class BasicForm {
     constructor(dialog, opts) {
        this.options = opts || {}      // any option to configure further
        this.title = this.options.title || this.constructor.name
        this.dialog = dialog   // optional. required only if this form need to close
                                // enclosing dialog 
        this.inputs  = []      // an array of FormInput or other jQuery elements
                                // that are shown in this form
        this.validators = {}   // set internally

        this.body = this.$el('<div>', 'modal-body')
        this.hasRequiredInput = false
    }


    getTitle() {
        return this.options.title || this.constructor.name
    }

    /**
     * adds an DOM element to this form
     * The given element may accept user input
     * but these input values are not collect as form input
     * @see createFormInput
     * @see collectInputs
     */
     addInput(e) {
         this.inputs.push(e)
     }

     addFormInput(props) {
        const input = new FormInput(props)
        this.inputs.push(input)
        return input
    }

     /**
     * gets a dictionary of input values.
     * The keys will refer to id of input form element
     * and values are current value of user input.
     * 
     */
    collectInputs() {
        var values = {}
		for (var i = 0; i < this.inputs.length; i++) {
            let input = this.inputs[i]
            if (input instanceof FormInput) {
                let key     = input.getKey()
                values[key] = input.getValue()
            }
		}
		return values
    }    

     /**
     * creates body as a form with form inputs.
     * create empty body if no form inputs (e.g. an alert dialog box)
     */
    createBody() {
        var $form = $('<div>')
        $form.addClass('form-horizontal m-1 p-1 needs-validation')
        $form.attr('novalidate', 'true')
        $form.attr('autocomplete', 'off')
        
        this.body.append($form)
        //console.log(`${this.constructor.name} has ${this.inputs.length} inputs`)
        for (var i = 0; i < this.inputs.length; i++) {
            const input = this.inputs[i]
            $form.append((input instanceof FormInput) ? input.element() : input)
        }
        return this.body
    }

    getFormInput(key) {
        for (var i = 0; i < this.inputs.length; i++) {
            const input = this.inputs[i]
            if (input instanceof FormInput) {
                if (input.getKey() == key) return input
            }

        }
        throw new Error(`no input with id [${key}] in form ${this.getTitle()}`)
    }
    
    /**
     * Validates this form.
     * 
     * A form has zero or more input elements.
     * Each of these inputs can have Zero or more validator functions.
     * A validator function could be asynchronous.
     * 
     * This method calls each input element to validate itself.
     * Collects asynchronous response from each input element.
     * 
     * Finally, calls the given callback function with an error or null,
     * if all input element is valid
     * 
     * @param a callback function with signature cb(error)
     *  
     */
    async validate(cb) {
        //console.log(`validating input elements of form [${this.getTitle()}]`)
        let validations = []
        var nInvalid = 0
        for (var i = 0; i < this.inputs.length; i++) {
            const input = this.inputs[i]
            if (input instanceof FormInput) {
                input.clearFormError() 
                validations.push(await input.validate.bind(input, (err)=>{
                    if (err) nInvalid++
                })())
            }
        }
        //console.log(`form [${this.getTitle()}] validates ${validations.length} input elements`)
         
        Promise.allSettled(validations).then((values)=>{
            //console.log('promises for each input element validations')
            //console.log(values)
            //console.log(`number of invalid elelemnts=${nInvalid}`)
            cb.call(null, nInvalid>0 ? new Error(`form ${this.getTitle} has ${nInvalid} invalid input elements`) : null)
        })
        
    }   
    
    /**
    * create a jQuery element and appends given children 
    * @param tag
    * @param cls
    * @param $children
    * @returns
    */
   $el(tag, cls, $children) {
    if (!tag.startsWith('<')) {
        tag = '<' + tag + '>'
    }
    var $el = $(tag)
    if (cls) $el.addClass(cls)
    if ($children) $el.append($children)
    return $el
}



 }

export default BasicForm