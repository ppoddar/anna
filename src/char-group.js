
const lowercase_letters  = 'abcdefghijklmnopqrstuvwxyz'
const uppercase_letters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const digits             = '0123456789'
const special            = '!$^'

const UPPERCASE = 'upper case'
const LOWERCASE = 'lower case'
const DIGIT     = 'digit'
const SPECIAL   = 'special'

class CharacterGroup {
    constructor() {
    }
    /*
     * return if given charcter belongs to one of the groups
    */
    static of(ch) {
        if (uppercase_letters.indexOf(ch) > -1) {return UPPERCASE}
        if (lowercase_letters.indexOf(ch) > -1) {return LOWERCASE}
        if (digits.indexOf(ch) > -1)            {return DIGIT}
        if (special.indexOf(ch) > -1)           {return SPECIAL}
    }
/*
 * count number of charcter of each group in given string
 */
    static  groupCount(str) {
        let counts = {UPPER:0, LOWER:0, DIGIT:0, SPECIAL:0, UNKNOWN:0}
        for (var i = 0; i < str.length; i++) {
            const group = CharacterGroup.of(str.charAt(i))
            counts[group] = 1 + counts[group]
        }   
        return counts
    }
}
module.exports = CharacterGroup
