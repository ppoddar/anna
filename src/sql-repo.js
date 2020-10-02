const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const util       = require('util')
const debuglog = util.debuglog('database')
const assert     = require('assert')
const logger     = require('./logger')

class SQLRepository {
    constructor(dir) {
        this.sqls= {}
        logger.info(`reading queries from ${dir}`)
        this.readQueriesFromDir(dir)
    }
    /**
     * read queries from *.yml files in a directoruy.
     * @returns dictionary of queries indexed by name
     */
    readQueriesFromDir(dir) {
        debuglog(`readQueriesFromDir(): SQL directory [${dir}]`)
        if (!fs.existsSync(dir)) {
            throw Error(`SQL dir [${dir}] does not exist`)
        }
        let queries = {}
        var files = fs.readdirSync(dir, {withFileTypes:true})

        for (var i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) continue
            var f = path.join(dir, files[i].name)
            let q = this.readQueriesFromFile(f)
            Object.assign(queries, q)
        }
        debuglog(`read ${Object.keys(queries).length} queries from ${files.length} files in [${dir}] directory`)
        this.sqls = queries
    }

    /**
     * reads query specifcation from given file
     * 
     * @param {file} file 
     * @returns dictionary of queries indexed by name
     */
    readQueriesFromFile(file) {
        let queries = {}
        try {
            //console.debug(`readQueriesFromFile(): ${file}`)
            let fileContents = fs.readFileSync(file, 'utf8');
            let data = yaml.safeLoad(fileContents);
    
            for (var name in data) {
                let query = data[name]
                query['name'] = name
                //console.info(`[${name}] ${query.text.substring(0,15)} ....`)
                queries[name] = query 
            }
        } catch (e) {
            console.error(e);
        }
        //console.debug(`read ${Object.keys(queries).length} queries from ${path.basename(file)}`)
        return queries
    }

    findQuery(name) {
        assert(name in this.sqls, `unknown query [${name}]. known queries are ${Object.keys(this.sqls).sort()}`)
        return this.sqls[name]
    }
    


}

module.exports = SQLRepository