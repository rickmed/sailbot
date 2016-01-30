/* Browser Object */
var session = {
    port: '7055',
    url: 'http://localhost:',
    timeout: 30 * 1000
}

var chrome_capabilities = {
    browserName: 'chrome',
    chromeOptions: {
        args: ['window-position=20,20', 'window-size=1000,850']
    }
}

var firefox_capabilities = {
    browserName: 'firefox',
    firefoxOptions: {
        args: ['--tray']
    }
}


module.exports = {
    session,
    chrome_capabilities,
    firefox_capabilities
}
