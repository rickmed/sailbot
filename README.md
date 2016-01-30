# sailbot

For simple web automation.

- Keeps selenium's async nature.
- Can open browser windows, let them stay opened and reattach to that window when running a separate script.
- Seamless support working with sites with iframes.
- Currently, works best with chrome.
- Docs incomplete

## Installation

    npm install sailbot

## Usage

    let Sailbot = require('sailbot')

    let go = new Sailbot(options)

    // as sailbot is async you can use something like bluebird coroutines

    let Promise = require("bluebird")

    let fn = Promise.coroutine(function* (val) {

        go.to('http://somesite.com')
        .switchTo(['frame1, 'child_frame']).get('#id1').click()
        .get('#input').clear().write('Hello')
        let y = yield go.get('#editlistinglink').attribute('value')
        let z = yield go.get('#editlistinglink').text()
        console.log(z, y)

    })




