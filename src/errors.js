const httpStatus = require('http-status-codes')
const vsprintf = require('sprintf-js').vsprintf
// A set of string printf formats indexed by error message id
// The format will be used by replacing variables at runtime
// The error thrown will have an array of variables at constructions
const ERROR_MESSAGES = {
    'user-not-found': 'user [%s] not found',
    'wrong-password': 'wrong password for [%s]',
    'missing-query-param': 'missing query parameter [%s]',
    'payload-not-array': 'expected payload to be an array, but it was not'
    
}

const ERROR_STATUS_CODES = {
    'ValidationError':     httpStatus.BAD_REQUEST,
    'InputError':          httpStatus.BAD_REQUEST,
    'AuthenticationError': httpStatus.FORBIDDEN
    
}
/*
 * All errors thrown by the application derives from this class
 */
class ApplicationError extends Error {
    /*
     * @param id an id maps the message to a more user facing text
     * @param msg a message 
     * @param variables used to format user-friendly message
     */
    constructor(id, status, msg, variables) {
        super('')
        this.id = id
        this.status = status
        this.message = msg
        this.variables = variables || []
    }

    
    getMessage() {
        if (this.id in ERROR_MESSAGES) {
            const message_format = ERROR_MESSAGES[this.id]
            const msg = vsprintf(message_format, this.variables)
            return msg
        } else {
            console.warn(`can not map error code ${this.id}`)
            return this.message
        } 

    }
}

class ValidationError extends ApplicationError {
    constructor(id, msg, variables) {
        super(id, httpStatus.BAD_REQUEST, msg, variables)
    }
}
class InputError extends ApplicationError {
    constructor(id,  msg, variables) {
        super(id, httpStatus.BAD_REQUEST, msg, variables)
    }
}
class AuthenticationError extends ApplicationError {
    constructor(id, msg, variables) {
        super(id, httpStatus.FORBIDDEN, msg, variables)
    }
}




/*
 * all uncaught error reaches this function .
 * Code should throw a typed error with a message
 */
function  ErrorHandler(err,req,res,next) {
        console.error(`--------- caught following exception at app error handler -----------`)
        console.error(err)
        var status = httpStatus.INTERNAL_SERVER_ERROR
        var message = "no message"
        if (err instanceof ApplicationError) {
            status = err.status
            message = err.getMessage()
        }
        res.status(status).json({message:message, url:req.url})
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
    ErrorHandler:ErrorHandler}