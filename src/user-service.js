const SessionCache = require('./session-cache')



class UserService {
    constructor(db) {
        this.db = db
            //SessionCache.getSessionsFromDB(db)
    }

    /**
     * gets an user by given id in database
     * @param {string} id 
     * @return an user or null
     */
    async findUser(id) {
        return await this.db.query('find-user', [id])
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
        await this.db.executeSQLInTxn(txn, 'insert-user-page', [user.id, page] )
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
    async addAddress(user, addr) {
        let params = [addr.kind, user.id, addr.line1, addr.line2, addr.city, addr.zip, addr.tips]
        await this.db.executeSQL('insert-address', params)
        return addr   
    }
    /**
     * get all addresses 
     * @returns set of addresses indexed by kind for given user identifier
     */
    async getAddresses(user) {
        let rs = await this.db.executeSQL('select-all-address', [user])
        var addresses = []
        //console.log(`got ${rs.length} rows`)
        for (var i = 0; i < rs.length; i++) {
            let address = rs[i]
            //console.log(`address[${i}]=${address}`)
            addresses.push(address)
        }
        //console.log(addresses)
        return addresses
    }
    async getAddress(user, kind) {
        return await this.db.executeSQL('select-address-by-kind', [user, kind])
    }

    /**
     * logs in a user with given credentials
     * 
     * @param {*} creds 
     */
    async login(uid, pwd) {
        let  user = await this.db.executeSQL('find-user', [uid])
        if (!user) throw new Error(`user ${uid} not found`)

        //console.log(`database query returns user ${user.id} with ${user.roles}
        //of type ${user.roles.constructor.name}`)
        user.roles = user.roles.split(',')
        //console.log(`after split roles are ${user.roles} of type  ${user.roles.constructor.name}`)

        let row = await this.db.executeSQL('authenticate-user', [uid,pwd])
        if (!row) {
            throw new Error(`password for user [${uid}] does not match`)
        } 

        let session = SessionCache.findSessionForUser(user.id)
        if (session) {
            console.info(`session [${session.id}] exists for user [${user.id}]`)
        } else {
            console.info(`creting new session for user [${user.id}]`)
            session = await SessionCache.createSession(user, this.db)
            console.log('new session ${session}')
        }
        
        return session
    }

    async loginAsGuest() {
        let user = {id:'guest', page:'customer'}
        let session = SessionCache.findSessionForUser(user.id)
        if (session) {
            console.info(`session [${session.id}] exists for user [${user.id}]`)
        } else {
            console.info(`creting new session for user [${user.id}]`)
            session = await SessionCache.createSession(user, this.db)
        }
        
        return session
    }

    async relogin(authToken) {
        let session = await this.findSession(authToken)
        if (!session) {
            throw  new Error(`no session for authorization token ${authToken}`)
        }
        return session
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
