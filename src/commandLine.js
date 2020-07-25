var fs     = require('fs')
var path   = require('path');
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
        for (var i = 0; i < args.length-1; i+=2) {
            let option = args[i]
            this.options[option] = args[i+1]
        }    
    }
    /*
     * Gets YAML configuration as a dictionary.
     * @parm the command line option that specifes the YAML file
     * Typically -c 
     */
    getConfig(opt, def) {
        let configFileName = this.getCommandLineOption(opt, "")
        if (configFileName == "") configFileName = def
        let data = this.readConfigFile(configFileName)
        return data
    }

    readConfigFile(fname) {
        try {
            let fileContent = fs.readFileSync(fname, 'utf8');
            var data =  yaml.safeLoad(fileContent)
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
            let msg = `neither command-line option [${opt}], nor a default value provided. command line options ${Object.keys(this.args)}`
            throw msg
        }
        return def
    }
}

module.exports = CommandLine



 