const httpStatus        = require('http-status-codes')
const SubApplication    = require('./sub-app.js')
const UserController    = require('./user-controller.js')
const autobind = require('auto-bind')
const logger = require('./logger.js')

/*
 * A service that accepts HTTP request and uses a controller
 * to interact with a database with User, UserSession.
 * Maintains a cache of UserSession indexed by user identifier
 */
class UserService extends SubApplication {
    constructor(db, options) {
        super(db, options)

        this.controller = new UserController(db)
        this.sessions   = {}

        this.app.post('/',      this.createUser)
        this.app.get('/:uid',   this.getUser)     // gets complete user information
        this.app.get('/loggedin/:uid', this.isLoggedIn)  // only 200 or 404 status
        this.app.post('/login/:role/:uid', this.login)
        this.app.post('/logout/:uid', this.logout)
    }

    /*
     * register a user with given request
     */
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

    /*
     * affirms if given user with given id is logged in.
     * @return 200 or 404
     */
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
     * Request must carry basic authentication header.
     */
    async login(req, res, next) {
        try {
            const creds = this.extractAuthrozationHeader(req, res)
            if (!creds) return res.status(httpStatus.BAD_REQUEST)
                .json({message:`${req.url} does not have authorization header`})
            const uid = creds.uid
            const pwd = creds.password
            const role = req.param.role
            this.logger.info(`login user [${uid}] as [${role}]`)
            
            const exists = await this.controller.existsUser(uid)
            if (exists) {
                logger.info(`user ${uid} exists`)
                const authenticatedUser = await this.controller.authenticate(uid, pwd, role)
                if (authenticatedUser !== null) {
                    this.logger.info(`user ${uid} is authenticated`)
                    const userInRole = await this.controller.isUserInRole(uid, role)
                    if (userInRole) {
                        this.logger.info(`user ${uid} is in role ${role}`)
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

    /*
     * reads user id and password from basic authroization header
     * @return {uid,password} decoded
     */
    extractAuthrozationHeader(req, res) {
        if (!req.headers.authorization) {
            res.status(httpStatus.BAD_REQUEST).json({ message: `no authorization header in ${req.url}` })
            return
        }
        let auth = req.headers.authorization.replace('Basic', '').trim()
        var decoded = Buffer.from(auth, 'base64').toString('ascii')
        let tokens = decoded.split(':')
        return { uid: tokens[0], password: tokens[1] }
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
