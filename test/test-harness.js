const request    = require('request');
var assert       = require('chai').assert

let random = new Date().getTime()

let port = 8080
let BASE_URL = `http://localhost:${port}`

var testUser = { id: 'tester', auth: '', password: 'hel1o' }

let testItem = {
    sku: `${random}`,
    name: `test item-${random}`,
    description: `description item-${random}`,
    price: 2,
    category: 'veg',
    tags: ['spicy']
}
before( async () => {
    console.log(`create a test user`)
    await request.post({
        headers: { 'content-type': 'application/json' },
        url: `${BASE_URL}/user/`,
        body: JSON.stringify(testUser)
    }, function (err, res, body) {
        assert.isNull(err)
        assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
        console.log(`created a test user`)

    })
    console.log(`create a test item`)
    await request.post({
        headers: { 'content-type': 'application/json' },
        url: `${BASE_URL}/item/`,
        body: JSON.stringify(testItem)
    }, function (err, res, body) {
        assert.isNull(err)
        assert.equal(res.statusCode, 200, `status ${res.statusCode}, expeceted 200`)
        console.log(`created a test item`)

    })


})
