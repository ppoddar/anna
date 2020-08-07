const {Builder, By, Key, until} = require('selenium-webdriver');
const assert = require('chai').assert
var BROWSER_NAME    = 'chrome'
var BROWSER_VERSION = '81'
var OS = 'OS X'
var OS_VERSION = 'Catalina'
var capabilities = {
    'os': OS,
    'os_version': OS_VERSION,
    'browserName': BROWSER_NAME,
    'browser_version': BROWSER_VERSION,
    'name': `webdriver Test`
}
var driver = new Builder()
        .forBrowser(BROWSER_NAME)
        .withCapabilities(capabilities)
        .build();

assert.isNotNull(driver)
const BASE_URL = 'http://localhost:8080/login.html'
try {
    driver.get(`${BASE_URL}`).catch((e)=>{})
} catch(e) {
    console.error(e)
}

driver.quit()