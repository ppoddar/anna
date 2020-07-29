/*
 * A message box, 
 */
class Alert {
	constructor(title, msg) {
		this.title = title
		this.message = msg
		this.modal = this.createModal()
	}
	open() {
		this.modal.modal('show') 
	}
	/*
	 * closes this alert box.
	 * The origina form was showm when alert box was closed.
	 */
	close() {
        if (!this.modal) return
        this.modal.modal('dispose')
        this.modal.remove()
    }
	createModal() {
        if (this.modal) return this.modal
        this.header = this.createHeader()
        this.body   = this.createBody()
        this.body.addClass(`modal-body`)
        this.body.css('overflow-x', 'hidden')
        this.footer = this.createFooter()
		var $content = $('<div>')
		$content.addClass(`modal-content`)
		$content.append([this.header, this.body, this.footer])
        // dialog size is set here
		var $dialog  = $('<div>')
		$dialog.addClass('modal-dialog mx-auto modal-dialog-centered modal-dialog-scrollable')
		$dialog.append($content)
        $dialog.css('overflow-x', 'hidden')
        $dialog.attr('role', 'document')
		this.modal   = $('<div>')
		this.modal.addClass('modal')
		this.modal.append($dialog)
        this.modal.attr('id', 'alert')
        this.modal.attr('tabindex', "-1")
        this.modal.attr('role', "dialog")
        this.modal.attr('aria-labelledby', 'alert')
        this.modal.attr('aria-hidden', "true")

		return this.modal
	}
	
	createHeader() {
        if (this.header) return this.header

        var $text = $('<h4>')
        $text.attr('id', 'modal-title')
        $text.text(this.title)
        $text.css('display', 'inline')
        $text.css('float', 'right')

        var $logo = $('<img>')
        $logo.addClass('d-inline')
		$logo.css('float', 'left')
		// absolute path
        $logo.attr('src', '/images/logo.png')

		var $title  = $('<div>')
		$title.addClass('modal-title')
		$title.append([$logo, $text])
		var $header = $('<div>')
		$header.addClass('modal-header  bg-danger')
		$header.append($title)

		return $header
	}
	
	createBody() {
		let $body = $('<div>')
		$body.addClass('m-auto p-auto')
		$body.html(this.message)
		return $body
	}

    /**
	 * dialog footer houses the actions
	 */
	createFooter() {
		let $ok = $('<button>')
		$ok.addClass('btn btn-warning')
		$ok.text('OK')
		$ok.on('click', () => this.close())
		var $footer  = $('<div>')
		$footer.addClass('modal-footer my-1')
		var $div = $('<div>')
		$div.addClass('d-block w-100 text-center')
        $div.append($ok)
        $footer.append($div)
        
		return $footer
    }
	
}

export default Alert