
// -----------------------------------------------------
// test runs against either local or remote service.
// remote test runs via BrowserTask
// -----------------------------------------------------
var assert = require('chai').assert

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
const cmd = new (require('../src/commandLine'))()

var LOCAL_RUN = !cmd.isPresent('--remote')
var BASE_URL = (LOCAL_RUN ? 'http://localhost:8080/' : 'https://hiraafood.com/') + 'login.html'
var BROWSER_NAME = 'chrome'
var BROWSER_VERSION = '81'
var OS = 'OS X'
var OS_VERSION = 'Catalina'

var driver
var capabilities = {
    'os': OS,
    'os_version': OS_VERSION,
    'browserName': BROWSER_NAME,
    'browser_version': BROWSER_VERSION,
    'name': `Selenium Test against ${BASE_URL}`
}

if (cmd.isPresent('--remote')) {
    var USERNAME = "pinakipoddar1";
    var AUTOMATE_KEY = "TDnrAkcEw7a3eDicBzgd";
    var browserstackURL = 'https://' + USERNAME + ':' + AUTOMATE_KEY + '@hub-cloud.browserstack.com/wd/hub';
    driver = new webdriver.Builder()
        .usingServer(browserstackURL).
        withCapabilities(capabilities).
        build();
} else {
    driver = new webdriver.Builder()
        .forBrowser(BROWSER_NAME)
        .withCapabilities(capabilities)
        .build();
}

describe('selenium test', function (done) {
    it('front page should show an enter button', async function () {
        console.log(`================> ${BASE_URL}`)
        await driver.get(BASE_URL)
        const title = await driver.getTitle()
        assert.equal(title, 'Hiraafood')
        done()
    })

    after(function(){
        console.log('quiting the driver....')
        driver.quit()
    });

})

