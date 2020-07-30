const express         = require('express')
const InputError = require('./errors').InputError

class SubApplication {
    constructor(db, options) {
        this.db      = db
        this.app     = express()
        this.options = options || {}
        console.log(`\x1b[36m \u2713 created ${this.constructor.name} service \x1b[0m`)
    }
    /*
     * payload of a POST request
     */
    postBody(req, res, isArray) {
        if (req.body) {
            if (isArray && !Array.isArray(req.body)) {
                const message = `request ${req.url} requires an array as body`
                res.status(httpStatus.BAD_REQUEST).json({message:message})
            } 
            const payload = req.body
            console.log(`payload POST ${req.url}\n ${JSON.stringify(payload)}`)
            return payload
        } else {
            const message = `request ${req.url} requires a body. but none exists`
            throw new InputError(message)
        }
    }

    // get query parameter value form request. if does not exist, returns default.
    // if default is undefined, ends response with BAD_REQUEST
    queryParam(req, res, p, def) {
        if (p in req.query){
            return req.query[p]
        } else if (def != undefined) {
            return def
        } else {
            throw new InputError('missing-query-param', [p])
            
        }
    }
}

module.exports = SubApplication