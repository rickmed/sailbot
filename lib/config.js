/* Browser Object */
var session = {
    port: '7055',
    url: 'http://localhost:',
    timeout: 30 * 1000
}

var chrome_capabilities = {
    browserName: 'chrome',
    // chromeOptions: {
    //     args: ['window-position=20,20', 'window-size=1000,850']
    // }
}


module.exports = {
    session,
    chrome_capabilities
}
