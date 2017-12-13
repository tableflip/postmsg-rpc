import test from 'ava'
import { createClientCallbackFunc, mapServerCallbackFunc } from '../src/index'
import fakeWindows from './helpers/fake-windows'
import Fruits from './fixtures/fruits.json'

test.cb('should fetch data from remote', (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (cb) => process.nextTick(() => cb(null, Fruits))
  }

  mapServerCallbackFunc('getFruits', fruitService, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = createClientCallbackFunc('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  getFruits((err, fruits) => {
    t.ifError(err)
    t.deepEqual(fruits, Fruits)
    t.end()
  })
})

test.cb('should be cancelable', (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (cb) => setTimeout(() => cb(null, Fruits), 250)
  }

  mapServerCallbackFunc('getFruits', fruitService, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = createClientCallbackFunc('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  const handle = getFruits((err) => {
    t.truthy(err)
    t.true(err.isCanceled)
    t.end()
  })

  handle.cancel()
})

test.cb('should ignore bad/irrelevant messages', (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (cb) => setTimeout(() => cb(null, Fruits), 500)
  }

  mapServerCallbackFunc('getFruits', fruitService, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = createClientCallbackFunc('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  getFruits((err, fruits) => {
    t.ifError(err)
    t.deepEqual(fruits, Fruits)
    t.end()
  })

  // Inbetween, lets send irrelevant messages that should be ignored
  client.listeners.forEach(l => {
    l({})
    l({ data: { sender: 'bogus' } })
    l({ data: { id: 'wrong' } })
  })
})
