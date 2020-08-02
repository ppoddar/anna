const express           = require('express')
const httpStatus        = require('http-status-codes')
const InputError        = require('./errors').InputError

class SubApplication {
    constructor(db, options) {
        this.db      = db
        this.app     = express()
        this.options = options || {}
        console.log(`\x1b[36m \u2713 created ${this.constructor.name} service \x1b[0m`)
    }
    /*
     * payload of a POST request.
     * Errors are thrown with a code and and array of content variables
     */
    postBody(req, isArray) {
        if (req.body) {
            if (isArray && !Array.isArray(req.body)) {
                throw new InputError('payload-not-array')
            } 
            const payload = req.body
            console.log(`payload POST ${req.url}\n ${JSON.stringify(payload)}`)
            return payload
        } else {
            new InputError('payload-not-array')
        }
    }

    // get query parameter value form request. if does not exist, returns default.
    // if default is undefined, ends response with BAD_REQUEST
    queryParam(req, p, def) {
        if (p in req.query){
            return req.query[p]
        } else if (def) {
            return def
        } else {
            throw new InputError('missing-query-param', [p])
            
        }
    }
}

module.exports = SubApplication