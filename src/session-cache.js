/**
 * A singleton instance maintains a map from token to session.
 * 
 */

ALLOWED_CHARS = 'abcdefjhijklmnopqurstuvwxyz1234567890'

class Singleton {
    /**
     * get singleton instane of Session cache
     */
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new SessionCache()
        }
        return Singleton.instance
    }
}

class SessionCache {
    constructor() {
        this.cache = {}
    }
    getSessions() {
        return this.cache
    }
    
    async getSessionsFromDB(db) {
        try {
        var rs = await db.executeSQL('select-sessions', [])
        console.debug(`found ${rs.length} sessions in database`)
        for (var i = 0; i < rs.length; i++) {
            var row = rs[i]
            console.debug(`resolve user [${row.user}]`)
            var user = await db.executeSQL('find-user', [row.user])
            if (user) {
                console.debug(`retrieved session ${row.id} for user ${user.id}`)
                var session = {id:row.id, user:user,created:row.created}
                this.cache[row.id] = session
            } else {
                console.warn(`user [${row.user}] for saved session [${row.id}] not found`)
            }
        }} catch {
            console.error("can not get sessions from db")
        }
    }

    /**
     * find a cached session given id.
     * @param {string} token authorization token or session identifer
     * @returns session identified by given token
     * @throws Error if token is not cached
     */
    findSession(token) {
        return this.cache[token]
    }
    /**
     * Find session for given user id. 
     * This is a linear search across al tokens
     * @param {*} uid id of an user
     * @throws Error if no session for given user id
     */
    findSessionForUser(uid) {
        for (var token in this.cache) {
            var session = this.cache[token]
            if (session.user.id == uid) {
                console.debug(`found existing session ${session.id} for user [${uid}]`)
                return session
            }
        }
        console.debug(`found no existing session for user [${uid}]`)

    }

    /**
     * 
     * finds a cahced session for given user 
     * if not and create new is set, cretaes a new session
     * @param {user} user object
     * @param {boolean} createNew 
     */
    async createSession(user, db) {
        const session_id = this.newSessionId(16)
        delete user.password
        var time = new Date().getTime()
        const new_session = {
            id:      session_id, 
            user:    user,
            created: time}
        var params = [session_id, user.id]
        await db.executeSQL('save-session', params)
            .then(()=>{this.cache[session_id] = new_session})
            .catch((err)=>{throw err})
        
        return new_session
    }

    updateSession(user, db) {
        const session_id = this.findSessionForUser(user.id)
        var params = [session_id, user.id]
        db.executeSQL('update-session', params)
    }

    /**
     * create random alpharumic identifer for a session
     * @param {number} N 
     */
    newSessionId(N) {
        let str = ''
        for (var i = 0; i < N; i++) {
            let randomIdx = Math.floor(Math.random() * ALLOWED_CHARS.length)
            let ch = ALLOWED_CHARS[randomIdx]
            str += ch
        }
        return str
    }
}

module.exports = Singleton.getInstance()