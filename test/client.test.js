import test from 'ava'
import { createClientFunc, mapServerFunc } from '../src/index'
import fakeWindows from './helpers/fake-windows'
import Fruits from './fixtures/fruits.json'

test('should fetch data from remote', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => Promise.resolve(Fruits)
  }

  mapServerFunc('getFruits', fruitService, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = createClientFunc('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: client.postMessage
  })

  const fruits = await getFruits()

  t.deepEqual(fruits, Fruits)
})

test('should be cancelable', async (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    // Take 250ms to get fruits
    getFruits: () => new Promise((resolve, reject) => {
      setTimeout(() => resolve(Fruits), 250)
    })
  }

  mapServerFunc('getFruits', fruitService, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = createClientFunc('getFruits', {
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

  mapServerFunc('getFruits', fruitService, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
    postMessage: server.postMessage
  })

  const getFruits = createClientFunc('getFruits', {
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
