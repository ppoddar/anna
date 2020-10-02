const { CommandLine } = require('../src/command-line')
const path = require('path')

var assert = require('chai').assert
var expect = require('chai').expect


describe('Tests Commad Line', function () {
    it("parse simple name value", function(done){
        const cli = new CommandLine(['-o', 'v'])
        assert.isTrue(cli.isPresent('-o'))
        assert.equal(cli.getCommandLineOption('-o'), 'v')
        done()
    })

    it("parse simple name without value", function(done){
        const cli = new CommandLine(['--p1', 'v1', '--p2'])
        assert.isTrue(cli.isPresent('--p1'))
        assert.isTrue(cli.isPresent('--p2'))
        assert.equal(cli.getCommandLineOption('--p1'), 'v1')
        done()
    })

    it("configuration file is resolved relative to given base directory", function(done){
        const base = path.join(__dirname, 'data')
        const cli = new CommandLine(['-c', 'test-config.yml'], base)
        const config = cli.getConfig('-c')
        assert.isNotNull(config)

        assert.equal(config.get('p1'), 'v1')
        assert.equal(config.get('p2'), 'v2')


        done()
    })

    it('wrong base directory throws error with full path', function(done){
        const base = 'wrong base directory'
        const badCli = ()=>{new CommandLine([], base)}
        expect(badCli).to.throw(`${base} does not exist`)
        done()
    })
    
})

