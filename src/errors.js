const httpStatus = require('http-status-codes')
const vsprintf = require('sprintf-js').vsprintf
// A set of string printf formats indexed by error message id
// The format will be used by replacing variables at runtime
// The error thrown will have an array of variables at constructions
const ERROR_MESSAGES = {
    'user-not-found': 'user [%s] is not found',
    'wrong-password': 'wrong password for [%s]',
    'missing-query-param': 'missing query parameter [%s]',
    
}

class ApplicationError extends Error {
    constructor(id, variables) {
        super('')
        this.id = id
        this.variables = variables || []
    }
}
class ValidationError extends ApplicationError {
    constructor(id, variables) {
        super(id, variables)
    }
}
class InputError extends ApplicationError {
    constructor(id, variables) {
        super(id, variables)
    }
}
class AuthenticationError extends ApplicationError {
    constructor(id, variables) {
        super(id, variables)
    }
}

const ERROR_STATUS_CODES = {
    'ValidationError':     httpStatus.BAD_REQUEST,
    'InputError':          httpStatus.BAD_REQUEST,
    'AuthenticationError': httpStatus.FORBIDDEN
    
}


/*
 * converts message format by context
 */
function map_error(id,variables) {
    if (id in ERROR_MESSAGES) {
        const message_format = ERROR_MESSAGES[id]
        const msg = vsprintf(message_format, variables)
        return msg
    } else {
        console.warn(`can not map error code ${id}`)
        return id
    }

}
/*
 * all uncaught error reaches this function .
 * Code should throw a typed error with a message
 */
function  ErrorHandler(err,req,res,next) {
        console.log(`--------- caught following exception at app error handler -----------`)
        let status = get_status(err)
        if (status == httpStatus.INTERNAL_SERVER_ERROR) {
            console.error(err)
        } 
        res.status(status)

        let message = get_message(err)
        res.json({message:message, url:req.url})
        console.log(`***ERROR: ${req.url} ${status}: ${message}`)
        next()
}

function get_status(err) {
    const errorType = err.constructor.name
    if (errorType in ERROR_STATUS_CODES) {
        return ERROR_STATUS_CODES[errorType]
    } else {
        console.warn(`no HTTP status code for error type ${errorType}. Returning ${httpStatus.INTERNAL_SERVER_ERROR}`)
        return httpStatus.INTERNAL_SERVER_ERROR
    }
}

function get_message(err) {
    if (err instanceof ApplicationError) {
        return map_error(err.id, err.variables)
    } else {
        console.log(`${err.constructor.name} is not an ApplicationError. Returning error message`)
        return err.message
    }
}
module.exports = {
    ValidationError:ValidationError, 
    InputError: InputError,
    AuthenticationError:AuthenticationError,
    map_error:map_error,
    ErrorHandler:ErrorHandler}