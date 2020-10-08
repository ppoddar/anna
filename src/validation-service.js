const {MinimumLengthRule,UnknownCharacterRule,
    FirstCharacerLowerCaseRule,
    CharacterGroupRule} = require('./validation-rule.js')

const SubApplication = require('./sub-app')
const httpStatus = require('http-status-codes')

var USER_ID_VALIDATION_RULES = [
    new MinimumLengthRule(5),
    new UnknownCharacterRule(),
    new FirstCharacerLowerCaseRule()
]

var PASSWORD_VALIDATION_RULES = [
    new MinimumLengthRule(5), 
    // password must have minimum of 1 DIGIT
    new CharacterGroupRule(true, {DIGIT:1})
]

class ValidationService extends SubApplication {
    constructor(db,options) {
        super(db,options)
        this.app.post('/userid',    this.validateUserId.bind(this))
        this.app.post('/password',  this.validatePassword.bind(this))
    }

    /*
     * Validates user name running through a series of rules.
     * A rule, if needed, throws exception.
     */
    async validateUserId(req,res,next)  {
        const userid = this.postBody(req).userid
        this.validate(userid, USER_ID_VALIDATION_RULES, req,res, next)
    }

    async validatePassword(req,res,next) {
        const pwd = this.postBody(req).password
        this.validate(pwd, PASSWORD_VALIDATION_RULES, req,res, next)

    }

    /**
     * validates a string token by applying given rules
     * Applies eac rule. If token is invlid, an exception is thrown
     * by the rule.  
     * If invlid, response status is not 200
     * @param {*} token 
     * @param {*} rules 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    validate(token, rules, req, res, next) {
        for (var i = 0; i < rules.length; i++) {
            const rule = rules[i].constructor.name
            try {
                rules[i].apply(token)
            } catch (e) {
                console.log(`*** caught validation Error: ${rule} [${token}]  ${e.message}`)
                return res.status(httpStatus.BAD_REQUEST).json({reason:e.message})
            }
        }
        res.status(httpStatus.OK)
    }
}
module.exports = ValidationService

