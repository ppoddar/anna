const request    = require('request');
const httpStatus = require('http-status-codes');
var assert       = require('chai').assert

let port = 8080
let BASE_URL = `http://localhost:${port}`


describe('Tests for Data Validation', function () {
    it('validate: valid user name ', function (done) {
        const validUsername = 'validuser'
        request.post({
            url: `${BASE_URL}/validate/username`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({username:validUsername})
        }, function(err,res,body){
            const result = JSON.parse(body)
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            assert.isTrue(result.valid)
            done()
        })
       
    })

    it('validate:  invalid user name ', function (done) {
        const invalidUsername = 'invalid user'
        request.post({
            url: `${BASE_URL}/validate/username`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({username:invalidUsername})
        }, function(err,res,body){
            const result = JSON.parse(body)

            assert.isNull(err)
            assert.notEqual(res.statusCode, 200)
            assert.isFalse(result.valid)
            assert.isFalse(result.valid)
            const pattern = 'not allowed'
            assert.isTrue(result.reason.includes(pattern), 
                `reason [${result.reason}] does not contain [${pattern}]`)
            done()
        })
    })

    it('validate: valid password', function (done) {
        const validPassword = 'pa$sW0rd'
        request.post({
            url: `${BASE_URL}/validate/password`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({password:validPassword})
        }, function(err,res,body){
            assert.isNull(err)
            assert.equal(res.statusCode, 200)
            const result = JSON.parse(body)
            assert.isTrue(result.valid)
            done()
        })
    })

    it('validate: invalid password', function (done) {
        const invalidPassword = 'pwd'
        request.post({
            url: `${BASE_URL}/validate/password`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({password:invalidPassword})
        }, function(err,res,body){
            assert.isNull(err)
            assert.notEqual(res.statusCode, 200)
            const result = JSON.parse(body)
            assert.isFalse(result.valid)
            done()
        })
    })

    it('validate: existing user name', function (done) {
        const existingUsername = 'tester'
        request(`${BASE_URL}/user/${existingUsername}/exists`,
          function(err,res,body){
                assert.isNull(err)
                assert.equal(res.statusCode, 200)
                done()
        })
    })

    it('validate: non-existing user name', function (done) {
        const nonexistingUsername = 'some-noexistent-user'
        request(`${BASE_URL}/user/${nonexistingUsername}/exists`,
          function(err,res,body){
                assert.isNull(err)
                assert.equal(res.statusCode, 404)
                done()
        })
    })

})



















