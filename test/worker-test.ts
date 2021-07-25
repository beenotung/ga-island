import { parentPort as _parentPort } from 'worker_threads'

export let modulePath = __filename

const parentPort = _parentPort
if (parentPort) {
  parentPort.on('message', message => {
    if (message === 'stop') {
      process.exit()
    }
    let inputs: any[] = message
    let outputs = inputs.map(input => ({ echo: input }))
    parentPort.postMessage(outputs)
  })
}
