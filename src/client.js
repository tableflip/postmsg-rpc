import shortid from 'shortid'

export default function caller (funcName, opts) {
  opts = opts || {}

  const addListener = opts.addListener || window.addEventListener
  const removeListener = opts.removeListener || window.removeEventListener
  const postMessage = opts.postMessage || window.postMessage
  const targetOrigin = opts.targetOrigin || '*'
  const getMessageData = opts.getMessageData || ((event) => event.data)

  return function () {
    const msg = {
      sender: 'postmsg-rpc/client',
      id: shortid(),
      func: funcName,
      args: Array.from(arguments)
    }

    let cancel

    const response = new Promise((resolve, reject) => {
      const handler = function () {
        const data = getMessageData.apply(null, arguments)
        if (!data) return
        if (data.sender !== 'postmsg-rpc/server' || data.id !== msg.id) return
        removeListener('message', handler)

        if (data.err) {
          const err = new Error(`Unexpected error calling ${funcName}`)
          Object.assign(err, data.err)
          return reject(err)
        }

        resolve(data.res)
      }

      cancel = () => {
        removeListener('message', handler)
        const err = new Error(`Canceled call to ${funcName}`)
        err.isCanceled = true
        reject(err)
      }

      addListener('message', handler)
      postMessage(msg, targetOrigin)
    })

    response.cancel = () => cancel()

    return response
  }
}

export function call (funcName) {
  return caller(funcName).apply(null, [].slice.call(arguments, 1))
}
