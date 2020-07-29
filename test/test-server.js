const request = require('request');
const { response } = require('express');
var assert  = require('chai').assert

let random = new Date().getTime()
let port = 8080
let BASE_URL = `http://localhost:${port}`

let testItem = {
    sku: `${random}`,
    name: `test item-${random}`,
    description: `description item-${random}`,
    price: 2,
    category : 'veg',
    tags: ['spicy']
}
var oid
var user = {id:'tester', auth:'', password:'hel1o'}
var address_kind = 'home'

describe('Tests for Order Managemnent Service', function () {
    it('server info: can be obtained explicitly', function(done){
        request(`${BASE_URL}/info`, { json: true }, (err, res, body) => {
            console.log(body)
            assert.isNull(err)
            assert.equal(body.version, "1.0.0")
            done()
        })
    })   
    
    it('item: can be created', function(done) {
        request.post({
            headers: {'content-type':'application/json'},
            url:`${BASE_URL}/item/`,
            body:JSON.stringify(testItem)
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
            done()
        })
    })
    it('item: catalog is not empty ', function(done) {
        request(`${BASE_URL}/item/catalog`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            assert.isArray(body, 'response body must be array')
            assert.isTrue(body.length > 0)
            done()
        })
    })

    it('database: connetions are pooled ', function(done) {
        for (var i = 0; i < 40; i++) {
            request(`${BASE_URL}/item/catalog`, { json: true }, (err, res, body) => {
            })
        }
        done()
    })
    it('order: created  has id and total ', function(done) {
        const lineitems = [{sku:101, units:1},{sku:102, units:2}]
        options = {
            headers: {'content-type':'application/json'},
            url:`${BASE_URL}/order/?uid=${user.id}`,
            body:JSON.stringify(lineitems)
        }
        request.post(options, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
            const order = JSON.parse(body)
            assert.property(order,"id")
            assert.property(order,'total')
            oid = order.id
            done()
        })
    })
/*
    it('created invoice get payorder from Payment gateway ', function(done) {
        request.post({
            headers: {'content-type':'application/json'},
            url:`${BASE_URL}/invoice/?uid=${uid}&oid=${oid}&address_kind=${address_kind}`,
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
            const order = JSON.parse(body)
            assert.property(order,"id")
            assert.property(order,'amount')
            assert.property(order,'payorder')
            
            done()
        })
    })
*/
    it('user: login', function(done) {
		var basicAuth = `Basic ${Buffer.from(`${user.id}:${user.password}`).toString('base64')}`
        request.post({
            headers:{Authorization: basicAuth},
            url: `${BASE_URL}/user/login`
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const session = JSON.parse(body)
            assert.property(session, 'id')
            assert.property(session, 'user')
            // authticated user
            user.auth = session.id

            const user2 = session.user
            assert.property(user2, 'id')
            assert.equal(user2.id, user.id)


            done()
        })
    })
    
    it('user: relogin', function(done) {
        request.post({
            headers:{'x-auth-token':user.auth},
            url: `${BASE_URL}/user/relogin/?uid=${user}`
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const session = JSON.parse(body)
            assert.property(session, 'id')
            assert.property(session, 'user')
            const user2 = session.user
            assert.property(user2, 'id')
            assert.equal(user2.id, user.id)
            done()
        })
    })

    it('user: login as guest', function(done) {
        request.post({
            url: `${BASE_URL}/user/loginAsGuest`
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const session = JSON.parse(body)
            assert.property(session, 'id')
            assert.property(session, 'user')
            const user2 = session.user
            assert.property(user2, 'id')
            assert.equal(user2.id, 'guest')
            done()
        })
    })

    it('user address: get addresses', function(done){
        request.get({
            url: `${BASE_URL}/user/addresses/?uid=${user.id}`
        }, function (err,res,body) {
            assert.equal(res.statusCode, 200)
            const addresses = JSON.parse(body)
            assert.isArray(addresses)
            const address = addresses[0]
            assert.property(address, 'id')
            done()
        })
    })

    it('user address: get billing address ', function(done){
        request.get({
            url: `${BASE_URL}/user/address/?uid=${user.id}&kind=billing`
        }, function (err,res,body) {
            assert.equal(res.statusCode, 200)
            const address = JSON.parse(body)
            assert.property(address, 'kind')
            assert.equal('billing', address.kind)
            done()
        })
    })

    it('user address: create address ', function(done){
        const address = {kind:'test',line1:'test street',city:'test city',zip:'test zip'}
        request.post({
            url: `${BASE_URL}/user/address?uid=${user.id}`,
            headers: {'content-type':'application/json'},
            body: JSON.stringify(address)
        }, function (err,res,body) {
            assert.equal(res.statusCode, 200)
            const address = JSON.parse(body)
            assert.property(address, 'id')
            done()
        })
    })


    it('validate: correct user name ', function(done) {
        request.post({
            headers: {'content-type':'application/json'},
            url: `${BASE_URL}/validate/user`,
            body: JSON.stringify({value:'correctusername'})
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            done()
        })
    })

    it('validate:  incorrect user name ', function(done) {
        request.post({
            headers: {'content-type':'application/json'},
            url: `${BASE_URL}/validate/user`,
            body: JSON.stringify({value:'incorrect user name'})
        }, function(err,res,body) {
            assert.notEqual(res.statusCode, 200)
            assert.isNotNull(body.message)

            done()
        })
    })
   
})



















