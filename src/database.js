const { Pool }   = require('pg')
const types      = require('pg').types
const assert     = require('assert')
const logger     = require('./logger')

class Database {
    constructor(options) {
        assert(options, 'no options to create a database')
        this.url = `${options.host}:${options.port}/${options.database}`
        this.sqls = {}
        this.pool = new Pool(options)
        this.pool.connect((error,client,release) => {
            if (error) {
                logger.error(`Failed to connect to database [${this.url}]`, error)
                process.exit(1)
            } else {
                logger.info(`connected to database [${this.url}] as user [${options.user}]`) 
                types.setTypeParser(types.builtins.NUMERIC, function(val){
                    let r = parseFloat(val)
                    return r
                })
            }
        })
    }

    /**
     * begins transaction.
     * @returns a transaction. all operations on this connection
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

    /** 
     * executes an SQL of given name and with given parameters
     * @param name name of a SQL. A databse uses a repository of SQL statements.
     * The named query must be defined.
     * @param params bind parameters, can be null/undefined
     */
    async executeSQL(name, params) {
        const client = await this.pool.connect()
        try {
            return await this.executeSQLInTxn(client, name, params || [])
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
     * @param txn the transaction
     * @param {object} name of a query
     * @param {array} params bind parameters
     * @returns array of result rows or a single row if query is marked as single.
     * if result for a single row query is non unique, returns null 
     */
    async executeSQLInTxn(txn, name, params) {
        return await this.executeQuery(txn, this.sqls.findQuery(name), params)
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
    async executeQuery(txn, q, params) {
        // ref: https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
        try {
            logger.debug(`SQL [${q.name}] [${q.text}] parameters [${params}]`)
            let result = await txn.query(q.text, params)
            if (q.single) {
                if (result.rowCount == 1) {
                    logger.debug(`single query [${q.name}] parameters [${params}] returned ${result.rows[0]}`)
                    return result.rows[0]
                } else {
                    logger.debug(`***WARN:single query [${q.name}] parameters [${params}] returned ${result.rowCount} rows. Expected a result row. Returning null`)
                    return null
                }
            } else {
                if (result.rowCount > 0) {
                    logger.debug(`query [${q.name}] parameters [${params}] returned ${result.rowCount} rows.`)
                    return result.rows
                } else {
                    logger.debug(`***WARN:query [${q.name}] parameters [${params}] returned no rows. Returning empty list`)
                    return []
                }
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

    
    
}

module.exports = Database