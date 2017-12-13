import test from 'ava'
import { createClientCallbackFunc, mapServerCallbackFunc } from '../src/index'
import fakeWindows from './helpers/fake-windows'
import Fruits from './fixtures/fruits.json'

test.cb('should pass error back to client', (t) => {
  const [ server, client ] = fakeWindows()

  const serverErr = new Error('Boom')
  serverErr.output = { payload: { additional: 'data' } }

  const fruitService = {
    getFruits (cb) { process.nextTick(() => cb(serverErr)) }
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

  getFruits((err) => {
    t.truthy(err)
    t.is(err.message, serverErr.message)

    Object.keys(serverErr.output.payload).forEach((key) => {
      t.is(err[key], serverErr.output.payload[key])
    })

    t.end()
  })
})

test.cb('should close', (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (cb) => process.nextTick(() => cb(null, Fruits))
  }

  const serverHandle = mapServerCallbackFunc('getFruits', fruitService, {
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

    // Stop listening for requests for fruity treats
    serverHandle.close()

    getFruits(() => t.fail())

    setTimeout(() => {
      // Ok so it's probably not going to respond, this is pass!
      t.pass()
      t.end()
    }, 500)
  })
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
  server.listeners.forEach(l => {
    l({})
    l({ data: { sender: 'bogus' } })
    l({ data: { id: 'wrong' } })
  })
})
