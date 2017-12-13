export default function mapServerFunc (funcName, target, opts) {
  opts = opts || {}

  const addListener = opts.addListener || window.addEventListener
  const removeListener = opts.removeListener || window.removeEventListener
  const postMessage = opts.postMessage || window.postMessage
  const targetOrigin = opts.targetOrigin || '*'
  const getMessageData = opts.getMessageData || ((event) => event.data)
  const getTarget = opts.getTarget || (() => target)
  const targetFuncName = opts.targetFuncName || funcName

  const handler = async (e) => {
    const data = getMessageData(e)
    if (!data) return
    if (data.sender !== 'postmsg-rpc/client' || data.func !== funcName) return

    const target = getTarget()
    const msg = { sender: 'postmsg-rpc/server', id: data.id }

    try {
      msg.res = await target[targetFuncName].apply(target, data.args)
    } catch (err) {
      msg.err = Object.assign({ message: err.message }, err.output && err.output.payload)

      if (process.env.NODE_ENV !== 'production') {
        msg.err.stack = msg.err.stack || err.stack
      }
    }

    postMessage(msg, targetOrigin)
  }

  addListener('message', handler)

  return { close: () => removeListener('message', handler) }
}

export function mapServerCallbackFunc (funcName, target, opts) {
  opts = opts || {}

  const addListener = opts.addListener || window.addEventListener
  const removeListener = opts.removeListener || window.removeEventListener
  const postMessage = opts.postMessage || window.postMessage
  const targetOrigin = opts.targetOrigin || '*'
  const getMessageData = opts.getMessageData || ((event) => event.data)
  const getTarget = opts.getTarget || (() => target)
  const targetFuncName = opts.targetFuncName || funcName

  const handler = (e) => {
    const data = getMessageData(e)
    if (!data) return
    if (data.sender !== 'postmsg-rpc/client' || data.func !== funcName) return

    const cb = (err, res) => {
      const msg = { sender: 'postmsg-rpc/server', id: data.id, res }

      if (err) {
        msg.err = Object.assign({ message: err.message }, err.output && err.output.payload)

        if (process.env.NODE_ENV !== 'production') {
          msg.err.stack = msg.err.stack || err.stack
        }
      }

      postMessage(msg, targetOrigin)
    }

    const target = getTarget()
    target[targetFuncName].apply(target, data.args.concat(cb))
  }

  addListener('message', handler)

  return { close: () => removeListener('message', handler) }
}
