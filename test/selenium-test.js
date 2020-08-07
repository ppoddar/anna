// -----------------------------------------------------
// test runs against either local or remote service.
// remote test runs via BrowserTask
// -----------------------------------------------------
const {Builder, By, Key, until} = require('selenium-webdriver');
const assert = require('chai').assert

var BROWSER_NAME    = 'chrome'
var BROWSER_VERSION = '81'
var OS = 'OS X'
var OS_VERSION = 'Catalina'

var BASE_URL = 'http://localhost:8080/login.html'
var options = {}
for (var i = 2; i < process.argv.length-1; i+=2) {
    const option = process.argv[i]
    options[option] = process.argv[i+1]
}

if ('-u' in options) BASE_URL = options['-u']

var driver
var capabilities = {
    'os': OS,
    'os_version': OS_VERSION,
    'browserName': BROWSER_NAME,
    'browser_version': BROWSER_VERSION,
    'name': `Selenium Test against ${BASE_URL}`
}
var remote = '-r' in options
if (remote) {
    var USERNAME = "pinakipoddar1";
    var AUTOMATE_KEY = "TDnrAkcEw7a3eDicBzgd";
    var browserstackURL = 'https://' + USERNAME + ':' + AUTOMATE_KEY + '@hub-cloud.browserstack.com/wd/hub';
    driver = new Builder()
        .usingServer(browserstackURL).
        withCapabilities(capabilities).
        build();
} else {
    driver = new Builder()
        .forBrowser(BROWSER_NAME)
        .withCapabilities(capabilities)
        .build();
}

console.log(`testing against ${BASE_URL}`)

describe('selenium test', function () {
    it('front page should show an enter button',  async function (done) {
        await driver.get(`${BASE_URL}`)
        let title = await driver.getTitle()
        console.log(`driver title ${tile}`)
        done()

    })

    after(function(){
        console.log('quiting the driver....')
        driver.quit()
    });

})

