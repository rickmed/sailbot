'use strict'

module.exports = {
    launch,
    dev_launch,
    dev_attach
}


/*
 * Module dependencies
 */
let Webdriver = require('selenium-webdriver')
let Chromedriver = require('chromedriver')

let Chrome = require('selenium-webdriver/chrome')
let Executor = require('selenium-webdriver/executors')

let Path = require('path')

const CONFIG = require('./config')
const SESSION = CONFIG.session
const URL = SESSION.url
const PORT = SESSION.port
const CHROME = CONFIG.chrome_capabilities


/*
 * State
 */
let serverRunning = false  // webdriver error if run +1 chromedriver instances


/*
 * Functions
 */

/*
 * attaches to the dev_launch session to run scripts
 * @returns {object} driver: a new webdriver instance browser
 */
function launch (opt) {

    if (serverRunning === false) {
        _chromedriverInit(opt)
        serverRunning = true
    }

    let flow = new Webdriver.promise.ControlFlow()

    let driver = new Webdriver.Builder()
        .withCapabilities(CHROME)
        .setControlFlow(flow)
        .build()

    let timeout = opt.timeout ? (opt.timeout * 1000) : SESSION.timeout
    _setTimeouts(driver, timeout)

    return { driver, flow }
}


/**
 * attaches to the dev_launch session to run scripts
 * @returns {object} driver: a new webdriver instance browser
 */
function dev_attach (opt) {

    let sessionId = opt.id
    let url = opt.port ? URL + opt.port : URL + PORT

    let executor = Executor.createExecutor(url)
    let driver = Webdriver.WebDriver.attachToSession(executor, sessionId)
    return driver
}


/**
 * launches a chromedriver browser session that does not closes
 * @returns {undefined}
 */
function dev_launch (opt) {
    let driver = _dev_init(opt)
    driver.getSession().then( x => console.log(x.id_))
    setInterval(() => {}, 10000 * 1000) // prevents nodejs to end process
}


// creates a custom chromedriver service to attach sessions
// @returns {Promise.<webdriver.Session>} sessionId to attach to
function _dev_init (opt) {

    let timeout = opt.timeout ? (opt.timeout * 1000) : SESSION.timeout
    let url = opt.port ? URL + opt.port : URL + PORT

    _chromedriverInit(opt)
    let executor = Executor.createExecutor(url)
    let driver = Webdriver.WebDriver.createSession(executor, CHROME)

    _setTimeouts(driver, timeout)
    return driver
}


function _chromedriverInit (opt) {

    let port = opt.port ? opt.port : PORT

    let driverPath = Path.normalize(Chromedriver.path)
    let service = new Chrome.ServiceBuilder(driverPath)
        .usingPort(port)
        .build()
    Chrome.setDefaultService(service)
    service.start()
}


function _setTimeouts (driver, timeout) {
    let timeouts = new Webdriver.WebDriver.Timeouts(driver)
    timeouts.pageLoadTimeout(timeout)
    timeouts.setScriptTimeout(timeout)
    timeouts.implicitlyWait(timeout)
}
