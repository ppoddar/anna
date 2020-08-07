const request    = require('request');
const httpStatus = require('http-status-codes');
var assert       = require('chai').assert
var cookieParser = require('cookie-parser')


let random = new Date().getTime()
let port = 8080
let BASE_URL = `http://localhost:${port}`

var user = { id: 'tester', auth: '', password: 'hel1o' }

function createBasicAuth(user) {
    var basicAuth = `Basic ${Buffer.from(`${user.id}:${user.password}`).toString('base64')}`
    return basicAuth
}

describe('Tests for User Service', function () {
    it('get user returns user details', function (done){
        request(`${BASE_URL}/user/${user.id}`, function(err,res,body){
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            let user = JSON.parse(body)
            assert.property(user, 'phone')
            done()
        })
    })
    it('exists user returns http status', function (done){
        request(`${BASE_URL}/user/${user.id}/exists`, function(err,res,body){
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            done()
        })
    })

    it('valid user can login', function (done) {
        var basicAuth = `Basic ${Buffer.from(`${user.id}:${user.password}`).toString('base64')}`
        request.post({
            headers: { Authorization: basicAuth },
            url: `${BASE_URL}/user/${user.id}/login`
        }, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const user2 = JSON.parse(body)
            assert.equal(user2.id, user.id)
            assert.property(user2, 'email')

            const cookies = res.headers['set-cookie']
            assert.isFalse(cookies.length == 0)
            assert.isArray(cookies)

            var parsedCookies = cookieParser.JSONCookies(cookies)
            assert.isNotNull(parsedCookies['hiraafood'])

            done()

        })
    })

    it('user:session exists after login', function(done){
        request(`${BASE_URL}/`, function (err,res,body) {
            assert.equal(res.statusCode, httpStatus.OK)
            done()
        })
    }) 
    
    it('guest user can login', function (done) {
        request.post({
            url: `${BASE_URL}/user/guest/login`
        }, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const user2 = JSON.parse(body)
            assert.equal(user2.id, 'guest')
            const cookies = res.headers['set-cookie']
            assert.isArray(cookies)

            done()
        })
    })

    it('get user addresses in an array', function (done) {
        request.get({
            url: `${BASE_URL}/user/${user.id}/addresses`
        }, function (err, res, body) {
            assert.equal(res.statusCode, 200)
            const addresses = JSON.parse(body)
            assert.isArray(addresses)
            const address = addresses[0]
            assert.property(address, 'id')
            done()
        })
    })

    it('every customer must have a billing address ', function (done) {
        request.get({
            url: `${BASE_URL}/user/${user.id}/address-by-kind/billing`
        }, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const address = JSON.parse(body)
            assert.property(address, 'kind')
            assert.equal('billing', address.kind)
            done()
        })
    })

    it('create user address', function (done) {
        const address = { kind: 'test', line1: 'test street', city: 'test city', zip: 'test zip' }
        request.post({
            url: `${BASE_URL}/user/${user.id}/address`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(address)
        }, function (err, res, body) {
            assert.equal(res.statusCode, 200)
            const address = JSON.parse(body)
            assert.property(address, 'id')
            done()
        })
    })

    it('non-existent user can not login', function(done) {
        const unknown_user = {id:'who', password:user.password}
        request.post({
            headers:{Authorization: createBasicAuth(unknown_user)},
            url: `${BASE_URL}/user/${unknown_user.id}/login`
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, httpStatus.NOT_FOUND)
            done()
        })
    })

    it('existing user with wrong password can not login', function(done) {
        const user_with_wrong_password = {id:user.id, password:'anything'}
        request.post({
            headers:{Authorization: createBasicAuth(user_with_wrong_password)},
            url: `${BASE_URL}/user/${user_with_wrong_password}/login`
        }, function(err,res,body) {
            assert.isNull(err)
            assert.equal(res.statusCode, httpStatus.FORBIDDEN)
            done()
        })
    })

    it('cookie is present after valid login', function (done) {
        var basicAuth = `Basic ${Buffer.from(`${user.id}:${user.password}`).toString('base64')}`
        request.post({
            headers: { Authorization: basicAuth },
            url: `${BASE_URL}/user/${user.id}/login`
        }, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const user2 = JSON.parse(body)
            assert.equal(user2.id, user.id)
            assert.property(user2, 'email')

            const cookies = res.headers['set-cookie']
            assert.isFalse(cookies.length == 0)
            assert.isArray(cookies)

            done()

        })
    })
    

})



















