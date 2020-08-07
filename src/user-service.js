const httpStatus = require('http-status-codes')
const SubApplication = require('./sub-app')
const AuthenticationError = require('./errors').AuthenticationError

var cookie = require('cookie');
const cookieParser = require('cookie-parser')
const COOKIE_NAME = 'hiraafood'

const GUEST_USER = {id:'guest', role:'customer'}

class UserService extends SubApplication {
    static RESERVED_USERS = ['admin', 'guest']
    constructor(db, options) {
        super(db, options)
        this.app.post('/:uid',       this.createUser.bind(this))
        this.app.get('/:uid',        this.getUser.bind(this))          // gets complete user information
        this.app.get('/:uid/exists', this.findUser.bind(this))  // only 200 or 404 status

        this.app.post('/:uid/login', this.login.bind(this))

        this.app.get('/:uid/addresses', this.getAddresses.bind(this))
        this.app.get('/:uid/address-by-kind/:kind', this.getAddressByKind.bind(this))
        this.app.get('/:uid/address-by-id/:id', this.getAddressById.bind(this))

        this.app.post('/:uid/address', this.createAddress.bind(this))

        this.populate()
    }

    async findUser(req, res, next) {
        try {
            const user = await this.db.executeSQL('find-user', [req.params.uid])
            res.status(user == null ? httpStatus.NOT_FOUND : httpStatus.OK).end()
        } catch (e) {
            next(e)
        }
    }

    async getUser(req, res, next) {
        try {
            let user = await this.db.executeSQL('select-user', [req.params.uid])
            res.status(httpStatus.OK).json(user)
        } catch (e) {
            next(e)
        }
    }

    /*
     */
    async authorize(req, res, next) {
        if (req.session.user) {
            next()
            return
        }
        console.log(`redicting to ${LOGIN_PAGE}`)
        return res.redirect(LOGIN_PAGE)
    }

    /*
     * 
     * callbak signature fn(err, status, user)
     */
    async authenticate(uid, pwd, callabck) {
        console.log(`authenticate ${uid}`)
        let user = await this.db.executeSQL('find-user', [uid])
        if (!user) {
            console.log(`authenticate: no user found ${uid}`)
            callabck.call(null, new Error(`no user ${uid} found`), httpStatus.NOT_FOUND, null)
        } else {
            user = await this.db.executeSQL('select-user', [uid])
            user.roles = user.roles.split(',')
            let row = await this.db.executeSQL('authenticate-user', [uid, pwd])
            if (!row) {
                callabck.call(null, new Error(`wrong-password for ${uid}`), httpStatus.FORBIDDEN, null)
            } else {
                callabck.call(null, null, httpStatus.OK, user)
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
            if (req.params.uid == GUEST_USER.id) {
                await this.loginAsGuest(req,res,next)
                return
            }
            const creds = this.extractAuthrozationHeader(req, res)
            const uid = creds.username
            const pwd = creds.password
            console.log(`login user ${uid}`)
            await this.authenticate(uid, pwd, (err, status, user) => {
                if (err == null) {
                    const ctx = this
                    req.session.regenerate(function () {
                        ctx.newSession(user, req, res)
                    })
                } else {
                    console.error(`authenticate callback has received error ${err} status=${status} user=${user}`)
                    res.status(status).json({ message: err })

                }
            })
        } catch (e) {
            console.error(e)
            next(e)
        }
    }

      async loginAsGuest(req, res, next) {
        try {
            const ctx = this
            req.session.regenerate(function () {
                ctx.newSession(GUEST_USER, req, res)
            })
        } catch (e) {
            next(e)
        }
    }

    newSession(user, req, res) {
        const session_id = req.session.id
        user.session = session_id
        console.log(`regenerate cookie for user [${user.id}] session id=${session_id}`)
        res.cookie(COOKIE_NAME, { user: user })
        res.status(httpStatus.OK).json(user)
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
    async createUser(req, res, next) {
        try {
            if (this.isReservedUser(req.params.uid)) {
                res.status(httpStatus.BAD_REQUEST)
                    .json({message:`${req.params.uid} is reserved user name`}).end()
            }
            let user = this.postBody(req)
            await this.newUser(user)
            delete user['password']
            res.status(httpStatus.OK).end()
        } catch (e) {
            next(e)
        }
    }


    async newUser(user) {
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
            const addr = this.postBody(req)
            let params = [addr.kind, req.params.uid, addr.line1, addr.line2, addr.city, addr.zip, addr.tips]
            const address = await this.db.executeSQL('upsert-address', params)
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }
    /**
     * get all addresses 
     * @returns array of addresses
     */
    async getAddresses(req, res, next) {
        try {
            let addresses = await this.db.executeSQL('select-all-address', 
                [req.params.uid])
            res.status(httpStatus.OK).json(addresses)
        } catch (e) {
            next(e)
        }
    }

    async getAddressByKind(req, res, next) {
        try {
            const address = await this.db.executeSQL('select-address-by-kind', 
                [req.params.uid, req.params.kind])
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }

    async getAddressById(req, res, next) {
        try {
            const address = await this.db.executeSQL('select-address-by-id', 
                [req.params.uid, req.params.id])
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }

    async existsUser(uid) {
        let row = await this.db.executeSQL('find-user', [uid])
        //console.log(`result of [find-user] ${row}`)
        return row != null
    }

    async populate() {
        var fs = require('fs')
        var path = require('path')
        var yaml = require('js-yaml')
        var data_dir = path.join(__dirname, '../data/users')
        //console.log(`data directory ${data_dir}`)
        if (fs.existsSync(data_dir)) {
            //console.log(`populating users from ${data_dir}`)
            var files = fs.readdirSync(data_dir, { withFileTypes: true })
            for (var i = 0; i < files.length; i++) {
                const file = files[i]
                if (file.isDirectory()) continue
                //console.log(`populating user from ${file.name}`)
                const file_path = path.join(__dirname, '../data/users', file.name)
                let fileContents = fs.readFileSync(file_path, 'utf8');
                let user = yaml.safeLoad(fileContents);
                if (! await this.existsUser(user.id)) {
                    console.log(`saving user ${user.id} from ${file_path}`)
                    this.newUser(user)
                } else {
                    //console.log(`user ${user.id} exists`)
                }
            }
        }
    }

}
module.exports = UserService
