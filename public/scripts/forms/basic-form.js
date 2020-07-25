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
     constructor(dialog) {
         this.dialog = dialog   // optional. required only if this form need to close
                                // enclosing dialog 
         this.inputs  = []      // an array of DOM elements that are shown in this form
         this.options = {}      // any option to configure further
         this.validators = {}   // set internally

         this.body = this.$el('<div>', 'modal-body')
    }

    title() {
        if (this.options.title) return this.options.title
        if (this.dialog) return this.dialog.title
        return this.constructor.name
    }

    /**
     * adds a DOM element to this form
     * The given element may accept user input
     * but these input values are not collect as form input
     * @see createFormInput
     * @see collectInputs
     */
     addInput(e) {
         this.inputs.push({element:e})
     }

     /**
     * gets a dictionary of input values.
     * The keys will refer to id of input DOM element
     * and values are current value of user input.
     * 
     */
    collectInputs() {
        var values = {}
		for (var i = 0; i < this.inputs.length; i++) {
            let input = this.inputs[i]
            if ('key' in input) {
                let key = input['key']
                values[key] = this.getInputValue(key)
            }
		}
		return values
    }    

     /**
     * creates body as a form with form inputs.
     * create empty body if no form inputs (e.g. an alert dialog box)
     */
    createBody() {
		var $form = this.$el('<div>', 'form-horizontal m-1 p-1 needs-validation')
        $form.attr('novalidate', 'true')
        $form.attr('autocomplete', 'off')
        this.body.append($form)
        //console.log(`${this.constructor.name} has ${this.inputs.length} inputs`)
        for (var i = 0; i < this.inputs.length; i++) {
            let $input = this.inputs[i]
            //console.log(`adding ${$input.key} to form`)
            //console.log($input)
            $form.append($input.element)
        }
        return this.body
    }

    /**
     * creates form input (a DOM element) from given specifcation
     * abount a form field
     * 
     * @param {*} props 
     * id     required  form inputs are collected on this key
     * label            
     * required
     * for
     * type
     * placeholder
     * validator
     */
    createFormInput(props) {
        console.assert('id' in props, 'can not add form input without [id] property')
        console.log(`createFormInput [${props.id}]`)
        var $group = $('<div>')
        $group.addClass('form-group row no-gutters')
        var $col1 = $('<div>')
        var $col2 = $('<div>')
        $col1.addClass('col-3')
        $col2.addClass('col-8')
        
        $group.css('margin-top', '10px')
        $group.css('margin-bottom', '10px')
        $group.append([$col1, $col2])

        var $label  = $('<label>')
        $label.addClass('float-right mr-2')
        if (props.required) $label.addClass('font-weight-bold')
    	$label.text(props.label || props.id)
        $label.attr('for', props.id)

        $col1.append($label)
    	
    	var $input = $(props.type=='textarea' ? 'textarea' : '<input>')
        $input.addClass('form-control')
    	$input.attr('id',   props.id)
        $input.attr('type', props.type || 'text')
        $input.attr('value', props.value)
        if (props.readonly) $input.attr('readonly', true)
        if (props.placeholder) $input.attr('placeholder',  props.placeholder)
        $col2.append($input)

        if (props.validator)  {
            console.log(`form input [${props.id}] adding validtor ${props.validator.name}`)
            $input.addClass('input-validate') // helps to find all validatings input
            this.validators[props.id] = props.validator
            // validating input has an extra element that would show 
            // reason for input to be invalid
            var $validation = this.$el('<p>', 'invalid-feedback text-danger')
            $validation.attr('id', `${props.id}-invalid`)
            $validation.text('')
            $col2.append($validation)
        }
        
        if (props.comment) {
            var $comment = $('<p>')
            $comment.addClass('form-comment')
            $comment.attr('id', `${props.id}-comment`)
            $comment.text(props.comment)
            $col2.append($comment)
        }

        this.inputs.push({key:props.id, element: $group})

    	return $input
    }


    getValidator(id) {
        if (id in this.validators) {
            return this.validators[id]
        }
    }

    
    /**
     * Validates this form.
     * 
     * A form has zero or more input elements with 'input-validate' class
     * (added when a form input field is created).
     * A  validator function exists for each of these inputs.
     * This validator function could be asynchronous.
     * 
     * This method calls each validator function.
     * Collects response from each validator function.
     * Calls back each input with validation message. The input fields,
     * in turn, will show invalid message if response were invalid.
     *  
     * Finally, calls the given callback function with a message
     * {valid:, reason:}. 
     * 
     * @returns false if any form input returns false
     */
    async validate(cb) {
        if (!(typeof cb === "function")) {
            throw new Error(`no callback function to validate ${this.title()} form`)
        } 
        this.clearFormError()

        let self = this
        let valid = true
        let nTotal = $('.modal-body').find('.input-validate').length
        if (nTotal == 0) {
            cb.call(null, null, {message:'nothing to validate'})
            return
        }
        var nvalid = 0
        var nerror = 0
        let validationTasks = []
        // for each validating input
        $('.modal-body').find('.input-validate').each(function (idx) {
                const id  = $(this).attr('id')
                const val = self.getInputValue(id)
                console.log(`creating valdation task for input [${id}] with value [${val}]`)
                // create a function by binding current user input and a callback function
                // ths callback function invlidates the input if response is not valid
                let fn =  self.validators[id].bind(null, val, (err, response)=>{
                    if (err) nerror++
                    else nvalid++
                    console.log(`received callback ${nvalid+nerror} of expeceted ${nTotal} of validation responses`)
                    if (err) {
                        self.invalidateFormInput(id, err)
                    } 
                    if ((nvalid+nerror) == nTotal) {
                        console.log(`---- validation complete ----- valid=${nvalid} error=${nerror}`)
                        console.log(`calling back ${cb.name}`)
                        let msg = (valid) ? {valid:true} : {valid:false}
                        if (nerror>0) {
                            let err = {message:`${nerror} fields are invalid`}
                            cb.call(null, err, null)
                        } else {
                            let msg = {message:`${nTotal} fields are valid`}
                            cb.call(null, null, msg)                        
                        }
                    } else {
                        let more = nTotal - (nvalid + nerror)
                        console.log(`waiting for ${more} more validation responses...`)
                    }
                })

                validationTasks.push(fn)

        })
        // execute each validatinon task
        const results =  await Promise.all(validationTasks)
        results.forEach((fn) => {fn()})
    }   
    
    
    /**
     * read value of DOM element identifed by id
     * @param {*} id 
     */
    getInputValue(id) {
        var value = this.findElement(id).val();
        //console.log(`${id}=[${value}]`)
        return value
    }

    findElement(id) {
        let eid = (id.startsWith('#')) ? id : `#${id}`
        var $e = $(eid)
        if ($e.length == 0) {
            console.assert(`no element [${eid}] found`)
        }
        return $e                   
    }

    
    /**
     * invalidation sets is-invalid class to gien element
     * and error text to an element whose id is invalid-id
     *  
     * @param {} id 
     * @param {*} err 
     */
    invalidateFormInput(id, err) {
        //console.log(`invalidate form input [${id}] with ${errMsg} `)
        var $el = this.findElement(id)
        $el.addClass('is-invalid')
        var $invalid = this.findElement(`${id}-invalid`)
        $invalid.text(err.reason)
        var $comment = this.findElement(`${id}-comment`)
        $comment.hide()
    }

    clearFormError() {
        $('input').removeClass('is-invalid')
        $('.invalid-feedback').text('')
        $('.form-comment').show()
    }

    /**
    * create a jQuery elment and appends given children 
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