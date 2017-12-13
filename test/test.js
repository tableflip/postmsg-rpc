import test from 'ava'
import { createClientFunc, mapServerFunc } from '../src/index'
import fakeWindows from './helpers/fake-windows'

const Fruits = [
  { name: 'Apple', color: 'green' },
  { name: 'Pear', color: 'green' },
  { name: 'Orange', color: 'orange' },
  { name: 'Banana', color: 'yellow' },
  { name: 'Pineapple', color: 'yellow' },
  { name: 'Kiwi', color: 'green' },
  { name: 'Grape', color: 'green' },
  { name: 'Blueberry', color: 'blue' }
]

test.cb('should fetch data from remote', (t) => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (cb) => process.nextTick(() => cb(null, Fruits))
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

  getFruits((err, fruits) => {
    t.ifError(err)
    t.deepEqual(fruits, Fruits)
    t.end()
  })
})
