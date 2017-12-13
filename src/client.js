import shortid from 'shortid'

export default function createClientFunc (funcName, opts) {
  opts = opts || {}

  const addListener = opts.addListener || window.addEventListener
  const removeListener = opts.removeListener || window.removeEventListener
  const postMessage = opts.postMessage || window.postMessage
  const targetOrigin = opts.targetOrigin || '*'
  const getMessageData = opts.getMessageData || ((event) => event.data)

  return function () {
    const args = Array.from(arguments)

    const msg = {
      sender: 'postmsg-rpc/client',
      id: shortid(),
      func: funcName,
      args: args.slice(0, -1)
    }

    let handler

    const response = new Promise((resolve, reject) => {
      handler = (e) => {
        const data = getMessageData(e)
        if (!data) return
        if (data.sender !== 'postmsg-rpc/server' || data.id !== msg.id) return
        removeListener('message', handler)

        if (e.data.err) {
          const err = new Error(`Unexpected error calling ${funcName}`)
          Object.assign(err, data.err)
          return reject(err)
        }

        resolve(e.data.res)
      }

      addListener('message', handler)
      postMessage(msg, targetOrigin)
    })

    response.cancel = () => removeListener('message', handler)

    return response
  }
}

export function createClientCallbackFunc (funcName, opts) {
  opts = opts || {}

  const addListener = opts.addListener || window.addEventListener
  const removeListener = opts.removeListener || window.removeEventListener
  const postMessage = opts.postMessage || window.postMessage
  const targetOrigin = opts.targetOrigin || '*'
  const getMessageData = opts.getMessageData || ((event) => event.data)

  return function () {
    const args = Array.from(arguments)
    const cb = args[args.length - 1]

    const msg = {
      sender: 'postmsg-rpc/client',
      id: shortid(),
      func: funcName,
      args: args.slice(0, -1)
    }

    const handler = (e) => {
      const data = getMessageData(e)
      if (!data) return
      if (data.sender !== 'postmsg-rpc/server' || data.id !== msg.id) return
      removeListener('message', handler)

      if (e.data.err) {
        const err = new Error(`Unexpected error calling ${funcName}`)
        return cb(Object.assign(err, data.err))
      }

      cb(null, e.data.res)
    }

    addListener('message', handler)
    postMessage(msg, targetOrigin)

    return { cancel: () => removeListener('message', handler) }
  }
}
