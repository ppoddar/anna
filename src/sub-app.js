const express           = require('express')
const httpStatus        = require('http-status-codes')
const InputError        = require('./errors').InputError
const logger            = require('./logger')

class SubApplication {
    constructor(db, options) {
        this.db      = db
        this.app     = express()
        this.options = options || {}
        logger.info(`created ${this.constructor.name} service`)
        //if (this.validateService) this.validateService.call(null)
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
            console.log(`payload POST ${req.originalUrl}\n ${JSON.stringify(payload)}`)
            return payload
        } else {
            new InputError('payload-not-present')
        }
    }

    // get query parameter value form request. if does not exist, returns default.
    // if default is undefined, ends response with BAD_REQUEST
    queryParam(req, p, def) {
        if (p in req.query){
            return req.query[p]
        } else if (def != undefined) {
            return def
        } else {
            throw new InputError('missing-query-param', 
                `missing query parameter [${p}]`, [p])
        }
    }

    badRequest(req,res,err) {
        console.log(`***ERROR: ${req.originalUrl} ${err.message}`)
        console.error(err)
        res.status(httpStatus.BAD_REQUEST).json({message:err.message})
    }
}

module.exports = SubApplication