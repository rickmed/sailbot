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

```javascript
// Example 1

let Sailbot = require('sailbot')
let Promise = require("bluebird")

let go = Sailbot()

let func = Async(function* () {

    go.to('http://google.com')
    .get('#lst-ib').clear().write('wikipedia')

    let titles = yield go.getAll('h3 a').text()
    let links = yield go.getAll('h3 a').attribute('href')

    console.log(titles, links)

    go.quit()
})

func()


// Example 2 

let options = {   // defaults:
    timeout: 30, 
    port: 7055,
    dev: 'dev',   // pass this to keep a window opened (nodejs process running).
    id: 'id here'  // the previous process will console the id. Pass this in any new script.
}

let go = Sailbot(options)
let go2 = Sailbot()

let fn = Promise.coroutine(function* (val) {

    go.to('http://somesite.com')
    .switchTo(['frame1', 'child_frame'])
    .get('#id1').click()  // this will run in parallel/separate browser window
    .get('#input').clear().write('Hello')  // almost all methods are chainable
  
    go2.to('http://somesite.com')  // this will run in parallel/separate browser window
    
    let y = yield go.getAll('#editlistinglink').attribute('value')  // returns array
    console.log(z, y)
    go.sleep(5000)
    waitFor('#element').isVisible()
    waitFor('#element2').isFound()
    go.driver.sleep(1000) // can use any native selenium functionality
    go.quit()

})

fn()
```

## [Full Docs](http://rickmed.github.io/sailbot/)

