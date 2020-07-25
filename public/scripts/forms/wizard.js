import BasicDialog from "./basic-dialog.js";
import BasicForm from "./basic-form.js";


class Wizard extends BasicDialog {
    constructor() {
        super()
        this.pages = []
        this.currentIdx  = -1
        this.inputValues = {}

        this.$prev   = this.createAction({label:'prev',       
            action: this.prev.bind(this)})
        this.$next   = this.createAction({label:'next',  
            validate:true,     
            action: this.next.bind(this)})
        this.$finish = this.createAction({label:'finish',  
            validate:true,     
            action: this.finish.bind(this)})
        this.$close  = this.createAction({label:'close',      
            action: this.close.bind(this)})
    
    }
    

    /**
     * set the first child page as form before opening 
     */
    open() {
        this.setPage(0)
        super.open()
    }
    addPage(page) {
        console.assert(page.form instanceof BasicForm, 'wizard page must be basic form')
        this.pages.push(page)
    }

    /**
     * sets form for this wizrad as child page at given index
     * @param {*} idx 
     */
    setPage(idx) {
        //console.log(`set page ${idx}`)
        console.assert(idx >= 0 && idx < this.pages.length, 'page index out of bound')
        this.currentIdx  = idx
        let page = this.pages[idx]
        this.setForm(page.form)
        this.setTitle(page.title)
        this.setNavigation(idx)
    }
    

    setNavigation(idx) {
        this.$next.attr('disabled', (idx+1 >= this.pages.length))
        this.$prev.attr('disabled', idx <= 0)
        this.$finish.attr('disabled', !this.pages[idx].finish)
    }


    next(data) {
        console.log(`next called with  ${JSON.stringify(data)}`)
        let page = this.pages[this.currentIdx]
        let values = page.form.collectInputs()
        console.log(`input values from ${page.title}`)
        console.log(values)
        this.inputValues = Object.assign(this.inputValues,values)

        this.setPage(this.currentIdx+1)
    }

    prev() {
        this.setPage(this.currentIdx-1)
    }

    finish() {
        let page = this.pages[this.currentIdx]
        let values = page.form.collectInputs()
        console.log(`input values from ${page.title}`)
        this.inputValues = Object.assign(this.inputValues, values)
        //console.log('complete input values')
        //console.log(this.inputValues)
        this.onComplete(this.inputValues)
    }

    close() {
        super.close()
    }

    

}
export default Wizard