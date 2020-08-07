const request    = require('request');
const httpStatus = require('http-status-codes');
var assert       = require('chai').assert


let random = new Date().getTime()
let port = 8080
let BASE_URL = `http://localhost:${port}`

let testItem = {
    sku: `${random}`,
    name: `test item-${random}`,
    description: `description item-${random}`,
    price: 2,
    category: 'veg',
    tags: ['spicy']
}
var oid
var user = { id: 'tester', auth: '', password: 'hel1o' }
var address_kind = 'home'

describe('Tests for Order Managemnent Service', function () {
    it('server info: can be obtained explicitly', function (done) {
        request(`${BASE_URL}/info`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            assert.equal(body.version, "1.0.0")
            done()
        })
    })

    it('item: can be created', function (done) {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/item/`,
            body: JSON.stringify(testItem)
        }, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
            done()
        })
    })
    it('item: catalog is not empty ', function (done) {
        request(`${BASE_URL}/item/catalog`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            assert.isArray(body, 'response body must be array')
            assert.isTrue(body.length > 0)
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
    it('order: id is assigned on create', function (done) {
        const lineitems = [{ sku: 101, units: 1 }, { sku: 102, units: 2 }]
        options = {
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/order/${user.id}`,
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
    
    it('invoice: created invoice gets payorder from Payment gateway ', function(done) {
        assert.isFalse(oid == undefined, 'order has not been created')
        options = {
            headers: {'content-type':'application/json'},
            url:`${BASE_URL}/invoice/${oid}/${user.id}`

        }
        request.post(options, function (err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
            const order = JSON.parse(body)
            assert.property(order,"id")
            assert.property(order,'amount')
            assert.property(order,'payorder')
            done()
        })
    })
})



















