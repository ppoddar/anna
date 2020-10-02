var STATUSES = {
    "created": {},
    "payment_confirmed": {},
    "accepted": {},
    "preparing": {},
    "prepared": {},
    "packing": {},
    "packed":{},
    "ready_for_delivery": {},
    "in_delivery": {},
    "delivered": {},
    "cancelled": {}

}

const GROUP = 'status'
class StatusChoice {

    render() {
        var $label = $('<label>')
        $label.text('select status')
        var $radioGroup = $('<div>')
        for (var status in STATUSES) {
            var $radio = this.createRadio(status)
            $radioGroup.append($radio)
        }
        return $radioGroup
    }

    createRadio(status) {
        var $radio = $('<input>')
        $radio.attr('type', 'radio')
        $radio.attr('name', GROUP)
        $radio.attr('checked', status.checked)
        var $label = $('<label>')
        $label.text(status.label)
        return [$radio, $label]
    }

    getSelected() {
        $('input[type=radio]:checked')
    }


}
export default StatusChoice