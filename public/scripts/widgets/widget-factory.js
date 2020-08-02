const BUTTON_STYLES = {
    'primary':   'btn btn-primary   round mx-1 my-1',
    'secondary': 'btn btn-warning   round mx-1 my-1 small',
    'label': '    btn btn-warning   round mx-1 my-1'
}


class WidgetFactory {
    static createButton(text, type) {
        var $button = $('<button>')
        var style = BUTTON_STYLES[type || 'primary']
        $button.attr('id', text)
        $button.addClass(style)
        $button.text(text)

        return $button
    }

    static createLabel(text, style, forId) {
        var $label = $('<label>')
        $label.text(text)
        if (style) $label.addClass(style)
        if (forId) $label.attr('for', forId)

        return $label
    }

    static createButtonGroup($buttons) {
        var $group = $('<div>')
        for (var i = 0; i < $buttons.length; i++) {
            $group.append($buttons[i])
        }
        return $group
    }

    /**
     * wraps a button in a row
     * @param {object} props configuration of the button
     */
    static wrapButtonRow($button) {
        var $row = WidgetFactory.$el('<div>', "row d-flex justify-content-center");
        var $col = WidgetFactory.$el('<div>', "col-md-6 text-center")        
		$col.append($button)
        $row.append($col)
        return $row
    }

    

    /**
    * create a jQuery elment and appends given children 
    * @param tag
    * @param cls
    * @param $children
    * @returns
    */
   static $el(tag, cls, $children) {
    if (!tag.startsWith('<')) {
        tag = '<' + tag + '>'
    }
    var $el = $(tag)
    if (cls) $el.addClass(cls)
    if ($children) $el.append($children)
    return $el
}
}

export default WidgetFactory