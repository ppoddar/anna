const {MinimumLengthRule,UnknownCharacterRule,
    FirstCharacerLowerCaseRule,
    CharacterGroupRule} = require('./validation-rule.js')

const SubApplication = require('./sub-app')
const httpStatus = require('http-status-codes')

var USER_NAME_VALIDATION_RULES = [
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
        this.app.post('/username',  this.validateUsername.bind(this))
        this.app.post('/password',  this.validatePassword.bind(this))
    }

    /*
     * Validates user name running through a series of rules.
     * A rule, if needed, throws exception.
     */
    async validateUsername(req,res,next)  {
        const username = this.postBody(req).username
        this.validate(username, USER_NAME_VALIDATION_RULES, req,res, next)
    }

    async validatePassword(req,res,next) {
        const pwd = this.postBody(req).password
        this.validate(pwd, PASSWORD_VALIDATION_RULES, req,res, next)

    }

    /**
     * 
     * @param {*} name 
     * @param {*} rules 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    validate(name, rules, req, res, next) {
        for (var i = 0; i < rules.length; i++) {
            const rule = rules[i].constructor.name
            try {
                console.log(`${rule}.apply ${name}`)
                rules[i].apply(name)
            } catch (e) {
                console.log(`*** caught validation Error: ${rule} [${name}]  ${e.message}`)
                res.status(httpStatus.BAD_REQUEST)
                    .json({valid:false, reason:e.message})
                return
            }
        }
        res.status(httpStatus.OK)
            .json({valid:true})
    }
}
module.exports = ValidationService

