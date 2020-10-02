const AddressController = require('./address-controller')
const util = require('util')
const debuglog = util.debuglog('user-service')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')

const VALID_ROLES = ['customer', 'packing', 'delivery', 'kitchen', 'admin']
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



    async existsUser(uid) {
        const user = await this.db.executeSQL('find-user', [uid])
        const exists = user !== null
        if (exists) {
            debuglog(`${this.constructor.name} user [${uid}] exists`)
        } else {
            debuglog(`${this.constructor.name} user ${uid} does not exist`)
        }
        return exists

    }
    async isLoggedUser(uid) {
        const user = await this.db.executeSQL('logged-in-user', [uid])
        return user != null
    }

    async getUser(uid) {
        let user = await this.db.executeSQL('select-user', [uid])
        return user
    }

    async getAllUsers() {
        let users = await this.db.executeSQL('select-all-users', [])
        return users
    }

    /*
     * 
     * callback signature fn(err, user)
     * 
     * TODO: handle role
     */
    async authenticate(uid, pwd, role, callback) {
        //debuglog(`authenticate ${uid}`)
        let user = await this.db.executeSQL('select-user', [uid])
        if (!user) {
            //debuglog(`authenticate: no user found ${uid}`)
            callabck.call(null, new Error(`no user ${uid} found`))
        } else {
            user = await this.db.executeSQL('select-user', [uid])
            user.roles = user.roles.split(',')
            let row = await this.db.executeSQL('authenticate-user', [uid, pwd])
            if (!row) {
                callback.call(null, new Error(`wrong-password for ${uid}`))
            } else {
                callback.call(null, null, user)
            }
        }
    }


    async createUser(user) {
        let txn = await this.db.begin()
        //debuglog(`${this.constructor.name}.createUser() ${JSON.stringify(user)}`)
        var params = [user.id, user.name, user.email, user.phone, user.password]
        await this.db.executeSQLInTxn(txn, 'insert-user', params)
        for (var kind in user.addresses) {
            const addr = user.addresses[kind]
            //debuglog(`validating address ${kind} ${JSON.stringify(addr)}`)
            this.addressController.validateAddress(kind, addr)
            // generates address.id on insert
            let result = await this.addressController.insertAddress(txn, user.id, addr)
            addr.id = result.id
        }
        let page = user.page
        for (var i = 0; i < user.roles.length; i++) {
            if (!page) page = user.roles[0]
            await this.db.executeSQLInTxn(txn, 'insert-user-role', [user.id, user.roles[i]])
        }
        await this.db.executeSQLInTxn(txn, 'insert-user-page', [user.id, page])
        await this.db.commit(txn)
        debuglog(`${this.constructor.name}.createUser(): returns user ${JSON.stringify(user)}`)

        return user
    }

    async login(uid, role) {
        await this.db.executeSQL('insert-user-login', [uid, role])
    }
    async logout(uid, role) {
        await this.db.executeSQL('update-user-logout', [uid, role])
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


    validateUser(user) {
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
            if (!VALID_ROLES.includes(user.roles[i])) {
                throw new Error(`unknown role ${user.roles[i]} for ${user.id}`)
            }
        }
        if (user.roles.includes('customer')) {
            if (!('billing' in user.addresses)) {
                throw new Error(`no billing for user ${user.id} in customer role`)
            }

        }
    }

    async enumerateUsers() {
        const users = await this.db.executeSQL('select-all-users', [])
        for (var i = 0; i < users.length; i++) {
            debuglog(`${i} ${users[i].id}\t${users[i].roles}`)
        }
        debuglog(`found ${users.length} users`)
    }



}

module.exports = UserController