import Action from '../action.js'
import Alert from '../forms/alert.js'
class PaymentGateway {
	/*
	constructor() {
		this.key = {
			id: 'rzp_test_5GjkKK47NrE4b0',
			secret: 'kpwjzn4pPpaVdDlXBqmYq5Ku'
		}
	}
	*/
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
	async pay(invoice,user) {
		console.log(`opening razorpay for ${invoice.amount}`)
		Action.getPaymentGatewayCredentials((err, response)=> {
			console.log(`pay:recived payment options : ${JSON.stringify(response)}`)

			var paymentOptions = {}
			paymentOptions.key_id = response.key_id
			paymentOptions.order_id =  invoice.payorder.id
			paymentOptions.amount = invoice.payorder.amount
			paymentOptions.currency = "INR"
			paymentOptions.name = "Hiraafood"
			paymentOptions.description = "best food in town"
			paymentOptions.image = "/images/logo.png"
			paymentOptions.prefill = {
			  "name": user.name,
			  "email": user.email,
			  "contact": user.phone
			}
			paymentOptions.theme = {"color": "#3b5998"}			
			paymentOptions.hanlder = (response) => {
			  console.log('razorpay response')
			  console.log(response)
			}
			paymentOptions.modal = {
				ondismiss : () => {
					const message = `payment is cancelled`
					new Alert('Payment Cancelled', message).open()
				}
			}
			
			console.log(JSON.stringify(paymentOptions))

			
			new Razorpay(paymentOptions).open()
			

		  })
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



