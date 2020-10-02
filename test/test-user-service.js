const request = require('request');
const httpStatus = require('http-status-codes');
var assert = require('chai').assert
var cookieParser = require('cookie-parser')

let random = new Date().getTime()
let port = 8080
let BASE_URL = `http://localhost:${port}/user`

const randomUser = {
        "id": `user${random}`,
        "password": "passw0rd",
        "name": "random test user",
        "phone": "+91 12345678",
        "email": "user@hiraafood.com",
        "roles": ["customer", "packing"],
        "addresses": {
            "home": {
                "kind": "home",
                "line1": "AA 10/7",
                "city": "Deshbandhu Nagar",
                "zip": "70059"
            },
            "billing": {
                "kind": "billing",
                "line1": "AA 10/7",
                "city": "Deshbandhu Nagar",
                "zip": "70059"
            }
        }
    }

function createBasicAuth(user) {
    var basicAuth = `Basic ${Buffer.from(`${user.id}:${user.password}`).toString('base64')}`
    return basicAuth
}

describe('Tests for User Service', function () {

    it('create an user', function (done) {
        const postRequest = {
            url: `${BASE_URL}/`,
            body: JSON.stringify(randomUser),
            headers: { 'content-type': 'application/json' }
        }
        
        request.post(postRequest, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            done()
        })
    })

    it('find user', function(done) {
        request.get(`${BASE_URL}/find/${randomUser.id}`,
        function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            done()
        })
    })
    
    
    it('get user returns user details', function (done) {
        request(`${BASE_URL}/find/${randomUser.id}`, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            let user = JSON.parse(body)
            assert.isNotNull(user)
            assert.property(user, 'phone')
            assert.property(user, 'roles')

            done()
            
        })
    })

    it('exists user returns http status', function (done) {
        request(`${BASE_URL}/exists/${randomUser.id}`, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)

            done()
        })
    })

    it('valid user can login', function (done) {
        var basicAuth = `Basic ${Buffer.from(`${randomUser.id}:${randomUser.password}`).toString('base64')}`
        request.post({
            headers: { Authorization: basicAuth },
            url: `${BASE_URL}/login/${randomUser.id}/role/customer`
        }, function (err, res, body) {
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const user2 = JSON.parse(body)
            assert.equal(user2.id, randomUser.id)
            assert.property(user2, 'email')

            const cookies = res.headers['set-cookie']
            assert.isFalse(cookies.length == 0)
            assert.isArray(cookies)

            var parsedCookies = cookieParser.JSONCookies(cookies)
            assert.isNotNull(parsedCookies['hiraafood'])

            done()
        })
    })



    it('guest user can login', function (done) {
        request.post({
            url: `${BASE_URL}/login/guest/role/customer`
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
            url: `${BASE_URL}/addresses/${randomUser.id}`
        }, function (err, res, body) {
            assert.equal(res.statusCode, 200)
            const addresses = JSON.parse(body)
            assert.isArray(addresses)
            const address = addresses[0]
            assert.property(address, 'id')
            done()
        })
    })

    it('customer must have a billing address ', function (done) {
        request.get({
            url: `${BASE_URL}/address-by-kind/billing/${randomUser.id}/`
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
        //this.timeout(000)
        const address = { kind: 'test', line1: 'test street', city: 'test city', zip: 'test zip' }
        request.post({
            url: `${BASE_URL}/address/${randomUser.id}`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(address)
        }, function (err, res, body) {
            assert.equal(res.statusCode, 200)
            const address = JSON.parse(body)
            assert.property(address, 'id')

            done()
        })
    })

    it('non-existent user can not login', function (done) {
        const unknown_user = { id: 'who', password: 'somepassw0rd' }
        request.post({
            headers: { Authorization: createBasicAuth(unknown_user) },
            url: `${BASE_URL}/login/${unknown_user.id}`
        }, function (err, res, body) {
            assert.isNull(err)
            assert.notEqual(res.statusCode, httpStatus.OK)

            done()
        })
    })

    it('existing user with wrong password can not login', function (done) {
        const user_with_wrong_password = { id: randomUser.id, password: 'anything' }
        request.post({
            headers: { Authorization: createBasicAuth(user_with_wrong_password) },
            url: `${BASE_URL}/login/${user_with_wrong_password}`
        }, function (err, res, body) {
            assert.isNull(err)
            assert.notEqual(res.statusCode, httpStatus.OK)
            done()
        })
    })


    it('can not create user without password', function (done) {
        const userDetails = { id: 'user-without-password' }
        request.post({
            url: `${BASE_URL}/`,
            body: JSON.stringify(userDetails),
            headers: { 'content-type': 'application/json' }
        },
            function (err, res, body) {
                assert.notEqual(res.statusCode, 200)
                const result = JSON.parse(body)
                assert.property(result, 'message')
                assert.isTrue(result.message.includes('password'), `error message:${result.message} `)
                done()
            })
    }
    )

    it('can not create user without role', function (done) {
        const userDetails = { id: 'user-without-role' }
        request.post({
            url: `${BASE_URL}/`,
            body: JSON.stringify(userDetails),
            headers: { 'content-type': 'application/json' }
        },
            function (err, res, body) {
                assert.notEqual(res.statusCode, 200)
                const result = JSON.parse(body)
                assert.property(result, 'message')
                assert.isTrue(result.message.includes('role'), `error message:${result.message} `)

                done()
            })
    }
    )

    it('can not create user in customer role without billing address', function (done) {
        const userDetails = {
            id: 'wrong-customer', roles: ['customer'],
            addresses: { home: {} }
        }
        request.post({
            url: `${BASE_URL}/`,
            body: JSON.stringify(userDetails),
            headers: { 'content-type': 'application/json' }
        },
            function (err, res, body) {
                assert.notEqual(res.statusCode, 200)
                const result = JSON.parse(body)
                assert.property(result, 'message')
                //assert.isTrue(result.message.includes('billing'), `error message:${result.message} `)
                done()
            })
    }
    )

})



















