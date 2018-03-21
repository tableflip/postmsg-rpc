# postmsg-rpc

[![Build Status](https://travis-ci.org/tableflip/postmsg-rpc.svg?branch=master)](https://travis-ci.org/tableflip/postmsg-rpc) [![dependencies Status](https://david-dm.org/tableflip/postmsg-rpc/status.svg)](https://david-dm.org/tableflip/postmsg-rpc) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Tiny RPC over [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) library

## Install

```sh
npm install postmsg-rpc
```

## Usage

In the window you want to call to (**the "server"**):

```js
import { expose } from 'postmsg-rpc'

const fruitService = {
  getFruits: (/* arg0, arg1, ... */) => new Promise(/* ... */)
}

// Expose this function for RPC from other windows
expose('getFruits', fruitService.getFruits)
```

In the other window (**the "client"**):

```js
import { call } from 'postmsg-rpc'

// Call the exposed function
const fruits = await call('getFruits'/*, arg0, arg1, ... */)
```

### Advanced usage

Use `caller` to create a function that uses postMessage to call an exposed function in a different window. It also allows you to pass options (see docs below).

```js
import { caller } from 'postmsg-rpc'

const getFruits = caller('getFruits'/*, options */)

// Wait for the fruits to ripen
const fruits = await getFruits(/*, arg0, arg1, ... */)
```

## API

#### `expose(funcName, func, options)`

Expose `func` as `funcName` for RPC from other windows. Assumes that `func` returns a promise.

* `funcName` - the name of the function called on the client
* `func` - the function that should be called. Should be synchronous _or_ return a promise. For callbacks, pass `options.isCallback`
* `options.targetOrigin` - passed to postMessage (see [postMessage docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for more info)
    * default `'*'`
* `options.isCallback` - set to true if `func` takes a node style callback instead of returning a promise
    * default `false`
* `options.postMessage` - function that posts a message. It is passed two parameters, `data` and `options.targetOrigin`. e.g. `document.querySelector('iframe').contentWindow.postMessage` for exposing functions to an iframe or `window.parent.postMessage` for exposing functions from an iframe to a parent window
    * default `window.postMessage`

The following options are for use with other similar messaging systems, for example when using [message passing in browser extensions](https://developer.chrome.com/extensions/messaging) or for testing:

* `options.addListener` - function that adds a listener. It is passed two parameters, the event name (always "message") and a `handler` function
    * default `window.addEventListener`
* `options.removeListener` - function that removes a listener. It is passed two parameters, the event name (always "message") and a `handler` function
    * default `window.removeEventListener`
* `options.getMessageData` - a function that extracts data from the arguments passed to a `message` event handler
    * default `(e) => e.data`

Returns an object with a `close` method to stop the server from listening to messages.

#### `call(funcName, <arg0>, <arg1>, ...)`

Call an exposed function in a different window.

* `funcName` - the name of the function to call

Returns a `Promise`, so can be `await`ed or used in the usual way (`then`/`catch`). The `Promise` returned has an additional property `cancel` which can be called to cancel an in flight request e.g.

```js
const fruitPromise = call('getFruits')

fruitPromise.cancel()

try {
  await fruitPromise
} catch (err) {
  if (err.isCanceled) {
    console.log('function call canceled')
  }
}
```

#### `caller(funcName, options)`

Create a function that uses postMessage to call an exposed function in a different window.

* `funcName` - the name of the function to call
* `options.targetOrigin` - passed to postMessage (see [postMessage docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for more info)
    * default `'*'`
* `options.postMessage` - function that posts a message. It is passed two parameters, `data` and `options.targetOrigin`. e.g. `document.querySelector('iframe').contentWindow.postMessage` for calling functions in an iframe or `window.parent.postMessage` for calling functions in a parent window from an iframe
    * default `window.postMessage`

The following options are for use with other similar messaging systems, for example when using [message passing in browser extensions](https://developer.chrome.com/extensions/messaging) or for testing:

* `options.addListener` - function that adds a listener. It is passed two parameters, the event name (always "message") and a `handler` function
    * default `window.addEventListener`
* `options.removeListener` - function that removes a listener. It is passed two parameters, the event name (always "message") and a `handler` function
    * default `window.removeEventListener`
* `options.getMessageData` - a function that extracts data from the arguments passed to a `message` event handler
    * default `(e) => e.data`

## Contribute

Feel free to dive in! [Open an issue](https://github.com/tableflip/postmsg-rpc/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw

---
A [(╯°□°）╯︵TABLEFLIP](https://tableflip.io) side project.
