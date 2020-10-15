
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

class FormInput {
    constructor(props) {
        console.assert('id' in props, 'can not add form input without [id] property')
        this.key        = props.id
        this.label      = props.label || props.id
        this.validator  = undefined
        this.$group = $('<div>')
        this.$group.addClass('form-group form-group-sm row no-gutters')
        var $col1 = $('<div>')
        var $col2 = $('<div>')
        $col1.addClass('col-3')
        $col2.addClass('col-8')
        
        this.$group.css('margin-top', '10px')
        this.$group.css('margin-bottom', '10px')
        this.$group.append([$col1, $col2])

        var $label  = $('<label>')
        $label.addClass('control-label float-right mr-2')
        if (props.required) $label.addClass('font-weight-bold')
    	$label.text(this.label)
        $label.attr('for', props.id)

        $col1.append($label)
    	
    	this.$input = $(props.type=='textarea' ? 'textarea' : '<input>')
        this.$input.addClass('form-control')
    	this.$input.attr('id',   props.id)
        this.$input.attr('type', props.type || 'text')
        this.$input.attr('value', props.value)
        if (props.readonly) this.$input.attr('readonly', true)
        if (props.placeholder) this.$input.attr('placeholder',  props.placeholder)
        $col2.append(this.$input)

        // 
        if (props.validator) {
            this.validator = props.validator
            this.$validation = $('<p>')
            this.$validation.addClass('invalid-feedback text-danger')
            $col2.append(this.$validation)
        }
        
        if (props.comment) {
            this.$comment = $('<small>')
            this.$comment.addClass('form-comment')
            this.$comment.text(props.comment)
            $col2.append(this.$comment)
        }
    }

    getKey() {
        return this.key
    }

    getValue() {
        return this.$input.val()
    }

    element() {
        return this.$group
    }

    

    /*
     * validates this input.
     * zero or more validator functions can be attached to a form input.
     * a validation function can be asynchronous.
     * all validator functions are executed with current value of this
     * input as input. If any of the validator function fails,
     * this input is marked invalid, and given callback is called with
     * an error
     */
    validate(cb) {
        if (this.validator) {
            const val = this.getValue()
            console.log(`form element [${this.getKey()}] value=${val} validator=${this.validator.name} cb`)
            this.validator.call(this, cb)
        }
    }

    /**
     * invalidation sets is-invalid class to gien element
     * and error text to an element whose id is invalid-id
     *  
     * @param {string} reason 
     */
    markInvalid(reason) {
        this.$input.addClass('is-invalid')
        this.$validation.text(reason)
        if (this.$comment) this.$comment.hide()
    }

    clearFormError() {
        if (!this.$validation) return
        this.$input.removeClass('is-invalid')
        this.$validation.text('')
        if (this.$comment) this.$comment.show()
    }

    /*
	 * a validating function is given a value to be validated
	 * and a callback function with signature cb(err)
	 * If the given input value can nt be validated, call
	 * the callback function with a non-null error whose
	 * message described the reason why the input is invalid.
	 * Else call the callback function with null error.
	 * A validating function can be asynchronous
	 */
	checkEmpty(val, cb) {
		//console.log(`check if value [${val}] is empty`)
		if (!val || val.length == 0) {
			cb.call(null, new Error(`${this.label} must be filled in`))
		}
	}
}

export default FormInput