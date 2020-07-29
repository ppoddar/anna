import WidgetFactory from "../widgets/widget-factory.js"
import Alert from "./alert.js"

const HEADER_STYLES = {
    'info'   : 'bg-primary',
    'warning': 'bg-warning',
    'error'  : 'bg-danger'
}
const MODAL_SIZES = {
    'small' : 'modal-sm',
    'large' : 'modal-lg'
}

const DEFAULT_OPTIONS = {
    id: 'basic-dialog',
    title: '',
    type: 'info',
    size: 'large'
}

function back() {
    window.history.back()
}

/**
 * basic dialog has a form as its body and customizable
 * header. 
 * The actions are hosted in footer.
 * 
 * type property determins style of the header
 */
class BasicDialog {
    /**
     * create a basic dialog with given options
     * 
     * @param {object} options
     *  id
     *  title
     *  type
     *  size
     */
    constructor(options) {
        this.options = Object.assign(DEFAULT_OPTIONS, options)
        this.actions = [] // array of buttons

        this.size = MODAL_SIZES[this.options.size]

        this.header = undefined
        this.body   = undefined
        this.footer = undefined
        this.form   = undefined
        this.modal  = undefined
    }

    
    setTitle(title) {
        this.options.title = title
        $('#modal-title').text(title)

    }
    
    setForm(form) {
        this.form = form
        if (this.body) {
            this.body.empty()
            this.body.append(this.form.createBody())
        }
    }
    /**
     * Opens this dialog
     * NOTE:the form must be set before open
     */
    open() {
        console.assert (this.form, 'can not open dialog without form')
        this.createModal().modal('show') 
    }

    /**
     * close this dialog
     */
    close() {
        if (!this.modal) return
        this.modal.modal('dispose')
        this.modal.remove()
        $('.modal-backdrop').remove();
        $('.modal').remove();
        $( 'body' ).removeClass( "modal-open" );
    }

    /**
     * creates each component (header, body and footer) of a dialog 
     * subclasses can override to custoize look and feel of each part
     */
	createModal() {
        if (this.modal) return this.modal
        console.assert(this.form, 'no form')
        this.header = this.createHeader()
        this.body   = this.form.createBody()
        this.body.addClass(`modal-body-${this.size}`)
        this.body.css('overflow-x', 'hidden')
        this.footer = this.createFooter()
		var $content = this.$el('<div>', `modal-content`,
            [this.header, this.body, this.footer])
        // dialog size is set here
        var $dialog  = this.$el('<div>', 
            `modal-dialog mx-auto modal-dialog-centered modal-dialog-scrollable ` ,
            $content)
        $dialog.css('overflow-x', 'hidden')
        $dialog.attr('role', 'document')
        this.modal   = this.$el('<div>', 'modal', $dialog)
        this.modal.attr('id', this.options.id)
        this.modal.attr('tabindex', "-1")
        this.modal.attr('role', "dialog")
        this.modal.attr('aria-labelledby', this.options.id)
        this.modal.attr('aria-hidden', "true")

		return this.modal
    }
    /**
     * creates a  header.
     * Header shows a title and a logo
     */
    createHeader() {
        if (this.header) return this.header

        var $text = $('<h4>')
        $text.attr('id', 'modal-title')
        $text.text(this.options.title)
        $text.css('display', 'inline')
        $text.css('float', 'right')

        var $logo = this.$el('<img>')
        $logo.addClass('d-inline')
        $logo.css('float', 'left')
        $logo.attr('src', '/images/logo.png')

        var $title  = this.$el('<div>', 'modal-title', [$logo, $text])
        var $header = this.$el('<div>', 'modal-header', $title)
        $header.addClass(HEADER_STYLES[this.options.type])

		return $header
    }

    /**
	 * dialog footer houses the actions
	 */
	createFooter() {
        console.assert(this.actions.length > 0, 'no actions')
		var $footer  = this.$el('<div>', 'modal-footer my-1')
        var $div = this.$el('<div>', 'd-block w-100 text-center')
        $div.append(WidgetFactory.createButtonGroup(this.actions))
        $footer.append($div)
        
		return $footer
    }

    /**
     * creates a button for an action.
     * On click of each button, the form is validated.
     * If form is validated, then button action is called 
     * with form inputs as argument
     * 
     * 
     * @param {} props has following properties
     * <ul>
     *   <li> type            : primary|seconday etc. Defaults to primary
     *   <li> label           : label on the button
     *    disabled        : if true, the button will appear disabled
     *                      Defaults to false 
     *    close           : if true, the dialog will close. 
     *                      Defaults to true
     *    action          : function that will be called. 
     *                      Default is to close the dialog
     *    ctx             : if an action, it will be called in the context
     *                     Defaults to null
     * </ul>
     */
    createAction(props) {
        //console.log(`creating action from `)
        //console.log(props)
        console.log(`creating button with ${JSON.stringify(props)}`)

        var $button = WidgetFactory.createButton(props.label, props.type)
        this.actions.push($button)

        $button.attr('disabled', props.disabled || false)
        $button.data('close',    props.close    || false)
        var self = this

        $button.on('click', function(evt)  {
            evt.stopPropagation()
            evt.preventDefault()
            //var _this = $(this)
            //console.log(`button [${_this.text()}]  clicked` )
            self.form.validate((error, valid)=> {
                //console.log(`${this.constructor.name} has received final validation response ${JSON.stringify(message)}`)
                if (valid) { // call action associated with the button
                    props.action.call(null)
                } // else form will show invalidation error messages
            })
 
        })
        return $button
    }
    
    /**
    * shortcut to create a jQuery elment and append given children 
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
export default BasicDialog