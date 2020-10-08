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
function  post_request(protocol, host, port, urlpath, obj, objtype) {
    const payload = JSON.stringify(obj)
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
    const oid = objtype == 'user' ? obj.id : obj.sku
    const server = protocol == 'http' ? http : https
    const req = server.request(options, res => {
        var body = ''
        res.on('data', chunk => {
            body += chunk
        })
        res.on('end', function() {
            const targetUrl = `${protocol}://${host}:${port}${urlpath}`
            const status = res.statusCode
            logger.debug(`POST  ${targetUrl} (${payload.length} bytes) ${status}`)
            if (status == 200) {
                logger.info(`created new ${objtype} ${oid}`)
            } else if (res.statusCode == 304) {
                logger.warn(`${objtype} ${oid} exists`)
            } else {
                logger.warn('unexpected response:')
                logger.warn(body)
            }
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
function populate_from_file(protocol, host, port, urlpath, file_path, objtype) {
    if (!fs.existsSync(file_path)) {
        logger.error(`can not read non-existent ${objtype} file [${file_path}]`)
        process.exit(1)
    }
    logger.info(`reading ${objtype} from ${file_path}`)
    let fileContents = fs.readFileSync(file_path, 'utf8');
    var objects = []
    if (file_path.endsWith('.yml')) {
        objects = yaml.parse(fileContents)
    } else if (file_path.endsWith('.json')) {
        objects = JSON.parse(fileContents)
    } else if (fs.lstatSync(file_path).isDirectory()) {
        populate_from_directory(protocol, host, port, file_path, objtype)
    } else {
        logger.error(`can not read file [${file_path}]. Only accepts *.yml and *.json file`)
        return
    }
    if (!Array.isArray(objects)) objects = [objects]
    for (var i = 0; i < objects.length; i++) {
        post_request(protocol, host, port, urlpath, objects[i], objtype)
    }
}
    
function populate_from_directory(protocol, host, port, urlpath, dir_path, objtype) {
    var files = fs.readdirSync(dir_path, { withFileTypes: true })
    for (var i = 0; i < files.length; i++) {
        const file_path = path.join(dir_path, files[i].name)
        populate_from_file(protocol, host, port, urlpath, file_path, objtype)
    }
    
}

const cli      = new CommandLine()
const protocol = cli.getOption('--protocol', 'http')
const host     = cli.getOption('--host', 'localhost');
const port     = cli.getOption('--port', '8090');
const objtype  = cli.getOption('--obj', 'item')
const dir_path = cli.getOption('-d')
const urlpath = (objtype == 'user') ? '/user' : '/item' 

populate_from_directory(protocol, host, port, urlpath, dir_path, objtype)