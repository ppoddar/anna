

/**
 * thin wrapper over jQuery data table
 */
class DataTableView {
    
    constructor() {
    }

    /**
     * creates <table> DOM element and poulates with given data
     * and colum definition
     * @param {*} $el an existing DOM element with <table> tag 
     * @param {*} data table for data table
     * @param {*} columnDefs an array of column definition
     * each defiition must have {data,title,width}
     * 
     * @returns a datatable created
     */
    render($el, data, columnDefs, options) {
        const DEFAULT_DATATABLE_OPTIONS = {
            "scrollY":        "200px",
            "scrollCollapse": true,
            "paging":         false,            
            "bAutoWidth": false,
            'destroy': true,
            'data'   : data,
            'columns': columnDefs,
            "dom": "tip"  // configures auxilary HTML elements around a data table
        }
        let datatableOptions = Object.assign({}, DEFAULT_DATATABLE_OPTIONS, options)
        this.createTable($el, columnDefs,options)
        let datatable = $el.DataTable(datatableOptions)
        return datatable
    }

    createTable($table, columnDefs,options) {
        var $thead = $('<thead>')
        var $row = $('<tr>')
        $thead.append($row)
        for (var i = 0; i < columnDefs.length; i++) {
            var col = columnDefs[i];
            var $th = $('<th>')
            if (col.width) $th.css('width', col.width)
            $row.append($th)
        }
        var $caption = $('<caption>')
        if (options && options.caption) $caption.text(options.caption)
        var $tbody = $('<tbody>')
        $table.append($caption, $thead, $tbody)

        return $table
    }
}

export default DataTableView