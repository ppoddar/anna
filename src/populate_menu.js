/*
 * Populates menu.
 *
 */
const URL = require('url').URL
const https = require('https')
const CommandLine = require('./command-line')
var fs = require('fs')
var yaml = require('js-yaml')
var logger = require('./logger')
/*
 * makes a POST request with given payload
 */
function  post_request(url, payload) {
    console.log('POST ' + url)
    const options = {
        hostname: url.host,
        port: url.port,
        path: url.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      }
    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', d => {
          process.stdout.write(d)
        })
      })
      req.on('error', error => {
        console.error(error)
      })
      req.write(payload)
      req.end()
}


/*
 * read given yaml/json file.
 * poulates menu item by POST request to the service
 */
function populate(url, file_path) {
    if (!fs.existsSync(file_path)) {
        logger.error(`can not read non-existent file [${file_path}]`)
        process.exit(1)
    }
    logger.info(`populating items from ${file_path}`)
    let fileContents = fs.readFileSync(file_path, 'utf8');
    var items = []
    if (file_path.endsWith('.yml')) {
        items = yaml.parse(fileContents)
    } else if (file_path.endsWith('.json')) {
        items = JSON.parse(fileContents)
    } else {
        logger.error(`can not read file [${file_path}]. Only accepts *.yml and *.json file`)
        process.exit(1)
    }
    if (!Array.isArray(items)) items = [items]
    for (var i = 0; i < items.length; i++) {
        post_request(url, JSON.stringify(items[i]))
    }
}
    


const cli = new CommandLine()
const url = new URL('/item', cli.getOption('-u', 'http://localhost:8080'));
const file_path = cli.getOption('-f')
populate(url, file_path)