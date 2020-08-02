const {MinimumLengthRule, CharacterTypeRule,
    MinimumCharacterTypeCountRule, MaximumCharacterTypeCountRule,
    StringCharacterTypeRule} 
= require('./validation-rule')
const CharacterType = require('./char-type')
const SubApplication = require('./sub-app')
const httpStatus = require('http-status-codes')

class ValidationService extends SubApplication {
    constructor(db,options) {
        super(db,options)
        this.app.post('/user',      this.validateUsername.bind(this))
        this.app.post('/password',  this.validatePassword.bind(this))
    }

    
    async validateUsername(req,res,next)  {
        const username = this.postBody(req,res).value
        var rules = [
            new MinimumLengthRule(5), 
            new CharacterTypeRule(0, CharacterType.LOWERCASE),
            new MaximumCharacterTypeCountRule(0, CharacterType.SPECIAL),
            new MaximumCharacterTypeCountRule(0, CharacterType.UNKNOWN),
            
        ]
        // exception if any rule fails
        for (var i = 0; i < rules.length; i++) {
            try {
                rules[i].apply(username)
            } catch (e) {
                next(e)
            }
        }
        res.status(httpStatus.OK).end()
    }


    async validatePassword(req,res,next) {
        const pwn = this.postBody(req,res).value
        var rules = [
            new MinimumLengthRule(5), 
            new MinimumCharacterTypeCountRule(1, CharacterType.DIGIT)
        ]
         for (var i = 0; i < rules.length; i++) {
             try {
                rules[i].apply(pwd)
             } catch (e) {
                 next(e)
             }
        }
        res.status(httpStatus.OK).end()

    }
}
module.exports = ValidationService

