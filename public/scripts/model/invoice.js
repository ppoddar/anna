import Amount from "../widgets/amount.js"
import InvoiceItem from './invoice-item.js'


class Invoice {
    constructor(obj) {
        console.log('creating invoice from')
        console.log(obj)
        this.id      = obj['id']
        this.amount  = obj['amount']
        this.created = obj['created']
        this.items   = obj['items']
        this.payorder = obj['payorder']
    }
    render(opts) {
        let options = opts || {}
        console.log(`invoice \n ${this}`)
        let $main = $('<div>')
        $main.addClass('container-fluid')
        $main.append(this.renderTitle())
        if (options.print) {
            $main.append(this.renderDate(this.created))
        }
        for (var i = 0; i < this.items.length; i++) {
            $main.append(new InvoiceItem(this.items[i]).render(options))
        }  
        $main.append(this.renderTotal())
        return $main
    }

    separator() {
        var $sep = $('<hr>')
        $sep.addClass('solid')
        $sep.css('margin', '0px')
        $sep.css('padding', '0px')
        return $sep
    }

    renderDate(date) {
        var $row = this.alignedRow(' ', date, false)
        return $row
    }

    renderTitle() {
        let $title = $('<span>')
        $title.text(this.id)
        $title.addClass('invoice-title')
        return $title
    }

   
    renderTotal() {
        let total = new InvoiceItem({description:'Total', kind:'TOTAL', amount:this.amount})
        return total.render()
    }

    // renderItem(item) {
    //     var amount = ('discount' == item.kind.toLowerCase()) ? -item.amount : item.amount
    //     var $row = this.alignedRow(item.description, amount, true, ITEM_STYLE[item.kind])
    //     $row.css('margin-bottom', '-20px')
        
    //     return $row
    // }

    /**
     * create a row with two columns.
     * first column, if present,  is algned left
     * second column, if present, is algned right
     * @param {} name 
     * @param {*} price 
     */
    alignedRow(c1, c2, price, style1, style2) {
        let $row= $('<div>')
        $row.addClass('row')
        var $col = $('<div>')
        $col.addClass('col-12')
        $row.append($col)
        var $align = $('<div>')
        $align.addClass('d-flex align-items-middle')
        $col.append($align)

        let $c1 = $('<span>')
        if (style1) $c1.addClass(style1)
        $c1.css('flex-grow', '1')
        $c1.text(c1)
        $align.append($c1)
    
        if (c2) {
            let $c2
            if (price) {
                $c2 = new Amount(c2).render() 
            } else {
                $c2 = $('<span>')
                $c2.text(c2)
            }
            $c2.addClass('float-right')
            if (style2) $c2.addClass(style2)
            $align.append($c2)
        }

        return $row    
    } 

    renderAddress(label, addr) {
        if (addr) {
            var $label = this.alignedRow(label)
            var $address = addr.render()
            return [$label, $address]
        }
    }
}

export default Invoice