const os              = require('os')
const express         = require('express')
const cookieParser   = require('cookie-parser')
const session = require('express-session')

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
const { MemoryStore } = require('express-session')
const ErrorHandler    = require('./src/errors').ErrorHandler
const morgan          = require('morgan')('tiny')

let COOKIE_NAME = 'hiraafood'
let ENTRY_PAGES  = ['/', './index.html', './login.html']

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
     * --docroot
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
        this.pricingService.itemService = this.itemService 
        this.paymentService.pricingService = this.pricingService

        autobind(this)

    }

    
    /*
     * starts the services and sets the routes
     */
    start() {
        this.app = express()
        this.app.set('port', this.port)
        this.app.use(morgan)
        this.app.use(cookieParser())
        this.app.use(session({
            name: 'hiraafood',
            saveUninitialized:true,
            resave:true, 
            secret:'hiraafood',
            cookie:{path:'/'}}))
        // every path are served only if in a session
        this.app.use('/*.html', this.getCurrentSession.bind(this))

        // access to admin pages
        this.app.use(express.static(this.docroot))
        //this.app.use('/admin', [this.ensureAuthenticated, express.static('/admin')])
        
        
        this.app.use(express.json());

        this.app.use('/user',     this.userService.app)
        this.app.use('/item',     this.itemService.app)
        this.app.use('/order',    this.orderService.app)
        this.app.use('/invoice',  this.paymentService.app)
        this.app.use('/validate', this.validationService.app)


         // route definitions
         this.app.get('/info',        this.info)
         this.app.use(ErrorHandler)

        var server 
        if (this.secure) {
            const securityOptions = {
              key: fs.readFileSync(this.security['key']),
              cert: fs.readFileSync(this.security['cert'])
            };
            server = https.createServer(securityOptions, this.app)
        } else {
            server = http.createServer(this.app)
        }

        
        var protocol = this.secure ? 'https' : 'http'
        var host = os.hostname()
        console.log("--------------------------------------------------")
        console.log(`\x1b[32m starting ${protocol}://${host}:${this.port} \x1b[0m`)
        console.log("--------------------------------------------------")

        
        process.on('uncaughtException', function (e) {
            console.log(`***ERROR:${e}`)
            console.trace(e)
            process.exit(1)
        })
        
        server.listen(this.port)


    }

    async info(req,res,next) {
        const content = fs.readFileSync('info.json')
        const info = JSON.parse(content)
        res.status(httpStatus.OK).json(info)
    }

    

    /*
     * The first middleware checks if request has a named cookie.
     * If not, if returns http status HttpStatus.UNAUTHORIZED 
     * else an HttpStatus.OK response.
     * 
     * Always returns OK for initail page urls
     */
    async getCurrentSession(req,res,next) {
        if (ENTRY_PAGES.includes(req.url)) {
            console.log(`no check for entry page ${req.url}`)
            next()
            return // IMPORTANT:must call return
        }

        try {
            console.log(`${req.originalUrl} parsed ${Object.keys(req.cookies).length} cookies:`)
            // req.cookies is a dictionary(name:value) are parsed by cookie-parser
            if (COOKIE_NAME in req.cookies) {
                console.log(`!found cookie ${COOKIE_NAME} = ${req.cookies[COOKIE_NAME]}`)
                res.status(httpStatus.OK)
                next()
                return
            } else {
                console.log(`cookie ${COOKIE_NAME} not found`)
                res.status(httpStatus.UNAUTHORIZED).end()
            }
        } catch (e) {
            console.error(e)
            next(e)
        }
    }
 }


new Server().start()
