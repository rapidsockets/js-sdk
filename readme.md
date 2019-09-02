## RapidSockets JS SDK

### Introduction
This is the official Software Development Kit for JavaScript to interact with the RapidSockets real-time messaging platform.

### Browser specific dependency
To use the RapidSockets SDK in the browser, copy `dist/rapidsockets.min.js` and include in your site.

### Node.js specific dependency
Install with `npm install rapidsockets-js` and include `const RapidSockets = require('rapidsockets-js');`.

### Common Usage
```js
const rs = new RapidSockets({
    key: 'your key'
});

rs.subscribe({
    channel: 'mychannel',
    callback: function(packet) {
        console.log(packet.payload.message); // my message
    }
});

rs.publish({
    channel: 'mychannel',
    message: 'my message'
});
```

### Development specific notes
```
# build browser sdk
node_modules/.bin/gulp

# dev browser sdk and watch for changes
node_modules/.bin/gulp watch
```
