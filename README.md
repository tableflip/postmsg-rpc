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

const fruitService = { getFruits: () => new Promise(/* ... */) }

// Expose this function for RPC to other windows
expose('getFruits', fruitService.getFruits)
```

In the other window (**the "client"**):

```js
import { caller } from 'postmsg-rpc'

// Create a function that uses postMessage to call a function in a different window
const getFruits = caller('getFruits')

const fruits = await getFruits() // Wait for the fruits to ripen
```

## API

#### `caller(funcName, options)`

Create a function that uses postMessage to call a function in a different window.

* `funcName` - the name of the function to call
* `options.targetOrigin` - passed to postMessage (see [postMessage docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for more info)
    * default `'*'`

The following options are for use with other similar messaging systems, for example when using [message passing in browser extensions](https://developer.chrome.com/extensions/messaging) or for testing:

* `options.addListener` - function that adds a listener
    * default `window.addEventListener`
* `options.removeListener` - function that removes a listener
    * default `window.removeEventListener`
* `options.postMessage` - function that posts a message
    * default `window.postMessage`
* `options.getMessageData` - a function that extracts data from the event object passed to a `message` event handler
    * default `(e) => e.data`

The function returned from `createClientFunc` will return a `Promise` when called so can be `await`ed or used in the usual way (`then`/`catch`). The `Promise` returned has an additional property `cancel` which can be called to cancel an in flight request e.g.

```js
const getFruits = caller('getFruits')
const fruitPromise = getFruits()

fruitPromise.cancel()

try {
  await fruitPromise
} catch (err) {
  if (err.isCanceled) {
    console.log('function call canceled')
  }
}
```

#### `expose(funcName, func, options)`

Map "calls" to `funcName` (over postMessage) to a function. Assumes that the function being called on target returns a promise.

* `funcName` - the name of the function called on the client
* `func` - the function should be called
* `options.targetOrigin` - passed to postMessage (see [postMessage docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for more info)
    * default `'*'`
* `options.isCallback` - set to true if `func` takes a node style callback instead of returning a promise
    * default `false`

The following options are for use with other similar messaging systems, for example when using [message passing in browser extensions](https://developer.chrome.com/extensions/messaging) or for testing:

* `options.addListener` - function that adds a listener
    * default `window.addEventListener`
* `options.removeListener` - function that removes a listener
    * default `window.removeEventListener`
* `options.postMessage` - function that posts a message
    * default `window.postMessage`
* `options.getMessageData` - a function that extracts data from the event object passed to a `message` event handler
    * default `(e) => e.data`

Returns an object with a `close` method to stop the server from listening to messages.

---
A [(╯°□°）╯︵TABLEFLIP](https://tableflip.io) side project.
