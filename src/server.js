export default function mapServerFunc (name, target, opts) {
  opts = opts || {}

  const addListener = opts.addListener || window.addEventListener
  const removeListener = opts.removeListener || window.removeEventListener
  const postMessage = opts.postMessage || window.postMessage
  const targetOrigin = opts.targetOrigin || '*'
  const getMessageData = opts.getMessageData || ((event) => event.data)
  const getTarget = opts.getTarget || (() => target)

  const handler = (e) => {
    const data = getMessageData(e)
    if (!data) return
    if (data.sender !== 'postmsg-rpc/client' || data.func !== name) return

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
    target[name].apply(target, data.args.concat(cb))
  }

  addListener('message', handler)

  return { close: () => removeListener('message', handler) }
}
