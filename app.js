let express           = require('express')
let http              = require('http')
let https             = require('https')
let fs                = require('fs')
let autobind          = require('auto-bind')

const httpStatus      = require('http-status-codes')
const Database        = require('./src/database')
const ItemService     = require('./src/item-service')
const OrderService    = require('./src/order-service')
const PaymentService  = require('./src/payment-service')
const UserService     = require('./src/user-service')
const PricingService  = require('./src/pricing-service')
const ValidationService  = require('./src/validation-service')
const CommandLine     = require('./src/commandLine.js')

class Server {
    constructor() {
        this.args = new CommandLine()
        this.port   = this.args.getCommandLineOption('-p')
        this.config = this.args.getConfig('-c', 'config/config.yml')
        const databaseConfig = this.args.getConfig('-d', 'config/database.yml')
        this.database = new Database(databaseConfig)
        this.database.readQueriesFromDir(databaseConfig.sqldir)
        this.itemService    = new ItemService(this.database)
        this.orderService   = new OrderService(this.database)
        this.paymentService = new PaymentService(this.database)
        this.userService    = new UserService(this.database)
        this.pricingService    = new PricingService(this.database)
        this.validationService = new ValidationService()

        autobind(this)
    }

    start() {
        const app = express()
        app.set('port', this.port)
        app.use(express.json());
        app.use(express.static('public'))
        
        app.get('/',            this.info)
        app.get('/info',        this.info)

        app.post('/item/',      this.createItem)
        app.get('/item/',       this.findItem)
        app.get('/item/catalog', this.getCatalog)

        app.post('/order',      this.createOrder)
        app.post('/invoice',    this.createInvoice)

        app.post('/user/login',        this.login)
        app.post('/user/loginAsGuest', this.loginAsGuest)
        app.post('/user/relogin',      this.relogin)

        app.post('/validate/user',      this.validateUserName)
        app.post('/validate/password',  this.validatePassword)
        
        
        const server = http.createServer(app)
        server.listen(this.port)
    }

    async info(req,res,next) {
        const content = fs.readFileSync('info.json')
        const info = JSON.parse(content)
        res.status(httpStatus.OK).json(info)
    }

    async getCatalog(req,res,next) {
        try {
            const catalog = await this.itemService.getCatalog()
            res.status(httpStatus.OK).json(catalog)
        } catch(e) {
            this.handleError(req,res,httpStatus.INTERNAL_SERVER_ERROR, e)
        }
    }
    async findItem(req,res,next) {
        var sku
        try {
            sku = this.queryParam(req,'sku')
        } catch (e) {
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
            return
        }
        try {
            const item = await this.itemService.findItem(sku)
            res.status(httpStatus.OK).json(item)
        } catch(e) {
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
        }
    }
    async createItem(req,res,next) {
        var item
        try {
            item = this.postBody(req, false)
        } catch (e) {
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
            return
        }
        try {
            const message = await this.itemService.createItem(item)
            res.status(httpStatus.OK).json(message)
        } catch(e) {
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
        }
    }

    async createOrder(req,res,next) {
        var uid, items
        try {
            items = this.postBody(req, true)
            uid = this.queryParam(req, 'uid')
            console.log(`items=${items}`)
        } catch (e) {
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
            return
        }
        try {
            const order = await this.orderService.createOrder(this.itemService, uid, items)
            res.status( httpStatus.OK).json(order)
        } catch(e) {
            this.handleError(req, res, httpStatus.INTERNAL_SERVER_ERROR, e)
        }
    }

    async createInvoice(req,res,next) {
        var uid, order, billingAddress_id, deliveryAddress_id
        try {
            uid = this.queryParam(req, 'uid')
            const oid = this.queryParam(req, 'oid') 
            const address_kind = this.queryParam(req, 'address_kind')
            order = await this.orderService.findOrder(oid)
            billingAddress_id  = await this.userService.getAddress(uid, 'billing').id
            deliveryAddress_id = await this.userService.getAddress(uid, address_kind).id
        } catch (e) {
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
            return
        }
        try {
            const invoice = await this.paymentService.createInvoice(
                this.pricingService,
                order,
                billingAddress_id,deliveryAddress_id)
            res.status(httpStatus.OK).json(invoice)
        } catch(e) {
            this.handleError(req, res, httpStatus.INTERNAL_SERVER_ERROR, e)
        }
    }

    async login(req,res,next) {
        try {
            const creds = this.extractAuthrozationHeader(req)
            const session = await this.userService.login(creds.username, creds.password)
            res.status(httpStatus.OK).json(session)
        } catch (e) {
            this.handleError(req, res, httpStatus.FORBIDDEN, e)
        }
    }

    async relogin(req,res,next) {
        try {
            let authToken = req.headers['x-auth-token']
            const session = await this.userService.relogin(authToken)
            res.status(httpStatus.OK).json(session)
        } catch (e) {
            this.handleError(req, res, httpStatus.FORBIDDEN, e)
        }
    }

    async loginAsGuest(req,res,next) {
        try {
            const session = await this.userService.loginAsGuest()
            res.status(httpStatus.OK).json(session)
        } catch (e) {
            this.handleError(req, res, httpStatus.FORBIDDEN, e)
        }
    }


    extractAuthrozationHeader(req) {
        if (!req.headers.authorization) {
            throw new UserError(`no authorization header`);
        }
        let auth = req.headers.authorization.replace('Basic', '').trim()
        var decoded = Buffer.from(auth, 'base64').toString('ascii')
        //console.log(`credentials decoded:${decoded} original:${auth}`)
        let tokens = decoded.split(':')
        return {username: tokens[0], password: tokens[1]}
    }

    async validateUserName(req, res,next) {
        var username
        try {
            username = this.postBody(req).value
            //console.log(`request argument is of type ${username.constructor.name}`)
            this.validationService.validateUsername(username)
            res.status(httpStatus.OK)
            res.end()
        } catch (e) {
            console.error(e)
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
        }
    }

    async validatePassword(req, res,next) {
        var password
        try {
            password = this.postBody(req).value
            this.validationService.validatePassword(password)
            res.status(httpStatus.OK)
            res.end()
        } catch (e) {
            this.handleError(req, res, httpStatus.BAD_REQUEST, e)
        }
    }

    

    postBody(req, isArray) {
        if (req.body) {
            if (isArray && !Array.isArray(req.body)) {
                throw new Error(`request ${req.url} body should be array`)
            } 
            const payload = req.body

            //console.log(`content type  ${req.url} is ${req.headers['content-type']}`)
            //console.log(`POST body of request ${req.url} is of type ${payload.constructor.name}`)
            return payload
        } else {
            throw new Error(`request ${req.url} requires a body. but none exists`)
        }
    }
    queryParam(req, p) {
        if (p in req.query){
            return req.query[p]
        } else {
            throw new Error(`request ${req.url} requires query parameter [${p}]. but none exists`)
        }
    }

    handleError(req, res, status, e) {
        console.error(e)
        const message = {url:req.url, message:e.message}
        res.status(status).json(message)
    }



}


new Server().start()
