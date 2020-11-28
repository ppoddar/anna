const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const Logger = require('./logger')
const logger = new Logger()

/*
 * Respository of SQL statements read from a YAML file.
 * Maintains a dictionary of SQL statements indexed by name.
 */
class SQLRepository {
    /*
     * Constructs a repository by reading all YAML files
     * in the given directory 
     */
    constructor(dir) {
        this.sqls = {}
        if (!fs.existsSync(dir)) {
            logger.error(`SQL repository directory [${dir}] does not exist`)
        }
        logger.info(`reading SQL repository from ${dir}`)
        this.readQueriesFromDir(dir)
    }
    /**
     * read queries from *.yml files in a directoruy.
     * @returns dictionary of queries indexed by name
     */
    readQueriesFromDir(dir) {        
        var files = fs.readdirSync(dir, {withFileTypes:true})
        logger.info(`found ${files.length} files in directory ${dir}`)
        const ctx = this
        fs.readdir(dir, function (err, files) {
            files.forEach(function(f) {
                let q = ctx.readQueriesFromFile(path.join(dir,f))
            })
        })
        // for (var i = 0; i < files.length; i++) {
        //     //console.log(`process file ${files[i].name}`)
        //     //if (files[i].isDirectory()) continue
        //     //if (!(path.basename(files[i]).endsWith('.yml'))) continue
        //     //if (!files[i].name.endsWith(".yml")) continue
        //     //var f = path.join(dir, files[i].name)
        //     let q = this.readQueriesFromFile(files[i])
        // }
        //logger.info(`read ${Object.keys(this.sqls).length} queries`)
    }

    /**
     * reads query specifcation from given file
     * 
     * @param {file} file 
     * @returns dictionary of queries indexed by name
     */
    readQueriesFromFile(file) {
        try {
            //console.debug(`readQueriesFromFile(): ${file}`)
            let fileContents = fs.readFileSync(file, 'utf8');
            let data = yaml.safeLoad(fileContents);
    
            for (var name in data) {
                if (name in this.sqls) {
                    logger.warn(`can not create SQL ${name} from ${file}. A SQL of same name has already been defiend`)
                } else {
                    let query = data[name]
                    this.sqls['name'] = query
                    logger.debug(`create [${name}] ${query.text} ....`)
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    /*
     * gets query.
     * throws error if query is not defiend
     */
    findQuery(name) {
        if (name in this.sqls) {
            return this.sqls[name]
        } else {
            logger.error(`unknown query [${name}]. known queries are ${'\n'.join(Object.keys(this.sqls).sort())}`)
        }
    }
    


}

module.exports = SQLRepository