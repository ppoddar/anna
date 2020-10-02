COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m' 
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'
COLOR_GREY='\033[0;33m'

DEBUG_LIST = process.env.NODE_DEBUG.split(',')

class Logger {
    info(msg) {
        this.print(msg, COLOR_GREEN)
    }
    error(msg,e) {
        this.print(msg, COLOR_RED)
        if (e) {
            console.log(e)
        }
    }
    warn(msg) {
        this.print(msg, COLOR_YELLOW)
    }

    debug(msg) {
        var caller = this.callerName()
        //console.log(`caller ${caller}`)
        if (DEBUG_LIST.indexOf(caller) > 0) {
            this.print(msg, COLOR_GREY)
        }
    }

    print(msg, color) {
        if (color) {
            msg = `${color} ${msg} ${COLOR_RESET}` 
        }
        console.log(msg)
    }

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

module.exports = new Logger()