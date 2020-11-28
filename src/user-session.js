class UserSession {
    constructor(obj) {
        this.id         = obj.id
        this.user       = obj.user
        this.startTime  = new Date().now()
        this.endTime    = undefined
    }
}


module.exports = UserSession