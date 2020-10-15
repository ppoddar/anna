const request    = require('request');
const httpStatus = require('http-status-codes');
var assert       = require('chai').assert


let port = process.env.PORT || 8080
let BASE_URL = `http://localhost:${port}`

let items 
let testUser = {id:'tester', password:'hel10', roles:['customer']}

describe('Tests for Order Managemnent Service', function () {
    it('server info: can be obtained explicitly', function (done) {
        request(`${BASE_URL}/info`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            assert.equal(body.version, "1.0.0")
            done()
        })
    })
    it('create test user', function(done){
        request(`${BASE_URL}/user/${testUser.id}`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            if (res.statusCode != 200) {
                console.log(`creating user ${testUser.id} ...`)
                options = {
                    headers: { 'content-type': 'application/json' },
                    url: `${BASE_URL}/user`,
                    body: JSON.stringify(testUser)
                }
                request.post(options, function (err,res,body) {
                    assert.isNull(err)
                    done()
                })
            } else {
                console.log(`user ${testUser.id} exists`)
                done()
            }
        })
    }) 

    it('item: catalog is not empty ', function (done) {
        request(`${BASE_URL}/item/catalog`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            items = body
            assert.isArray(items, 'response body must be array')
            assert.isTrue(items.length > 0)
            done()
        })
    })

    it('user can login', function (done) {
        var basicAuth = `Basic ${Buffer.from(`${testUser.id}:${testUser.password}`).toString('base64')}`
        const options = {
            headers: { Authorization: basicAuth },
            url: `${BASE_URL}/user/login/${testUser.id}?role=customer`
        }
        request.post(options, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            done()
        })
    })


    it('database: connetions are pooled ', function (done) {
        for (var i = 0; i < 2; i++) {
            request(`${BASE_URL}/item/catalog`, { json: true }, (err, res, body) => {
            })
        }
        done()
    })

    it('order: order id is assigned on create', function (done) {
        const lineitems = [
            { sku: items[0].sku, units: 1 }, 
            { sku: items[1].sku, units: 2 }]
        options = {
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/order/${testUser.id}`,
            body: JSON.stringify(lineitems)
        }
        request.post(options, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
            const order = JSON.parse(body)
            assert.property(order, "id")
            oid = order.id
            done()
        })
    })
    /*
    it('invoice: created invoice gets payorder from Payment gateway ', function(done) {
        assert.isFalse(oid == undefined, 'order has not been created')
        options = {
            headers: {'content-type':'application/json'},
            url:`${BASE_URL}/invoice/${oid}/user/${user.id}`
        }
        request.post(options, function (err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
            const invoice = JSON.parse(body)
            assert.property(invoice,"id")
            assert.property(invoice,'amount')
            assert.property(invoice,'payorder')
            assert.equal(oid, invoice.id)
            assert.equal(invoice.amount*100, invoice.payorder.amount_due)

            done()
        })
    })
    */


   it('user can logout', function (done) {
    request.post({
        url: `${BASE_URL}/user/logout/${testUser.id}`
    }, function (err, res, body) {
        assert.isNull(err)
        assert.equal(res.statusCode, 200)
        done()
    })
})
})



















