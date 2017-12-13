export default function fakeWindows () {
  const win0 = {
    listeners: [],
    addEventListener: (_, listener) => win0.listeners.push(listener),
    removeEventListener (_, listener) {
      win0.listeners = win0.listeners.filter(l => l !== listener)
    },
    postMessage (data) {
      process.nextTick(() => win1.listeners.forEach(l => l({ data })))
    }
  }

  const win1 = {
    listeners: [],
    addEventListener: (_, listener) => win1.listeners.push(listener),
    removeEventListener (_, listener) {
      win1.listeners = win1.listeners.filter(l => l !== listener)
    },
    postMessage (data) {
      process.nextTick(() => win0.listeners.forEach(l => l({ data })))
    }
  }

  return [win0, win1]
}
