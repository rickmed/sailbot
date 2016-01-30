'use strict'

module.exports = {
    launch,
    dev_launch,
    dev_attach
}


/**
 * Module dependencies
 */
let Webdriver = require('selenium-webdriver')
let Chromedriver = require('chromedriver')

let Chrome = require('selenium-webdriver/chrome')
let Executor = require('selenium-webdriver/executors')

let Path = require('path')

const CONFIG = require('./config')
const SESSION = CONFIG.session
const URL = SESSION.url + SESSION.port
const CHROME = CONFIG.chrome_capabilities
const FIREFOX = CONFIG.firefox_capabilities


/*
 * State
 */
let serverRunning = false  // webdriver error if run +1 chromedriver instances


/**
 * Namespace methods
 */

/**
 * attaches to the dev_launch session to run scripts
 * @returns {object} driver: a new webdriver instance browser
 */
function launch (browser) {

    if (serverRunning === false) {
        _chromedriverInit()
        serverRunning = true
    }

    let flow = new Webdriver.promise.ControlFlow()

    if (browser) browser = FIREFOX
    else browser = CHROME

    let driver = new Webdriver.Builder()
        .withCapabilities(browser)
        .setControlFlow(flow)
        .build()

    _setTimeouts(driver)

    return { driver, flow }
}


/**
 * attaches to the dev_launch session to run scripts
 * @returns {object} driver: a new webdriver instance browser
 */
function dev_attach (options) {
    let sessionId = options.id
    let executor = Executor.createExecutor(URL)
    let driver = Webdriver.WebDriver.attachToSession(executor, sessionId)
    return driver
}


/**
 * launches a chromedriver browser session that does not closes
 * @returns {undefined}
 */
function dev_launch () {
    let driver = _dev_init()
    driver.getSession().then( x => console.log(x.id_))
    setInterval(() => {}, 10000 * 1000) // prevents nodejs to end process
}


// creates a custom chromedriver service to attach sessions
// @returns {Promise.<webdriver.Session>} sessionId to attach to
function _dev_init () {

    _chromedriverInit()
    let executor = Executor.createExecutor(URL)
    let driver = Webdriver.WebDriver.createSession(executor, CHROME)

    _setTimeouts(driver, SESSION.timeout)
    return driver
}


function _chromedriverInit () {
    let driverPath = Path.normalize(Chromedriver.path)
    let service = new Chrome.ServiceBuilder(driverPath)
        .usingPort(SESSION.port)
        .build()
    Chrome.setDefaultService(service)
    service.start()
}


function _setTimeouts (driver) {
    let timeouts = new Webdriver.WebDriver.Timeouts(driver)
    timeouts.pageLoadTimeout(SESSION.timeout)
    timeouts.setScriptTimeout(SESSION.timeout)
    timeouts.implicitlyWait(SESSION.timeout)
}
