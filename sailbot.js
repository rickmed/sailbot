'use strict'

module.exports = Sailbot


/**
 * Module dependencies
 */
let R = require('ramda')
let Webdriver = require('selenium-webdriver')

let By = Webdriver.By
let Until = Webdriver.until

let EventEmitter = require('events')

let Init = require('./lib/browser_init')


/**
 * Namespace Object composed
 * @param  {undefined}: launch using chrome
 *         {string} 'dev': launch and keep session/browser opened
 *         {object} property "id" {string}: attach to a session
 * @returns a FlexNav object with the methods below
 */
function Sailbot (options) {

    let webdriver = init(options)
    if ( webdriver.driver !== undefined ) {
        this.driver = webdriver.driver
        this.flow = webdriver.flow
    }

    let events = new EventEmitter()
    this.on = events.on
    this.emit = events.emit
    this.webdriver = Webdriver.promise.controlFlow()

    this.elem = 'initial' // current selected element

    let proto = [ to,
                switchTo,
                waitFor,
                isFound,
                isVisible,
                get,
                getAll,
                click,
                clear,
                write,
                innerHtml,
                text,
                attribute,
                alert,
                sleep,
                quit ]

    proto.forEach( fn => Sailbot.prototype[fn.name] = fn )
}


function init (options) {
    let driver
    let flow = 'Running in Dev Mode (one browser supported)'
    if (options === 'dev') {
        Init.dev_launch()
    }
    else if (typeof options === 'object') {
        driver = Init.dev_attach(options)
    }
    else {
        let newBrowser = Init.launch(options)
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
 * @param {string} cssSelector
 * @returns {browser} chainable method
 */
function to (url) {
    this.driver.get(url)
    return this
}


/**
 * Switches to all of the frames in order passed in the array
 * @param {array} [frame] - iframe's DOM node path in css name or id.
 * Pass any string to switch to defaultContent()
 * @returns {browser} chainable method
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
* @returns {browser} chainable method with isFound() and isVisible()
*/
function waitFor (cssSelector) {
    this._locator = By.css(cssSelector)
    this._webElem = this.driver.findElement(this._locator)
    return this
}


/**
* @returns {browser} chainable method
*/
function isFound () {
    this.driver.wait(Until.elementsLocated(this._locator))
    return this
}


/**
* @returns {browser} chainable method
*/
function isVisible () {
    this.driver.wait(Until.elementIsVisible(this._webElem))
    return this
}


/**
* @param {string} cssSelector
* @returns {browser} chainable method
*/
function get (cssSelector, visibility) {
    _load(this, cssSelector, visibility)
    this.whatGet = 'get'
    return this
}


/**
* @param {string} cssSelector
* @returns {browser} chainable method.
*/
function getAll (cssSelector, visibility) {
    _load(this, cssSelector, visibility)
    this.whatGet = 'getAll'
    return this
}


/**
* @param {Any} [returnPromise] pass any value to return a promise
* @returns {browser | promise } (chaibable method) | (not chainable method)
*/
function click (returnPromise) {
    let promise = this._webElem.click()
    if (returnPromise) return promise
    return this
}


/**
* @param {string} cssSelector
* @returns {browser} chainable method
*/
function clear () {
    this._webElem.clear()
    return this
}


/**
* @param {string} cssSelector
* @returns {browser} chainable method
*/
function write (param) {
    this._webElem.sendKeys(param)
    return this
}


/**
* @returns {promise} value or array of values. Non chainable method
*/
function text () {
    let fn = () => (elem) => elem.getText()
    return _execAction(this, fn)
}


/**
* @returns {promise} value or array of values. Non chainable method
*/
function innerHtml () {
    let fn = () => (elem) => elem.getInnerHtml()
    return _execAction(this, fn)
}


/**
* @param {string} attribute name
* @returns {promise} value or array of values. Non chainable method
*/
function attribute (attrName) {
    let fn = (attrName) => (elem) => elem.getAttribute(attrName)
    return _execAction(this, fn, attrName)
}


/**
* @returns {browser} chainable with webdriver native functions. EG:
* alert()(.accept() | .dismiss() | .getText() | .cancel(arg0)...)
*/
function alert () {
    this.driver.wait(Until.alertIsPresent(), 1000, 'WHAT')
    return this.driver.switchTo().alert()
}


/**
* @param {string} cssSelector
* @returns {browser} chainable method
*/
function sleep (ms) {
    this.driver.sleep(ms)
    return this
}


/**
* @param {string} cssSelector
* @returns {browser} chainable method
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
