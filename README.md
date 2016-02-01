# sailbot

For simple web automation.

- Keeps selenium's async nature.
- Can open browser windows, let them stay opened and reattach to that window when running a separate script.
- Multiple concurrent/independent browsers.
- Seamless support working with sites with iframes.
- Waits until elements are visible to perform actions.
- Only chrome supported.

## Installation

    npm install sailbot

## Usage

    let Sailbot = require('sailbot')

    let go = Sailbot(options)

    // as sailbot is async you can use something like bluebird coroutines

    let Promise = require("bluebird")

    let fn = Promise.coroutine(function* (val) {

        go.to('http://somesite.com')
        .switchTo(['frame1, 'child_frame']).get('#id1').click()
        .get('#input').clear().write('Hello')
        let z = yield go.get('#editlistinglink').text()
        let y = yield go.getAll('#editlistinglink').attribute('value') // returns array
        console.log(z, y)
        go.sleep(5000)
        waitFor('#element').isVisible()
        waitFor('#element2').isFound()
        go.driver.sleep(1000) // can use any native selenium functionality
        go.quit()

    })

