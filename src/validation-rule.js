const CharacterGroup  = require('./char-group.js')

/*
 * String must have a mnimum length
 */
class MinimumLengthRule {
    constructor(minLength) {
        this.minLength = minLength
    }
    apply(str) {
        if (str.length < this.minLength) {
            const msg = `must have at least ${this.minLength} characters`
            //console.log(`***Validation Error: ${this.constructor.name} [${str}]  ${msg}`)
            throw new Error(msg)
        } 
    }
}

/*
 * String must have each type of characters 
 */
class CharacterGroupRule {
    /*
     * @param counts a dictionary(character group:minimum number)
     */
    constructor(min, counts) {
        this.counts = counts
        this.compareMin = min
    }
    apply(str) {
        const actualCounts = CharacterGroup.groupCount(str)
        for (var group in this.counts) {
            const expeceted = this.counts[group]
            const actual  = actualCounts[group]
            if (this.compareMin) {
                if (actual > expeceted) {
                    const msg = `${group} must have at most ${expeceted} character, but has ${actual}`
                    throw new Error(msg)
                }
            } else {
                if (actual < expeceted) {
                    const msg = `${group} must have at least ${expeceted} character, but has ${actual}`
                    throw new Error(msg)
                }
            }
        }

    }
}
class UnknownCharacterRule {
    apply(str) {
        for (var i = 0; i < str.length; i++) {
            const ch = str.charAt(i)
            const group = CharacterGroup.of(ch)
            if (!group) {
                const msg = `[${ch}] at ${i}-th position is not allowed`
                console.log("=========================")
                console.log(msg)
                console.log("=========================")
                throw new Error(msg)
            }
        }
    }
}

class FirstCharacerLowerCaseRule {
    apply(str) {
        let ch = str.charAt(0)
        if (ch.toLowerCase() != ch) {
            const msg = `first character [${ch}] must be lowercase`
            throw new Error(msg)
        }
    }
}

class UniqueUserIdRule {
    async apply(uid, db) {
        var result = await db.executeSQL('find-user', [uid])
        console.log(`SQL:find-user result=${result}`)
        if (result !== null) {
            const msg = `user [${uid}] exists`
            throw new Error(msg)
        }
    }
}




module.exports = {
    CharacterGroupRule: CharacterGroupRule,
    MinimumLengthRule: MinimumLengthRule,
    FirstCharacerLowerCaseRule: FirstCharacerLowerCaseRule,
    UnknownCharacterRule:UnknownCharacterRule,
    UniqueUserIdRule:UniqueUserIdRule
}