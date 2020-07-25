import Amount from "../widgets/amount.js"
import InvoiceItem from './invoice-item.js'

const ITEM_STYLE = {
    "PRICE"    : "",
    "DISCOUNT" : "text-success",
    "TAX"      : "text-danger",
    
}
class Invoice {
    constructor(obj) {
        console.log('creating invoice from')
        console.log(obj)
        this.id      = obj['id']
        this.amount  = obj['amount']
        this.created = obj['created']
        this.items   = obj['items']
        this.payorder = obj['payorder']
        this.billingAddress  = obj['billingAddress']
        this.deliveryAddress = obj['deliveryAddress']
        this.sameAddress     = obj['sameAddress']
        
    }
    /**
     * renders as a series of rows.
     * 
     */

     /*
    render(print) {
        console.log('invoice')
        console.log(this)
        let $main = $('<div>')
        $main.addClass('container-fluid')
        $main.append(this.renderTitle())
        if (print) {
            $main.append(this.renderDate(this.created))
            $main.append(this.separator())
        }
        if (print) {
            var $deliveryAddress = this.renderAddress('deliver to:', this.deliveryAddress)
            $main.append($deliveryAddress)
            $main.append(this.separator())
        }
        for (var sku in this.items) {
            var $item = this.renderItem(this.items[sku])
            $main.append($item)
        }  
        $main.append(this.renderTotal())
        if (print) {
            $main.append(this.separator())
            var $billingAddress  = this.renderAddress('biil to:',   this.billingAddress)
            if (!this.sameAdress) {
                $main.append($billingAddress)
                $main.append(this.separator())
            } else {

            }
            //$main.append(this.renderFooter())
        }
        return $main

    }
    */
    render() {
        $('#invoice-number').text(this.id)
		for (var sku in this.items) {
			var li   = new InvoiceItem(this.items[sku])
			let $row = li.render()
			$('#invoice-items').append($row)
		}
		$('#invoice-total').append(new Amount(this.amount).render())
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
        var text = `Order ${this.id}`
        let $title = this.alignedRow(text,'', false, 'font-weight-bold')
        return $title
    }

   
    renderTotal() {
        var $row = this.alignedRow('Total', this.amount, true, 'font-weight-bold','font-weight-bold')
        $row.css('margin-top', '20px')
        return $row
    }

    renderItem(item) {
        var amount = ('discount' == item.kind.toLowerCase()) ? -item.amount : item.amount
        var $row = this.alignedRow(item.description, amount, true, ITEM_STYLE[item.kind])
        $row.css('margin-bottom', '-20px')
        
        return $row
    }

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