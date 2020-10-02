class AddressController {
    constructor(db) {
        this.db = db
    }

    async insertAddress(txn, uid, addr) {
        console.log(`insert-address uid=${uid} ${JSON.stringify(addr)}`)
        let params = [addr.kind, uid, addr.line1, addr.line2, addr.city, addr.zip, addr.tips]
        if (txn)
            return await this.db.executeSQLInTxn(txn, 'insert-address', params)
        else 
            return await this.db.executeSQL('insert-address', params)

    }

    async updateAddress(txn, uid, addr) {
        let params = [addr.kind, uid, addr.line1, addr.line2, addr.city, addr.zip, addr.tips]
        if (txn)
            return await this.db.executeSQLInTxn(txn, 'update-address', params)
        else 
            return await this.db.executeSQL(txn, 'update-address', params)
    }


     async getAddresses(uid) {
        let addresses = await this.db.executeSQL('select-all-address', 
                [uid])
        return addresses
    }

    async getAddressByKind(uid,kind) {
        const address = await this.db.executeSQL('select-address-by-kind', [uid, kind])
        return address
    }

    async getAddressById(uid,id) {
        const address = await this.db.executeSQL('select-address-by-id', [uid,id])
        return address
    }

    validateAddress(kind, address) {
        if (address == undefined || Object.keys(address).length == 0) {
            throw new Error(`${kind} address is empty or defined`)
        }
        if (!address.line1 || address.line1 == null) {
            throw new Error(`${kind} address is missing line1`)
        }

        if (!address.zip || address.zip == null) {
            throw new Error(`${kind} address has no zip`)
        }
    }
}

module.exports = AddressController


/*
async upsertAddress(uid, addr, update) {
        try {
            return await this.insertAddress(uid,addr, async (err,addresss) => {
                if (err) {
                    console.log(`***ERROR:insert address did not work ${err}. trying update...`)
                    return Promise.resolve(this.updateAddress(uid, addr)
                        .then((address)=>{
                            console.log(`--------- resolve inner promise ${address} ------------`)
                            return address
                        })) 
                 }
            })
        } catch (e) {
            console.log('***ERROR:something unexpected happened')
            console.error(e)
            throw e
        }
    }

    async updateAddress(uid, addr) {
        let params = [addr.kind, uid, addr.line1, addr.line2, addr.city, addr.zip, addr.tips]
        return await this.db.executeSQL('update-address', params)
    }

   
*/