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

describe('Tests for Service state', function () {

    it('menu items exists', function(done){
        request(`${BASE_URL}/item/catalog`, function(err,res,body){
            let items = JSON.parse(body)
            assert.isArray(items)
            assert.isTrue(items.length > 0)
            done()
        })
    })

    it('admin/tester/guest users exists', function(done){
        let known_users = ['tester','guest']
        for (var i = 0; i < known_users.length; i++) {
            request(`${BASE_URL}/user/find/${known_users[i]}`, function(err,res,body){
                assert.equal(res.statusCode, 200)
            })
        }
        done()

    })





   
})



















