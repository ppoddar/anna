const { Pool }   = require('pg')
const types      = require('pg').types
const path       = require('path')
const fs         = require('fs')
const yaml       = require('js-yaml')
const assert     = require('assert')

class Database {
    constructor(options) {
        assert(options, 'no options to create a database')
        this.url = `${options.host}:${options.port}/${options.database}`
        console.log(`connecting to database [${this.url}] `)  
        this.pool = new Pool(options)
        this.sqls = {}
        this.readQueriesFromDir(options.sqldir)

        types.setTypeParser(types.builtins.NUMERIC, function(val){
            let r = parseFloat(val)
            return r
        })
        

    }
    /**
     * begins transaction.
     * @returns connection. all operations on this connection
     * would belong to same transaction
     */
    async begin() {
        let client = await this.pool.connect()
        await client.query('BEGIN')
        return client
    }
    /**
     * commit a transaction
     * @param {Connection} client 
     */
    async commit(txn) {
        if (txn == undefined || txn == null) return
        try {
            await txn.query('COMMIT')
        } finally {
           txn.release()
        }
    }

    /**
     * rollback a transaction
     * @param {Connection} client 
     */
    async rollback(txn) {
        if (txn == undefined || txn == null) return
        try {
            await txn.query('ROLLBACK')
        } finally  {
            txn.release()
        } 
    }

    async executeSQL(name, params) {
        const client = await this.pool.connect()
        try {
            return await this.executeSQLInTxn(client, name, params)
        } catch (e) {
            throw e
        } finally {
            client.release()
        }
    }
    /**
     * Runs a named, parametrized SQL query (SELECT/INSERT/UPDATE/DELETE) 
     * A important method becuase this application is mostly based on database
     * query.
     * 
     * This is an async method, and hence always returns a Promise.
     * When a database error occurs, the error is rethrown , i.e.
     * a RejecetdPromise is returned.
     * The returned promise bubbles up to the controller API level.
     * 
     * 
     * @param {object} q a query with bind parameters. 
     * @param {array} params bind parameters
     * @returns array of result rows or a single row if query is marked as single.
     * if result for a single row query is non unique, returns null 
     */
    async executeSQLInTxn(client, name, params) {
        // ref: https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
        try {
            const q = this.findQuery(name)
            console.debug(`SQL [${q.name}] [${q.text}] parameters [${params}]`)
            let result = await client.query(q.text, params)
            //console.debug(`returns  ${result.rowCount} rows`)
            if (q.single) {
                if (result.rowCount == 1) {
                    return result.rows[0]
                } else {
                    console.warn(`${name} returned ${result.rowCount} rows. Expected 1. Returning null`)
                    return null
                }
            } else {
                return  result.rows
            }         
        } catch (err) {
            throw err
        } 
    } 

    async listen(channel, cb) {
        let client = await this.pool.connect()
        client.query(`LISTEN ${channel}`)
        client.on('notification', async (data) => {
            const payload = JSON.parse(data.payload)
            cb.call(null, payload)
        })
    }

    


    findQuery(name) {
        assert(name in this.sqls, `unknown query [${name}]. known queries are ${Object.keys(this.sqls).sort()}`)
        return this.sqls[name]
    }
    /**
     * read queries from *.yml files in a directoruy.
     * @returns dictionary of queries indexed by name
     */
    readQueriesFromDir(dir) {
        console.debug(`readQueriesFromDir(): SQL directory [${dir}]`)
        if (!fs.existsSync(dir)) {
            throw Error(`SQL dir ${dir} does not exist`)
        }
        let queries = {}
        var files = fs.readdirSync(dir, {withFileTypes:true})

        for (var i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) continue
            var f = path.join(dir, files[i].name)
            let q = this.readQueriesFromFile(f)
            Object.assign(queries, q)
        }
        console.debug(`read ${Object.keys(queries).length} queries from ${files.length} files in [${dir}] directory`)
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

}

module.exports = Database