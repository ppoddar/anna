const httpStatus        = require('http-status-codes')
const SubApplication    = require('./sub-app.js')
const UserController    = require('./user-controller.js')
const logger = require('./logger.js')

class UserService extends SubApplication {
    constructor(db, options) {
        super(db, options)
        this.controller = new UserController(db)

        this.app.post('/',      this.createUser.bind(this))
        this.app.get('/:uid',   this.getUser.bind(this))     // gets complete user information
        this.app.get('/loggedin/:uid', this.isLoggedIn.bind(this))  // only 200 or 404 status
        this.app.post('/login/:uid', this.login.bind(this))
        this.app.post('/logout/:uid', this.logout.bind(this))
    }

    async createUser(req,res,next) {
        try {
            const user = this.postBody(req)
            await this.controller.createUser(user)
            return res.status(httpStatus.OK)
        } catch (e) {
            next(e)
        }
    }

    /*
     * get entire user record with all possible roles.
     * 404 if user does not exist
     */
    async getUser(req, res, next) {
        try {
            let user = await this.controller.getUser(req.params.uid)
            if (user === null) {
                return res.status(httpStatus.NOT_FOUND)
            } else {
                return res.status(httpStatus.OK).json(user)
            }
        } catch (e) {
            next(e)
        }
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
     * Login a user in a role.
     * Request carries basic authentication header.
     */
    async login(req, res, next) {
        try {
            const creds = this.extractAuthrozationHeader(req, res)
            if (!creds) return res.status(httpStatus.BAD_REQUEST)
            const uid = creds.username
            const pwd = creds.password
            const role = this.queryParam(req, 'role', 'customer')
            logger.info(`login user [${uid}] as [${role}]`)
            const exists = await this.controller.existsUser(uid)
            if (exists) {
                logger.info(`user ${uid} exists`)
                const authenticatedUser = await this.controller.authenticate(uid, pwd, role)
                if (authenticatedUser !== null) {
                    logger.info(`user ${uid} is authenticated`)
                    const userInRole = await this.controller.isUserInRole(uid, role)
                    if (userInRole) {
                        logger.info(`user ${uid} is in role ${role}`)
                        await this.controller.login(uid, role)
                        res.status(httpStatus.OK).json({message:`user ${uid} is logged in`})
                    } else {
                        res.status(httpStatus.FORBIDDEN).json({message:`user ${uid} is not in ${role} role`})
                    }
                } else {
                    res.status(httpStatus.FORBIDDEN).json({message:`user ${uid} is not authenticated`})
                }
            } else {
                res.status(httpStatus.NOT_FOUND).json({message:`user ${uid} does not exist`})
            }
            return
        } catch (e) {
            logger.error(e)
            next(e)
        }
    }

    extractAuthrozationHeader(req, res) {
        if (!req.headers.authorization) {
            res.status(httpStatus.BAD_REQUEST).json({ message: `no authorization header in ${req.url}` })
            return
        }
        let auth = req.headers.authorization.replace('Basic', '').trim()
        var decoded = Buffer.from(auth, 'base64').toString('ascii')
        let tokens = decoded.split(':')
        return { username: tokens[0], password: tokens[1] }
    }


    async logout(req,res,next) {
        try {
            const uid = req.params.uid
            await this.controller.logout(uid)
            return res.status(httpStatus.OK).json({message:`user [${uid}] logged out`})
        } catch (e) {
            next(e)
        }
    }

    
}
module.exports = UserService
