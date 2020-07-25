class PaymentGateway {
	constructor() {
		this.key = {
			id: 'rzp_test_5GjkKK47NrE4b0',
			secret: 'kpwjzn4pPpaVdDlXBqmYq5Ku'
		}
	}

	/**
	 * pay via payment gateway.
	 * 
	 * Steps: 1. create a pay order in Razor Pay -- this is a server side call. 2.
	 * Once a pay order is available, create Razor Pay options. These options are
	 * important for Razor Pay 3. call Razor Pay manually with these options. The
	 * options are set with callback which are defined here. Those callbacks are
	 * called that, in turn, would confirm the payment on server
	 * 
	 * 
	 */
	pay(invoice, customer, cb) {
		var options = this.createRazorPayOptions(invoice, customer, cb)
		new Razorpay(options).open();
	}
	/**
	 * Creates the options to be passed to payment gateway
	 */
	createRazorPayOptions(invoice, customer, cb) {
		var self = this;
		var options = {
			"key": self.key.id,
			"amount": invoice.payorder.amount_due,
			"currency": invoice.payorder.currency,
			"name": "HiraaFood",
			"description": "best food in town",
			"image": "/images/logo.png",
			"order_id": invoice.payorder.id,
			"prefill": {
				"name": customer.name,
				"email": customer.email,
				"contact": customer.phone
			},
			"notes": {
				"address": "note value"
			},
			"theme": {
				"color": "#3b5998"
			},
			/**
			 * callback on success of payment operation
			 */
			"handler": (response) => { this.onPaymentSuccess(response, invoice, cb) },
			/**
			 * callback when payment dialog is closed. Razor Pay automatically
			 * retries on failure.
			 */
			"modal": {
				"ondismiss": () => {

				}
			}
		};
		return options;
	}

	/**
	 * Razor Pay calls back this function when payment is successful. This
	 * function is specified in RazorPay options.
	 */
	onPaymentSuccess(razorPayResponse, invoice, cb) {
		//console.log('response from RazorPay on payment success')
		//console.log(razorPayResponse)
		razorPayResponse['order'] = invoice.id
		var url = `/pay/confirm`
		$.ajax({
			url: url,
			method: 'POST',
			data: JSON.stringify({ order: invoice.id }),
			contentType: 'application/json',
		}).done(function (data) {
			cb.call(null, data)
			
		}).fail(function (err) {
			console.log('razor payment fail')
			console.error(err)
		})
	}
}

export default PaymentGateway



