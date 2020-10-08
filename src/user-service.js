const httpStatus        = require('http-status-codes')
const SubApplication    = require('./sub-app.js')
const UserController    = require('./user-controller.js')
const AddressController = require('./address-controller.js')
const fs = require('fs')
const { pathMatch } = require('tough-cookie')

const COOKIE_NAME = 'hiraafood'
const GUEST_USER = {id:'guest', role:'customer'}

class UserService extends SubApplication {
    constructor(db, options) {
        super(db, options)
        this.controller = new UserController(db)
        this.addressController = new AddressController(db)


        this.app.post('/',           this.createUser.bind(this))
        this.app.get('/all',         this.getAllUsers.bind(this))
        this.app.get('/find/:uid',   this.getUser.bind(this))     // gets complete user information
        this.app.get('/exists/:uid', this.existsUser.bind(this))  // only 200 or 404 status
        this.app.get('/loggedin/:uid', this.existsUser.bind(this))  // only 200 or 404 status
        this.app.post('/login/:uid/role/:role', this.login.bind(this))
        this.app.get('/addresses/:uid', this.getAddresses.bind(this))
        this.app.get('/address-by-kind/:kind/:uid', this.getAddressByKind.bind(this))
        this.app.get('/address-by-id/:id/:uid', this.getAddressById.bind(this))
        this.app.post('/address/:uid', this.createAddress.bind(this))
        
    }

    async existsUser(req, res, next) {
        try {
            let exists = await this.controller.existsUser(req.params.uid)
            res.status(exists ? httpStatus.OK : httpStatus.NOT_FOUND)
        } catch (e) {
            next(e)
        }
    }

    async isLoggedIn(req,res,next) {
        try {
            let loggedIn = await this.controller.isLoggedIn(req.params.uid)
            res.status(loggedIn ? httpStatus.OK : httpStatus.NOT_FOUND).end()
        } catch (e) {
            next(e)
        }
    }

    /*
     * get entire user record with all possible roles,
     * home page identifed by user id
     */
    async getUser(req, res, next) {
        try {
            let user = await this.controller.getUser(req.params.uid)
            res.status(httpStatus.OK).json(user)
        } catch (e) {
            next(e)
        }
    }

   

    /*
     * Login a user in a role.
     * Request carries basic authentication header.
     */
    async login(req, res, next) {
        try {
            const creds = this.extractAuthrozationHeader(req, res)
            const uid = creds.username
            const pwd = creds.password
            const role = req.params.role
            console.log(`login user ${uid} as ${role}`)
            await this.controller.authenticate(uid, pwd, role, async (err, user) => {
                if (err == null) {
                    await this.controller.login(uid, role)
                    const ctx = this
                    req.session.regenerate(function () {
                        ctx.newSession(user, req, res)
                    })
                } else {
                    console.error(`authenticate callback has received error ${err} user=${user}`)
                    res.status(httpStatus.FORBIDDEN).json({ message: err })
                }
            })
        } catch (e) {
            console.error(e)
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
     * create an user. The payload carries user details, roles, zero or or more addresses
     * @param {} user  must have one or more addressses
     */
    async createUser(req, res, next) {
        try {
            let user  = this.postBody(req)
            try {
                this.validateUser(user)
                if (user.addresses) { // not all  users require address
                    for (var kind in user.addresses) {
                        this.addressController.validateAddress(kind, user.addresses[kind])
                    }
                }
            } catch (e) {
                this.badRequest(req, res, e)
                return 
            }
            const userCreated = await this.controller.createUser(user)
            console.log(`${this.constructor.name}.createUser() ${userCreated} of type ${userCreated.constructor.name}`)
            res.status(httpStatus.OK).json(userCreated)
        } catch (e) {
            next(e)
        }
    }

    /*
     * create an address for an user
     */
    async createAddress(req, res, next) {
        try {
            const addr = this.postBody(req)
            try {
                this.addressController.validateAddress(addr.kind, addr)
            } catch (e) {
                this.badRequest(req, res, e)
                return
            }
            const update = this.queryParam(req, 'update', false)
            var address
            if (update) {
                address = await this.addressController.updateAddress(null, req.params.uid, addr)
            } else {
                address = await this.addressController.insertAddress(null, req.params.uid, addr)
            }
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }

    async getAddresses(req, res, next) {
        try {
            let addresses = await this.addressController.getAddresses(req.params.uid)
            res.status(httpStatus.OK).json(addresses)
        } catch (e) {
            next(e)
        }
    }

    async getAddressByKind(req, res, next) {
        try {
            const address = await this.addressController.getAddressByKind(req.params.uid, req.params.kind)
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }

    async getAddressById(req, res, next) {
        try {
            const address = await this.addressController.getAddressById(req.params.uid, req.params.id)
            res.status(httpStatus.OK).json(address)
        } catch (e) {
            next(e)
        }
    }


    async validateUser(user) {
        if (user == undefined || Object.keys(user).length == 0) {
            throw new Error(`user is empty or defined`)
        }
        if (!user.id) {
            throw new Error(`no id for user`)
        }
        if (!user.roles) {
            throw new Error(`no role for ${user.id}`)
        }

        if (user.roles.length == 0) {
            throw new Error(`empty role for ${user.id}`)
        }
        for (var i = 0; i < user.roles.length; i++) {
            const role = user.roles[i]
            const exists = await this.controller.existsRole(role)
            if (!exists) {
                throw new Error(`unknown role ${role} for ${user.id}`)
            }
        }
        
    }
 /*
     * get  user id of all users
     */
    async getAllUsers(req, res, next) {
        try {
            let users = await this.controller.getAllUsers()
            res.status(httpStatus.OK).json(users)
        } catch (e) {
            next(e)
        }
    }
    
    
}
module.exports = UserService
