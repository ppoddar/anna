const os              = require('os')
const express         = require('express')
const http            = require('http')
const https           = require('https')
const fs              = require('fs')
const autobind        = require('auto-bind')
const httpStatus      = require('http-status-codes')
const CommandLine     = require('./src/commandLine.js')
const Database        = require('./src/database')
const ItemService     = require('./src/item-service')
const OrderService    = require('./src/order-service')
const PaymentService  = require('./src/payment-service')
const UserService     = require('./src/user-service')
const PricingService  = require('./src/pricing-service')
const ValidationService  = require('./src/validation-service')
const ErrorHandler    = require('./src/errors').ErrorHandler
const morgan          = require('morgan')('combined')

class Server {
    /*
     * a server is configured from command-line arguments
     * Arguemnts: (optional unless explict )
     *   -p        : server port. Required
     *   --secure  : starts https server. Otherwuse http server 
     *   -c        : A JSON file for server configuration
     *               Defaults to config/config.json
     *   -d        : A JSON file for database configuration
     *               Defaults to config/database.json
     */
    constructor() {
        this.cmd        = new CommandLine()
        this.secure     = this.cmd.isPresent('--secure')
        this.port       = this.cmd.getCommandLineOption('-p')
        this.docroot    = this.cmd.getCommandLineOption('--docroot', 'public')
        this.config     = this.cmd.getConfig('-c', 'config/config.json')
        if (this.secure) {
         if ('security' in this.config) {
            this.security = this.config.security
         } else {
             throw new Error('no security section in configuration')
         }
        }
        console.log(`listen port ${this.port}`)
        console.log(`secure ${this.secure}`)
        const databaseConfig = this.cmd.getConfig('-d', 'config/database.json')
        this.database = new Database(databaseConfig)

        // all services use a database 
        this.itemService        = new ItemService(this.database, this.config['item-service'] || {})
        this.orderService       = new OrderService(this.database, this.config['order-service'] || {})
        this.paymentService     = new PaymentService(this.database, this.config['payment-service'] || {})
        this.userService        = new UserService(this.database, this.config['user-service'] || {})
        this.pricingService     = new PricingService(this.database, this.config['pricing-service'] || {})
        this.validationService  = new ValidationService()
        // establish service dependencies
        this.orderService.itemService = this.itemService
        this.paymentService.pricingService = this.pricingService

        autobind(this)

    }

    
    /*
     * starts the services and sets the routes
     */
    start() {
        const app = express()
        app.set('port', this.port)

        app.use(express.json());
        app.use(express.static(this.docroot))
        app.use(morgan)
        app.use('/user',     this.userService.app)
        app.use('/item',     this.itemService.app)
        app.use('/order',    this.orderService.app)
        app.use('/invoice',  this.paymentService.app)
        app.use('/validate', this.validationService.app)
        
        // route definitions
        app.get('/info',        this.info)
        app.use(ErrorHandler)

        var server 
        if (this.secure) {
            const securityOptions = {
              key: fs.readFileSync(this.security['key']),
              cert: fs.readFileSync(this.security['cert'])
            };
            server = https.createServer(securityOptions, app)
        } else {
            server = http.createServer(app)
        }

        
        var protocol = this.secure ? 'https' : 'http'
        var host = os.hostname()
        console.log(`starting ${protocol}://${host}:${this.port}`)
        /*
        process.on('uncaughtException', function (e) {
            console.log(`***ERROR:${e}`)
            process.exit(1)
        })
        server.on('error', function (e) {
            console.error(`***ERROR:${e}`)
            process.exit(1)
        })
        */
        server.listen(this.port)


    }

    async info(req,res,next) {
        const content = fs.readFileSync('info.json')
        const info = JSON.parse(content)
        res.status(httpStatus.OK).json(info)
    }
 }


new Server().start()
