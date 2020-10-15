const SubApplication = require("./sub-app")
const AddressController = require('./address-controller')
class AddressService extends SubApplication {
    constructor(db, options) {
        super(db, options)
        this.controller = new AddressController(db)

        this.app.post('/', this.createAddress.bind(this))    
        this.app.get('/', this.getAddresses.bind(this))
        this.app.get('/by-id/:id/:uid', this.getAddressById.bind(this))
        this.app.get('/by-kind/:kind/:uid', this.getAddressByKind.bind(this))
    }

    /** 
     * create an address for an user
     */
    async createAddress(req, res, next) {
        try {
            const addr = this.postBody(req)
            try {
                this.controller.validateAddress(addr.kind, addr)
            } catch (e) {
                this.badRequest(req, res, e)
                return
            }
            const update = this.queryParam(req, 'update', false)
            var address
            if (update) {
                address = await this.controller.updateAddress(null, req.params.uid, addr)
            } else {
                address = await this.controller.insertAddress(null, req.params.uid, addr)
            }
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }

    async getAddresses(req, res, next) {
        try {
            let addresses = await this.controller.getAddresses(req.params.uid)
            res.status(httpStatus.OK).json(addresses)
        } catch (e) {
            next(e)
        }
    }

    async getAddressByKind(req, res, next) {
        try {
            const address = await this.controller.getAddressByKind(req.params.uid, req.params.kind)
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }

    async getAddressById(req, res, next) {
        try {
            const address = await this.controller.getAddressById(req.params.uid, req.params.id)
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = AddressService