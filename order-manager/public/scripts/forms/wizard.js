import BasicDialog from "./basic-dialog.js";
import BasicForm from "./basic-form.js";


class Wizard extends BasicDialog {
    constructor() {
        super()
        this.pages = []
        this.currentIdx  = -1
        this.inputValues = {} // combined dictionary of all pages
        // buttons to navigate through the pages
        this.$prev   = this.createAction({label:'prev',       
            action: this.prev.bind(this)})
        this.$next   = this.createAction({label:'next',  
            validate:true,     
            action: this.next.bind(this)})
        this.$finish = this.createAction({label:'finish',  
            validate:true,     
            action: this.finish.bind(this)})
    }

    addIntroPage(title, msg) {
        const intro = new BasicForm(this, {title:title})
        const $info = $('<p>')
        $info.html(msg)
        intro.addInput($info)
        this.pages.unshift(intro)
    }
    /*
     * title of the dialog is title of current page
     */
    getTitle() {
        if (this.currentIdx >= 0) {
            return this.pages[this.currentIdx].title
        } else {
            return this.options.title
        }
    }

    /**
     * set the first child page as form before opening 
     */
    open() {
        console.assert(this.pages.length > 0, 'can not open wizard without pages')
        this.setPage(0)
        super.open()
    }

    addPage(page) {
        console.assert(page instanceof BasicForm, 
            `wizard page must be basic form. But given ${page.constructor.name} is not a BasicForm`)
        this.pages.push(page)
    }

    /**
     * sets form for this wizrad as child page at given index.
     * The current index changes to given value
     * @param {*} idx the index of the page to be shown
     */
    setPage(idx) {
        console.assert(idx >= 0 && idx < this.pages.length, `page index ${idx} out of bound`)
        if (idx < 0 || idx >= this.pages.length) return
        this.currentIdx  = idx
        let page = this.pages[idx]
        console.log(`set page ${idx} [${page.getTitle()}]`)
        this.setForm(page)
        this.setNavigation(idx)
    }
    
    /*
     * sets state of navigation buttons
     */
    setNavigation(idx) {
        console.log(`set navigation for page ${idx}`)
        this.$next.attr('disabled', (idx+1 >= this.pages.length))
        this.$prev.attr('disabled', idx <= 0)
        var page = this.pages[idx]
        //console.log(`page ${page.getTitle()} hasRequiredInput = ${page.hasRequiredInput}`)
        var canFinish = !page.hasRequiredInput
        for (var i = idx+1; i < this.pages.length; i++) {
            page = this.pages[i]
            //console.log(`page ${page.getTitle()} hasRequiredInput = ${page.hasRequiredInput}`)
            canFinish = canFinish && !page.hasRequiredInput
        }
        //console.log(`page ${this.pages[idx].getTitle()} canFinish = ${canFinish}`)
        this.$finish.attr('disabled', !canFinish)
    }

    /*
     * shows next page, if possible.
     *
     * @return page index 
     */
    next() {
        //console.log(`next called at ${this.currentIdx}`)
        if (this.currentIdx < 0) {
            return
        }
        let currentPage = this.pages[this.currentIdx]
        let values = currentPage.collectInputs()
        console.log(`input values from ${currentPage.getTitle()}`)
        console.log(values)
        this.inputValues = Object.assign(this.inputValues,values)

        this.setPage(this.currentIdx+1)
    }

    /*
     * set previous page
     */
    prev() {
        this.setPage(this.currentIdx-1)
    }
    /*
     */
    finish() {
        let page = this.pages[this.currentIdx]
        let values = page.collectInputs()
        console.log(`input values from ${page.getTitle()}`)
        this.inputValues = Object.assign(this.inputValues, values)
        // call onComplete() function with all inputs of wizard pages
        // by default does nothing
        this.onComplete(this.inputValues)
        // dialog window can be closed by one who opened it
        super.close()
    }
    
    onComplete(userinputs) {

    }
}
export default Wizard