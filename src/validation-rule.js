const CharacterType   = require('./char-type')
const ValidationError = require('./errors').ValidationError
/*
 * String must have a mnimum length
 */
class MinimumLengthRule {
    constructor(minLength) {
        this.minLength = minLength
    }
    apply(str) {
        if (str.length < this.minLength) {
            throw new ValidationError(`must have at least ${this.minLength} charcters`)
        } 
    }
}

/*
 * String must have each type of characters 
 */
class StringCharacterTypeRule {
    constructor(counts) {
        this.counts = counts
    }
    apply(str) {
        actualCounts = CharcterType.countCharacterTypes(str)
        for (t in this.counts) {
            const m      = this.counts[t]
            const actual = actualCounts[t]
            if (actual < m) {
                throw new ValidationError(`has ${actual} character of type ${t}. Mimimum ${m} must be present `)
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
        let ch = str.charAt(this.pos)
        if (CharacterType.of(ch) != this.type) {
            throw new ValidationError(`${ch} at ${this.pos} must be of ${this.type} type`)
        }
    }
}

class MinimumCharacterTypeCountRule {
    constructor(count, type) {
        this.mincount = count
        this.type     = type;
    }
    apply(str) {
        var counts = CharacterType.countTypes(str)
        if (counts[this.type] < this.mincount) {
            throw new ValidationError(`must have at least ${this.mincount} ${this.type} characters`)
        }
    }
}

class MaximumCharacterTypeCountRule {
    constructor(count, type) {
        this.maxcount = count
        this.type     = type;
    }
    apply(str) {
        var counts = CharacterType.countTypes(str)
        if (counts[this.type] > this.maxcount) {
            throw new ValidationError(`must have less than ${this.maxcount} ${this.type} character(s)`)
        }
    }
}

module.exports = {
    CharacterTypeRule: CharacterTypeRule,
    MaximumCharacterTypeCountRule: MaximumCharacterTypeCountRule,
    MinimumCharacterTypeCountRule: MinimumCharacterTypeCountRule,
    MinimumLengthRule: MinimumLengthRule,
    StringCharacterTypeRule: StringCharacterTypeRule
}