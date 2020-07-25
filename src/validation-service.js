const {MinimumLengthRule, CharacterTypeRule,
    MinimumCharacterTypeCountRule, MaximumCharacterTypeCountRule,
    StringCharacterTypeRule} 
= require('./validation-rule')

class ValidationService {
    constructor(){

    }
    validateUsername(username)  {
        //console.log(`validate user name [${username}]`)
        //console.log(`request argument received is of type ${username.constructor.name}`)

        var rules = [
            new MinimumLengthRule(5), 
            new CharacterTypeRule(0, CHARACTER_TYPES.lowercase_letter),
            new MaximumCharacterTypeCountRule(0, 'special')
        ]
        // invalid rule will throw exception
        for (var i = 0; i < rules.length; i++) {
            rules[i].apply(username)
        }
    }


    validatePassword(pwd) {
        var rules = [
            new MinimumLengthRule(5), 
            new MinimumCharacterTypeCountRule(1, 'digit')
        ]
         // invalid rule will throw exception
         for (var i = 0; i < rules.length; i++) {
            rules[i].apply(pwd)
        }
    }
}
module.exports = ValidationService

