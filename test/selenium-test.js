// -----------------------------------------------------
// mocha tests run against a local service.
// remote test runs via BrowserTask
// usage:
//   mocha {this file location} [-u http://localhost:8080] --remote  
// -----------------------------------------------------

const {Builder, By, Key, until,Capabilities,NoSuchElementError,StaleElementReferenceException} = require('selenium-webdriver');
const assert = require('chai').assert

var BROWSER_NAME    = 'chrome'
var BROWSER_VERSION = '81'
var OS = 'OS X'
var OS_VERSION = 'Catalina'

//var BASE_URL = 'http://localhost:8080/login.html'
var BASE_URL = 'http://localhost:8080'
var options = {}
for (var i = 2; i < process.argv.length-1; i+=2) {
    const option = process.argv[i]
    options[option] = process.argv[i+1]
}

if ('-u' in options) BASE_URL = options['-u']

var driver
var capabilities = new Capabilities({
    'os': OS,
    'os_version': OS_VERSION,
    'browserName': BROWSER_NAME,
    'browser_version': BROWSER_VERSION,
    'name': `Selenium Test against ${BASE_URL}`
})
capabilities.setPageLoadStrategy("normal");

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
//driver.manage().setTimeouts(1000)

console.log(`testing against ${BASE_URL}`)


describe('selenium test', function () {
    beforeEach(async function(){
        this.timeout(10*1000)
        console.log(`current page:${await driver.getCurrentUrl()}`)
    })
/*
    it('test front page', async function() {
        this.timeout(10000)
        await driver.get('http://localhost:8080')
        const handles = await driver.getAllWindowHandles()
        console.log(`window handles ${handles.length} handles ${handles}`)
        const h = await driver.getWindowHandle()
        driver.switchTo().frame(0)
        return
    }) 
*/
    it('enter application',  async function () {
        this.timeout(100000)
        await driver.get(`${BASE_URL}/login.html`)
        await driver.findElement(By.id('enter')).click()
        return
    })

    it('login to application',  async function () {
        this.timeout(10000)
        await driver.switchTo().activeElement()
        const username = await driver.findElement(By.id('username'))
        const password = await driver.findElement(By.id('password'))
        await username.click()
        await username.sendKeys('tester')
        await password.click()
        await password.sendKeys('hel1o')

        await driver.findElement(By.id('login')).click()

        return
    })

    it('menu page', async function() {
        this.timeout(10*1000)
        driver.wait(until.urlIs(`${BASE_URL}/html/customer/menu.html`))
        const sku = '101'
        const order_button_id = `order-${sku}`
        console.log(`looking for button [${order_button_id}] and click it`)
        await driver.findElement(By.id(order_button_id)).click()
        const order_item_button_id = `order-item-${sku}`
        console.log(`looking for button [${order_item_button_id}] and click it`)
        await driver.wait(until.elementLocated(By.id(order_item_button_id)))
        console.log(`after clicking order button page ${await driver.getCurrentUrl()}`)
        await driver.findElement(By.id(order_item_button_id)).click()

        await driver.findElement(By.id('checkout')).click()
        return

    })     
    
    it('checkout shows a bill', async function () {
        this.timeout(20*1000)

        await driver.wait(until.urlIs(`${BASE_URL}/html/customer/bill.html`))
        await driver.findElement(By.id('next')).click()
        return
    })

    it('delivery page', async function(){
        this.timeout(10*1000)
        await driver.wait(until.urlIs(`${BASE_URL}/html/customer/delivery.html`))
        await driver.findElement(By.id('next')).click()

        return
    })

    it('payment page', async function(){
        this.timeout(10*1000)

        await driver.wait(until.urlIs(`${BASE_URL}/html/customer/payment.html`))
        await driver.findElement(By.id('pay')).click()
        return
    })

    
    after(function(){
        //driver.quit()
    })
})


