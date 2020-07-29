var fs     = require('fs')
const yaml = require('js-yaml')

/**
 * Manages configuration for a micro-service
 * reading from command-line.
 * 
 */
class CommandLine {
    /**
     * Reads command line into a dictionary. 
     * The key of the dictionary is flags/options that must begin with a dash
     * The value is the user specified value for the flag.
     * 
     * @alias AppConfig
     * 
     */
    constructor() {
        this.options = {}
        let args = process.argv.slice(2)
        for (var i = 0; i < args.length; i++) {
            let option = args[i]
            if (this.isFlag(option)) {
                if (i < args.length-1 && !this.isFlag(args[i+1])) {
                    this.options[option] = args[i+1]
                } else {
                    this.options[option] = option
                }
            }
        } 
    }

    isFlag(s) {
        return s.startsWith('-')
    }

    getConfig(opt, def) {
        let configFileName = this.getCommandLineOption(opt, "")
        if (configFileName == "") configFileName = def
        let data = this.readConfigFile(configFileName)
        return data
    }

    readConfigFile(fname) {
        try {
            let fileContent = fs.readFileSync(fname, 'utf8');
            var data
            if (fname.endsWith('.yml')) {
                data =  yaml.safeLoad(fileContent)
            } else {
                data =  JSON.parse(fileContent)
            }
            return data
        } catch (err) {
            throw err
        }
    }

    getCommandLineOption(opt, def) {
        if (opt in this.options) {
            return this.options[opt]
        }
        if (def == undefined) {
            let msg = `neither command-line option [${opt}], nor a default value provided. command line options ${Object.keys(this.options)}`
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

module.exports = CommandLine



 