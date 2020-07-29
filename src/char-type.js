
const lowercase_letter  = 'abcdefghijklmnopqrstuvwxyz'
const uppercase_letter  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const digit             = '0123456789'
const special           = '!$^'


class CharacterType {
    static UPPERCASE = 'upper case'
    static LOWERCASE = 'lower case'
    static DIGIT     = 'digit'
    static  SPECIAL  = 'special'
    static  UNKNOWN  = 'unrecognized'

    static of(ch) {
        if (uppercase_letter.indexOf(ch) > -1) {return CharacterType.UPPERCASE}
        if (lowercase_letter.indexOf(ch) > -1) {return CharacterType.LOWERCASE}
        if (digit.indexOf(ch) > -1)            {return CharacterType.DIGIT}
        if (special.indexOf(ch) > -1)          {return CharacterType.SPECIAL}
        return CharacterType.UNKNOWN
    }
/*
 * count number of charcter of each type in given string
 */
    static  countTypes(str) {
        let counts = {UPPER:0, LOWER:0, DIGIT:0, SPECIAL:0, UNKNOWN:0}
        for (var i = 0; i < str.length; i++) {
            const type = CharacterType.of(str.charAt(i))
            if (type in counts) {
                counts[type] = 1 + counts[type]
            } else {
                counts[type] = 1
            }
        }   
        return counts
    }
}

module.exports = CharacterType