const request = require('request');
const { response } = require('express');
var assert  = require('chai').assert

let random = new Date().getTime()
let port = 10000
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
    let BASE_URL = `http://localhost:${port}`
    
    it('server info is obtained by deafult', function(done){
        request(`${BASE_URL}/`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            assert.equal(body.version, "1.0.0", `wrong version ${body.vesrion}`)

            done()
        })
    }) 
    
    it('server info can be obtained explicitly', function(done){
        request(`${BASE_URL}/info`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            assert.equal(body.version, "1.0.0", `wrong version ${body.vesrion}`)

            done()
        })
    })   
    
    it('item can be created', function(done) {
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
    it('item catalog is not empty ', function(done) {
        request(`${BASE_URL}/item/catalog`, { json: true }, (err, res, body) => {
            assert.isNull(err)
            assert.isArray(body, 'response body must be array')
            assert.isTrue(body.length > 0)
            done()
        })
    })

    it('database connetion are pooled ', function(done) {
        for (var i = 0; i < 40; i++) {
            request(`${BASE_URL}/item/catalog`, { json: true }, (err, res, body) => {
            })
        }
        done()
    })
    it('created order has id total ', function(done) {
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
    it('login', function(done) {
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
    
    it('relogin', function(done) {
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

    it('login as guest', function(done) {
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

    it('validate correct user name ', function(done) {
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

    it('invalidate  user name ', function(done) {
        request.post({
            headers: {'content-type':'application/json'},
            url: `${BASE_URL}/validate/user`,
            body: JSON.stringify({value:'incorrect user name'})
        }, function(err,res,body) {
            console.log(`response status: ${res.statusCode}`)
            console.log(body)
            assert.notEqual(res.statusCode, 200)
            assert.equal(err.message, 'user name invalid because space')
            done()
        })
    })
   
})



















