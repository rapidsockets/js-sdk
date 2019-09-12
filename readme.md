## RapidSockets JS SDK

### Introduction
This is the official Software Development Kit for JavaScript to interact with the RapidSockets real-time messaging platform.

### Browser specific dependency
To use the RapidSockets SDK in the browser, copy `dist/rapidsockets.min.js` and include in your site.

### Node.js specific dependency
Install with `npm install rapidsockets` and include `const RapidSockets = require('rapidsockets');`.

### Common Usage
```js
// initialize and open a connection to the RapidSockets Gateway
var rs = new RapidSockets({
    key: 'your multi key'
});

// start listening for new messages on channel "mytest"
rs.subscribe({
    channel: 'mytest',
    callback: function(packet) {
        console.log(packet);
    }
});

// as a test, publish messages to channel "mytest" every two seconds
setInterval(function() {
    rs.publish({
        channel: 'mytest',
        message: 'test message'
    })
}, 2000);
```

### Development specific notes
```
# build browser sdk
node_modules/.bin/gulp

# dev browser sdk and watch for changes
node_modules/.bin/gulp watch
```
