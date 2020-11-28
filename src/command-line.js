const Logger = require('./logger')

const logger = new Logger()
/**
 * Manages configuration reading from command-line.
 * 
 */
class CommandLine {
    /**
     * Reads command line into a dictionary. 
     * The key of the dictionary is flags/options that must begin with a dash
     * The value is the user specified value for the flag.
     * 
     * @param args args to parse. If not specifed, process.argv.slice(2)
     * 
     */
    constructor(args) {
        this.args = args || process.argv.slice(2)
        this.options = {}
        for (var i = 0; i < this.args.length; i++) {
            let option = this.args[i]
            if (this.isFlag(option)) {
                
                if (i < this.args.length-1 && !this.isFlag(this.args[i+1])) {
                    this.options[option] = this.args[i+1]
                } else {
                    this.options[option] = option
                }
            }
        } 
    }

    isFlag(s) {
        return s.startsWith('-')
    }

    getOption(opt, def) {
        if (opt in this.options) {
            return this.options[opt]
        }
        if (def == undefined) {
            let msg = `neither command-line option [${opt}], nor a default value provided. command line options [${Object.keys(this.options)}]`
            logger.error(msg)
            throw new Error(msg)
        }
        return def
    }

    isPresent(flag) {
        if (flag in this.options) {
            return flag in this.options
        } else {
            return false
        }
    }
}

/*
class Configuration {
    constructor(fname, baseDir) {
        this.fname   = fname
        this.baseDir = baseDir
        
        this.file_path = path.join(this.baseDir, this.fname)
        if (!fs.existsSync(this.file_path)) {
            throw new Error(`${this.file_path} does not exist`)
        }

        this.data    = this.readConfigFile()
    }

    get(key) {
        if (key in this.data) {
            return this.data[key]
        } else {
            throw new Error(`missing property ${key}. Available properties are ${Object.keys(this.data)}`)
        }
    }

    
}
*/
module.exports = CommandLine



 