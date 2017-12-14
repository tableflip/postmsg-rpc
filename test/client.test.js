import test from 'ava'
import { call, caller, expose } from '../src/index'
import fakeWindows from './helpers/fake-windows'
import Fruits from './fixtures/fruits.json'

test('should fetch data from remote', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => Promise.resolve(Fruits)
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

  const fruits = await getFruits()

  t.deepEqual(fruits, Fruits)
})

test('should fetch data from remote with call', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => Promise.resolve(Fruits)
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  global.window = client

  const fruits = await call('getFruits')

  t.deepEqual(fruits, Fruits)

  delete global.window
})

test('should be cancelable', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    // Take 250ms to get fruits
    getFruits: () => new Promise((resolve, reject) => {
      setTimeout(() => resolve(Fruits), 250)
    })
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

  fruitPromise.cancel()

  try {
    await fruitPromise
    t.fail()
  } catch (err) {
    t.true(err.isCanceled)
  }
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
  client.listeners.forEach(l => {
    l({})
    l({ data: { sender: 'bogus' } })
    l({ data: { id: 'wrong' } })
  })

  const fruits = await fruitPromise

  t.deepEqual(fruits, Fruits)
})

test('should pass arguments', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (arg0, arg1) => arg0 && arg1
      ? Promise.resolve(Fruits)
      : Promise.reject(new Error('args not passed'))
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

  const fruits = await getFruits(true, true)

  t.deepEqual(fruits, Fruits)
})

test('should pass arguments with call', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (arg0, arg1) => arg0 && arg1
      ? Promise.resolve(Fruits)
      : Promise.reject(new Error('args not passed'))
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  global.window = client

  const fruits = await call('getFruits', true, true)

  t.deepEqual(fruits, Fruits)

  delete global.window
})
