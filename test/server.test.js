import test from 'ava'
import { caller, expose } from '../src/index'
import fakeWindows from './helpers/fake-windows'
import Fruits from './fixtures/fruits.json'

test('should pass error back to client', async (t) => {
  const [ server, client ] = fakeWindows()

  const serverErr = new Error('Boom')
  serverErr.output = { payload: { additional: 'data' } }

  const fruitService = {
    getFruits: () => Promise.reject(serverErr)
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  try {
    await getFruits()
    t.fail() // expected to throw
  } catch (err) {
    t.is(err.message, serverErr.message)

    Object.keys(serverErr.output.payload).forEach((key) => {
      t.is(err[key], serverErr.output.payload[key])
    })
  }
})

test('should close', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => Promise.resolve(Fruits)
  }

  const serverHandle = expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  const fruits = await getFruits()

  t.deepEqual(fruits, Fruits)

  // Stop listening for requests for fruity treats
  serverHandle.close()

  return new Promise(async (resolve) => {
    // Try again now it's closed
    const fruitPromise = getFruits()

    setTimeout(() => {
      // Ok so it's probably not going to respond, this is pass!
      t.pass()
      resolve()
    }, 500)

    // Try to wait for the response
    await fruitPromise
    throw new Error('should not fulfil')
  })
})

test('should ignore bad/irrelevant messages', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => new Promise((resolve) => setTimeout(() => resolve(Fruits), 500))
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  const fruitPromise = getFruits()

  // Inbetween, lets send irrelevant messages that should be ignored
  server.listeners.forEach(l => {
    l({})
    l({ data: { sender: 'bogus' } })
    l({ data: { id: 'wrong' } })
  })

  const fruits = await fruitPromise

  t.deepEqual(fruits, Fruits)
})

test('should allow non promise return value', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => Fruits // sync API on the server
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  t.deepEqual(await getFruits(), Fruits)
})
