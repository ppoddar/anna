const AddressController = require('./address-controller')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')

/*
 * Controller operates on the database. A service validates all input and
 * presents controller with valid data.
 * Controller also does not handle error, but throws it to service to hanndle.
 */
class UserController {
    constructor(db) {
        this.db = db
        this.addressController = new AddressController(db)
    }

    /**
     * affirms if an user with givrn uid exists in database
     * @param {*} uid 
     * @returns true or false
     */
    async existsUser(uid) {
        const user = await this.db.executeSQL('find-user', [uid])
        const exists = user !== null
        return exists

    }

    /**
     * Affirms if user with given id is logged in
     * @param {} uid 
     * @returns true or false
     */
    async isLoggedIn(uid) {
        const user = await this.db.executeSQL('logged-in-user', [uid])
        return user !== null
    }

    /**
     * gets user with given identifier
     * @param {} uid 
     * @returns user or null
     */
    async getUser(uid) {
        let user = await this.db.executeSQL('select-user', [uid])
        return user
    }
    /**
     * gets all users
     */
    async getAllUsers() {
        let users = await this.db.executeSQL('select-all-users', [])
        return users
    }

    /*
     * Authenticates given user at given role and passord
     * callback signature fn(err, user)
     * 
     */
    async authenticate(uid, pwd, role) {
        return await this.db.executeSQL('authenticate-user', [uid, pwd])
    }

    /*
     * create a record for an user.
     * 
     */
    async createUser(user) {
        let txn = await this.db.begin()
        var params = [user.id, user.name, user.email, user.phone, user.password]
        await this.db.executeSQLInTxn(txn, 'insert-user', params)     
        for (var i = 0; i < user.roles.length; i++) {
            const role = user.roles[i]
            if (this.existsRole(role)) {
                await this.db.executeSQLInTxn(txn, 'insert-user-role', [user.id, user.roles[i]])
            } else {
                logger.warn(`ignoring unknown role [${role}] for user [${user.id}]`)
            }
        }
        await this.db.commit(txn)
        return user
    }

    async login(uid, role) {
        await this.db.executeSQL('insert-user-login', [uid, role])
        return
    }

    async logout(uid) {
        await this.db.executeSQL('update-user-logout', [uid])
        return
    }

    async existsRole(role) {
        return this.db.executeSQL('find-role', [role]) != null

    }

    /*
     * Populates few known users from descriptors found in ./data/users directory.
     */
    async populate() {
        var fs = require('fs')
        var path = require('path')
        const data_dir = path.join(__dirname, './data/users')
        debuglog(`populating users from ${data_dir}`)
        var files = fs.readdirSync(data_dir, { withFileTypes: true })
        for (var i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.isDirectory()) continue
            if (!file.name.endsWith('.json')) continue
            const file_path = path.join(data_dir, file.name)
            debuglog(`populating user from ${file_path}`)
            let fileContents = fs.readFileSync(file_path, 'utf8');
            let user = JSON.parse(fileContents);
            const exists = await this.existsUser(user.id)
            if (!exists) {
                logger.info(`creating user ${user.id} from ${file_path}`)
                try {
                    await this.createUser(user)
                } catch (e) {
                    logger.error('error creating user', e)
                }
            }
        }
        
    }


   
    async enumerateUsers() {
        const users = await this.db.executeSQL('select-all-users', [])
        for (var i = 0; i < users.length; i++) {
            logger.debug(`${i} ${users[i].id}\t${users[i].roles}`)
        }
        logger.debug(`found ${users.length} users`)
    }

    async isUserInRole(uid, role) {
        try {
            return this.db.executeSQL('user-in-role', [uid,role]) !== null
        }  catch (e) {
            return false
        }
    }

}

module.exports = UserController