const httpStatus = require('http-status-codes')
const SubApplication = require('./sup-app')
const AuthenticationError = require('./errors').AuthenticationError

let COOKIE = 'hiraafood'
let LOGIN_PAGE = '/login.html'

class UserService extends SubApplication {
    constructor(db,options) {
        super(db,options)
        this.app.post('/create', this.createUser.bind(this))
        this.app.post('/login',  this.login.bind(this))
        this.app.post('/loginAsGuest', this.loginAsGuest.bind(this))
        this.app.post('/relogin', this.relogin.bind(this))
        this.app.get('/address', this.getAddress.bind(this))
        this.app.get('/addresses', this.getAddresses.bind(this))
        this.app.post('/address', this.createAddress.bind(this))
    }

    /*
     */
    async authorize(req,res,next) {
        console.log(`==========> authorize ${req.url} user=${req.user}`)
        if (req.url == '/' || req.url == '/index.html' || req.url == LOGIN_PAGE) {
            next()
            // must call return
            return
        }
        if (req.session.user) {
            next()
            return
        }
        console.log(`redicting to ${LOGIN_PAGE}`)
        return res.redirect(LOGIN_PAGE)
        
    }

    async authenticate(uid, pwd, callabck) {
        let user = await this.db.executeSQL('find-user', [uid])
        if (!user) {
            callabck.call(null, new AuthenticationError('user-not-found', [uid]))
        } else {
            user.roles = user.roles.split(',')
            let row = await this.db.executeSQL('authenticate-user', [uid, pwd])
            if (!row) {
                callabck.call(null, new AuthenticationError('wrong-password', [uid] ))
            } else {
                callabck.call(null, null, user)
            }
        }
    }

    /*
     * Login a user.
     * Request carries basic authentication header
     * Response cookies are sent back
     */
    async login(req, res, next) {
        try {
            const creds = this.extractAuthrozationHeader(req, res)
            const uid = creds.username
            const pwd = creds.password
            await this.authenticate(uid,pwd, (err,user)=> {
                console.log(`authenticate callback has received error ${err} user=${user}`)
                if (!err) {
                    req.session.regenerate(function(){
                        req.session.user = user
                        res.cookie(COOKIE, {id:req.session.id})
                        res.status(httpStatus.OK).json(user)
                    })
                } else {
                    res.status(httpStatus.FORBIDDEN).json({message:err})
                }
            })
        } catch (e) {
            console.error(e)
            next(e)
        }
    }


    async relogin(req, res, next) {
        try {
            let authToken = req.headers['x-auth-token']
            let session = await this.findSession(authToken)
            if (!session) {
                throw new AuthenticationError('no-seesion', [authToken])
            }
            res.status(httpStatus.OK).json(session)
        } catch (e) {
            next(e)
        }
    }

    async loginAsGuest(req, res, next) {
        try {
            const guest = { id: 'guest', home: 'customer' }
            req.session.user = guest
            res.cookie(COOKIE, {id:0})
            res.status(httpStatus.OK).json(guest)
        } catch (e) {
            next(e)
        }
    }


    extractAuthrozationHeader(req, res) {
        if (!req.headers.authorization) {
            res.status(httpStatus.BAD_REQUEST).json({ message: `no authorization header in ${req.url}` })
            res.end()
        }
        let auth = req.headers.authorization.replace('Basic', '').trim()
        var decoded = Buffer.from(auth, 'base64').toString('ascii')
        let tokens = decoded.split(':')
        return { username: tokens[0], password: tokens[1] }
    }

    /**
     * create an user
     * TODO:
     * @param {} user  must have one or more addressses
     */
    async createUser(user) {
        let txn = await this.db.begin()
        var params = [user.id, user.name, user.email, user.phone, user.password]
        await this.db.executeSQLInTxn(txn, 'insert-user', params)
        for (var kind in user.addresses) {
            let addr = user.addresses[kind]
            var params = [addr.kind, user.id, addr.line1, addr.line2, addr.city, addr.zip, addr.tips]
            await this.db.executeSQLInTxn(txn, 'upsert-address', params)
        }
        let page = user.page
        for (var i = 0; i < user.roles.length; i++) {
            if (!page) page = user.roles[0]
            await this.db.executeSQLInTxn(txn, 'insert-user-role', [user.id, user.roles[i]])
        }
        await this.db.executeSQLInTxn(txn, 'insert-user-page', [user.id, page])
        this.db.commit(txn)

        delete user['password']

        return user
    }

    // --------------------------------------------------------------------------
    /**
     * adds an address for given user.
     * pair of user id and address name is unique
     * @param {} user 
     * @param {*} addr an address
     */
    async createAddress(req, res, next) {
        try {
            const uid = this.queryParam(req, res, 'uid')
            const addr = this.postBody(req, res)
            let params = [addr.kind, uid, addr.line1, addr.line2, addr.city, addr.zip, addr.tips]
            const address = await this.db.executeSQL('upsert-address', params)
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }
    /**
     * get all addresses 
     * @returns set of addresses indexed by kind for given user identifier
     */
    async getAddresses(req, res, next) {
        try {
            const user = this.queryParam(req, res, 'uid')
            let rs = await this.db.executeSQL('select-all-address', [user])
            var addresses = []
            //console.log(`got ${rs.length} rows`)
            for (var i = 0; i < rs.length; i++) {
                const address = rs[i]
                //console.log(`address[${i}]=${address}`)
                addresses.push(address)
            }
            //console.log(addresses)
            res.status(httpStatus.OK).json(addresses)
        } catch (e) {
            next(e)
        }
    }

    async getAddress(req, res, next) {
        const user = this.queryParam(req, res, 'uid')
        const kind = this.queryParam(req, res, 'kind')
        const address = await this.db.executeSQL('select-address-by-kind', [user, kind])
        res.status(httpStatus.OK).json(address)
    }



    /**
     * gets current user associated with given authorization token.
     * 
     * @param {*} auth an authorization token issued by this service.
     * @returns an user associated with session identified by given token.
     * Or null if no sesssion exists
     */
    getUser(auth) {
        if (auth) {
            let session = SessionCache.findSession(auth)
            if (session) {
                return session.user
            }
        }
    }

    findSession(auth) {
        if (auth) {
            return SessionCache.findSession(auth)
        }
    }
    getSessions() {
        return SessionCache.getSessions()
    }


}
module.exports = UserService
