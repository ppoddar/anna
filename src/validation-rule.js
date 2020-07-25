const CHARACTER_TYPES = {
    lowercase_letter  : 'abcdefghijklmnopqrstuvwxyz',
    uppercase_letter  : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digit   : '0123456789',
    special : '!$^'
}

function charType(ch) {
    if (ch in CHARACTER_TYPES.uppercase_letter) {return CHARACTER_TYPES.uppercase_letter}
    if (ch in CHARACTER_TYPES.lowercase_letter) {return CHARACTER_TYPES.lowercase_letter}
    if (ch in CHARACTER_TYPES.digit) {return CHARACTER_TYPES.digit}
    if (ch in CHARACTER_TYPES.special) {return CHARACTER_TYPES.special}

}
function countCharacterTypes(str) {
    let counts = {letter:0, digit:0, special:0}
    for (var i = 0; i < str.length; i++) {
        let ch = str.charAt(i).toLowerCase()
        const type = charType(ch)
        if (type in counts) {
            counts[type] = 1 + counts[type]
        } else if (type) {
            counts[type] = 1
        }
    }   
    return counts
}
/*
 * Rules throws exception if input does not satisify
 */
class MinimumLengthRule {
    constructor(minLength) {
        this.minLength = minLength
    }
    apply(str) {
        if (str.length < this.minLength) {
            throw new Error(`must have at least ${this.minLength} charcters`)
        }
    }
}
class StringCharacterTypeRule {
    constructor(counts) {
        this.counts = counts
    }
    apply(str) {
        actualCounts = countCharacterTypes(str)
        for (t in this.counts) {
            const m = this.counts[t]
            const actual = actualCounts[t]
            if (actual < m) {
                throw new Error(`has ${actual} character of type ${t}. Mimimum ${m} must be present `)
            }

        }
    }
}
class CharacterTypeRule {
    constructor(pos, type) {
        this.pos = pos
        this.type = type
    }
    
    apply(str) {
        //console.log(`${this.constructor.name}.apply [${str}] at posotion ${this.pos}`)
        let ch = str.charAt(this.pos).toLowerCase()
        if (CHARACTER_TYPES[this.type].indexOf(ch) == -1) {
            throw new Error(`${this.pos}-th character must be ${this.type}`)
        }
    }
}

class MinimumCharacterTypeCountRule {
    constructor(count, type) {
        this.mincount = count
        this.type     = type;
    }
    apply(str) {
        var counts = countCharacterType(str)
        if (counts[this.type] < this.mincount) {
            throw new Error(`must have at least ${this.mincount} ${this.type} characters`)
        }
    }
}

class MaximumCharacterTypeCountRule {
    constructor(count, type) {
        this.maxcount = count
        this.type     = type;
    }
    apply(str) {
        var counts = countCharacterType(str)
        if (counts[this.type] > this.maxcount) {
            throw new Error(`must have less than ${this.maxcount} ${this.type} character(s)`)
        }
    }
}

module.exports = {
    CharacterTypeRule: CharacterTypeRule,
    MaximumCharacterTypeCountRule: MaximumCharacterTypeCountRule,
    MinimumCharacterTypeCountRule: MinimumCharacterTypeCountRule,
    MinimumLengthRule: MinimumLengthRule,
    StringCharacterTypeRule: StringCharacterTypeRule,
    CHARACTER_TYPES:CHARACTER_TYPES
}