var assert  = require('chai').assert
var map_error = require('../src/errors').map_error
describe('simple tests', function(done) {
    it('string template substitution', function(done){
        const vars = ['piku']
        const id = 'E1000'
        var msg = map_error(id, vars)
        assert.equal('hello piku', msg)
        done()
    })
}) 

