'use strict'

module.exports = Sailbot


/*
 * Module dependencies
 */
let R = require('ramda')
let Webdriver = require('selenium-webdriver')
let By = Webdriver.By
let Until = Webdriver.until
let Init = require('./lib/launch')


/**
 * Namespace Object composed
 * @param  {object} [ options = {timeout: '30', port: 7055} ]
 *         Pass a property 'dev' to launch and keep session/browser opened
 *         Pass a property 'id': {string} session id, to attach to session
 * @returns {object} sailbot
 */
function Sailbot (options) {

    let webdriver = init(options)

    let proto = {
        driver: webdriver.driver,
        flow: webdriver.flow,
        elem: 'initial',  // current selected element
        to,
        switchTo,
        waitFor,
        isFound,
        isVisible,
        get: get,
        getAll,
        click,
        clear,
        write,
        innerHtml,
        text,
        attribute,
        alert,
        sleep,
        quit }

    return Object.create(proto)
}


function init (opt) {
    let driver
    let flow = 'Running in Dev Mode (one browser supported)'
    if ( opt && opt.hasOwnProperty('dev') ) {
        Init.dev_launch(opt)
    }
    else if ( opt && opt.hasOwnProperty('id') ) {
        driver = Init.dev_attach(opt)
    }
    else {
        let newBrowser = Init.launch(opt)
        driver = newBrowser.driver
        flow = newBrowser.flow
    }
    let webdriver = { driver, flow }
    return webdriver
}



/**
 * Methods
 */


/**
 * @param {string} url
 * @returns {sailbot}
 */
function to (url) {
    this.driver.get(url)
    return this
}


/**
 * Switches to all of the frames in order passed in the array
 * @param {array} [frame] - iframe's DOM node path -name or id.
 * Pass any string to switch to defaultContent()
 * @returns {sailbot}
 */
function switchTo (frame) {
    let switchTo = this.driver.switchTo()
    switchTo.defaultContent()
    let switchFrame = (frame) => switchTo.frame(frame)
    if (typeof frame !== 'string') R.map(switchFrame, frame)
    return this
}


/**
* @param {string} cssSelector
* @returns {sailbot} chain with with isFound() or isVisible()
*/
function waitFor (cssSelector) {
    this._locator = By.css(cssSelector)
    this._webElem = this.driver.findElement(this._locator)
    return this
}


/**
* @returns {sailbot}
*/
function isFound () {
    this.driver.wait(Until.elementsLocated(this._locator))
    return this
}


/**
* @returns {sailbot}
*/
function isVisible () {
    this.driver.wait(Until.elementIsVisible(this._webElem))
    return this
}


/**
* @param {string} cssSelector
* @returns {sailbot}
*/
function get (cssSelector, visibility) {
    _load(this, cssSelector, visibility)
    this.whatGet = 'get'
    return this
}


/**
* @param {string} cssSelector
* @returns {sailbot}
*/
function getAll (cssSelector, visibility) {
    _load(this, cssSelector, visibility)
    this.whatGet = 'getAll'
    return this
}


/**
* @param {Any} [returnPromise] pass any value to return a promise
* @returns {sailbot | promise} promise if a param is passed
*/
function click (returnPromise) {
    let promise = this._webElem.click()
    if (returnPromise) return promise
    return this
}


/**
* @returns {sailbot}
*/
function clear () {
    this._webElem.clear()
    return this
}


/**
* @param {string} text
* @returns {sailbot}
*/
function write (text) {
    this._webElem.sendKeys(text)
    return this
}


/**
* @returns {promise} value (when get() used) or array of values (getAll())
*/
function text () {
    let fn = () => (elem) => elem.getText()
    return _execAction(this, fn)
}


/**
* @returns {promise} value (when get() used) or array of values (getAll())
*/
function innerHtml () {
    let fn = () => (elem) => elem.getInnerHtml()
    return _execAction(this, fn)
}


/**
* @param {string} attribute name
* @returns {promise} value (when get() used) or array of values (getAll())
*/
function attribute (attrName) {
    let fn = (attrName) => (elem) => elem.getAttribute(attrName)
    return _execAction(this, fn, attrName)
}


/**
* @returns {sailbot} chainable with webdriver native functions. EG:
* alert()( .accept() | .dismiss() | .getText() | .cancel(arg0)...)
*/
function alert () {
    this.driver.wait(Until.alertIsPresent(), 1000, 'WHAT')
    return this.driver.switchTo().alert()
}


/**
* @param {number} ms
* @returns {sailbot}
*/
function sleep (ms) {
    this.driver.sleep(ms)
    return this
}


/**
* @returns {sailbot}
*/
function quit () {
    this.driver.quit()
    return this
}



/*
 * Internal functions
 */

// run correspondent getAll or get
function _execAction (self, action, actionParam) {
    if (self.whatGet === 'getAll') {
        let actionFn = action(actionParam)
        return Webdriver.promise.map(self._webElemsArr, actionFn)
    }
    else return action(actionParam)(self._webElem)
}

function _load (self, cssSelector, visibility) {
    let locator = self._locator = By.css(cssSelector)
    self._webElem = self.driver.findElement(locator)
    self._webElemsArr = self.driver.findElements(locator)
    self.isFound() // checks first if element is in the page
    if (!visibility) self.isVisible() // then if it is visible
}
