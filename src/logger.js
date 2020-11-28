/*
 * a logger logs in standard system output and error stream.
 * 
 */

const COLOR_RED    = '\033[0;31m'
const COLOR_RESET  = '\033[0m' 
const COLOR_GREEN  = '\033[0;32m'
const COLOR_YELLOW = '\033[0;33m'
const COLOR_GREY   = '\033[0;33m'

/*
 * debug list - environment variable DEBUG - is comma-separated caller names
 * A debug() staement is printed only if caller name is in the list
 */
DEBUG_LIST = process.env.DEBUG ? process.env.DEBUG.split(',') : []
//console.log(`DEBUG_LIST:${DEBUG_LIST}`)

class Logger {
    constructor(options) {
        this.options = options || {printStackTarce:false, color:true}
    }

    info(msg) {
        this.print(msg, COLOR_GREEN)
    }
    
    warn(msg) {
        this.print(msg, COLOR_YELLOW)
    }

    error(msg,e) {
        this.print(msg, COLOR_RED)
        if (e && this.options.printStackTarce) {
            console.log(e)
        }
    }

    debug(msg) {
        var caller = this.callerName()
        for (var i =0; i < DEBUG_LIST.length; i++) {
            if (caller.startsWith(DEBUG_LIST[i])) {
                this.print(msg, COLOR_GREY)
            }
        }
    }

    /*
     * print message on console. If configured to print color
     * uses ANSI color code to color the output 
     */
    print(msg, color) {
        if (color && this.options.color) {
            msg = `${color} ${msg} ${COLOR_RESET}` 
        }
        console.log(msg)
    }

    /*
     * gets caller name
     */
    callerName() {
        try {
          throw new Error();
        } catch (e) {
          try {
              var line = e.stack.split('at ')[3].split(' ')
              var fnName = line[0]
              var lineNumber = line[1].split(':')[1]
              return `${fnName}:${lineNumber}`
          } catch (e) {
            return '';
          }
        }
      }
}

module.exports = Logger