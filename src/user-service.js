const express = require('express')
const httpStatus = require('http-status-codes')
const SessionCache = require('./session-cache')
const BaseController = require('./base-controller')
const AuthenticationError = require('./errors').AuthenticationError


class UserService extends BaseController {
    constructor(db) {
        super()
        this.db = db
        //SessionCache.getSessionsFromDB(db)
        this.app = express()
        this.app.post('/create', this.createUser.bind(this))
        this.app.post('/login', this.login.bind(this))
        this.app.post('/loginAsGuest', this.loginAsGuest.bind(this))
        this.app.post('/relogin', this.relogin.bind(this))
        this.app.get('/address', this.getAddress.bind(this))
        this.app.get('/addresses', this.getAddresses.bind(this))
        this.app.post('/address', this.createAddress.bind(this))
    }

    async login(req, res, next) {
        try {
            const creds = this.extractAuthrozationHeader(req, res)
            const uid = creds.username
            const pwd = creds.password
            let user = await this.db.executeSQL('find-user', [uid])
            if (!user) {
                throw new AuthenticationError('user-not-found', [uid])
            }
            user.roles = user.roles.split(',')
            let row = await this.db.executeSQL('authenticate-user', [uid, pwd])
            if (!row) {
                throw new AuthenticationError('wrong-password', [uid] )
            }
            let session = SessionCache.findSessionForUser(user.id)
            if (session) {
                console.info(`session [${session.id}] exists for user [${user.id}]`)
            } else {
                console.info(`creting new session for user [${user.id}]`)
                session = await SessionCache.createSession(user, this.db)
                console.log('new session ${session}')
            }
            res.status(httpStatus.OK).json(session)
        } catch (e) {
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
            let user = { id: 'guest', page: 'customer' }
            let session = SessionCache.findSessionForUser(user.id)
            if (session) {
                console.info(`session [${session.id}] exists for user [${user.id}]`)
            } else {
                console.info(`creting new session for user [${user.id}]`)
                session = await SessionCache.createSession(user, this.db)
            }
            res.status(httpStatus.OK).json(session)
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
            await this.db.executeSQLInTxn(txn, 'insert-address', params)
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
            const address = await this.db.executeSQL('insert-address', params)
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
