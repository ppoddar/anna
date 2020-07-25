import DataTableView from './datatable.js'

function timeDifference(data) {
    var date = new Date(data)
    var diff = (new Date().getTime() -  date.getTime())/(1000*60)
    let hour = Math.floor(diff/60)
    let min  = Math.floor(diff%60)

    return `${hour}h ${min}m ago`
}
/**
 * a specialized table for Orders
 */
var STATUS_STYLES = 
    {'created' : 'text-success',
    'confirmed': 'text-primary',
    'cancelled': 'text-danger'
    }

/**
 * columns in an Order table
 */
var COLUMN_DEFS = [
    {data : 'id',     title: 'Order'},
    {data : 'user',   title: 'Customer'},
    {data : 'status', title: 'Status',
     createdCell: function(td, cellData, rowData, row, col)  {
         var style = STATUS_STYLES[cellData.toLowerCase()]
         console.log(`status=${cellData} style=${style}`)
         return $(td).addClass(style)
    }},
    {data : 'amount',  title: 'Amount'},
    {data : 'created', title  : 'Time',
        render:(data,type,row)=>{
            return timeDifference(data)
            
        }}
]

class OrderTable extends DataTableView {
    constructor() {
        super()
    }

    render($el, data, options) {
        let datatable = super.render($el, data, COLUMN_DEFS, options)
        return datatable
    }
}
export default OrderTable