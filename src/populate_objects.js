/*
 * Populates menu.
 *
 */
const http  = require('http')
const https = require('https')
const CommandLine = require('./command-line')
var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var logger = require('./logger')

/*
 * makes a POST request with given payload
 * @param protocol 
 * @param host
 * @param port
 * @param urlpath
 * @param payload
 */
function  post_request(protocol, host, port, urlpath, payload) {
    console.log(`POST http://${host}:${port}/${urlpath} (${payload.length} bytes)`)
    const options = {
        hostname: host,
        port: port,
        path: urlpath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      }
    const server = protocol == 'http' ? http : https
    const req = server.request(options, res => {
        var body = ''
        res.on('data', chunk => {
            body += chunk
        })
        res.on('end', function() {
            logger.info(`statusCode: ${res.statusCode}`)
            logger.info(body)
        })
    })

    req.on('error', error => {
        console.error(error)
      })
      req.write(payload)
      req.end()
}


/*
 * read given yml/json file.
 * poulates menu item by POST request to the service
 */
function populate_from_file(protocol, host, port, urlpath, file_path) {
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
    } else if (fs.lstatSync(file_path)) {
        populate_from_directory(protocol, host, port, file_path)
    } else {
        logger.error(`can not read file [${file_path}]. Only accepts *.yml and *.json file`)
        return
    }
    if (!Array.isArray(items)) items = [items]
    for (var i = 0; i < items.length; i++) {
        var payload =  JSON.stringify(items[i])
        post_request(protocol, host, port, urlpath, payload)
    }
}
    
function populate_from_directory(protocol, host, port, urlpath, dir_path) {
    var files = fs.readdirSync(dir_path, { withFileTypes: true })
    for (var i = 0; i < files.length; i++) {
        const file_path = path.join(dir_path, files[i].name)
        populate_from_file(protocol, host, port, urlpath, file_path)
    }
    
}

const cli      = new CommandLine()
const protocol = cli.getOption('--protocol', 'http')
const host     = cli.getOption('--host', 'localhost');
const port     = cli.getOption('--port', '8090');
const objtype  = cli.getOption('--obj', 'item')
const dir_path = cli.getOption('-d')
const urlpath = '/item' 
if (objtype == 'user') urlpath = '/user'

populate_from_directory(protocol, host, port, urlpath, dir_path)