import OrderTable from "./order-table.js.js.js"

class OrderStausTile {
    constructor($main) {
        console.log('OrderStausTile')
        this.$main = $main
    }

    render() {
        var $main = $('<div>')
        $.ajax({
            url: '/order/all'
        }).done(function(orders){
            console.log(`got ${orders.length} orders`)
            var $dataTable = new OrderTable().render(orders)
            $main.append($dataTable)
        })
        return $main
    }
}

export default OrderStausTile