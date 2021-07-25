let { isMainThread, Worker, parentPort } = require('worker_threads')

if (isMainThread) {
  main()
} else {
  work()
}

function main() {
  console.log('[main] init')
  let worker = new Worker(__filename)
  console.log('[main] created worker:', __filename)

  function send(message, cb) {
    console.log(`[main] send:`, message)
    worker.once('message', reply => {
      console.log('[main] received:', reply)
      cb(reply)
    })
    worker.postMessage(message)
  }

  send(1, reply => {
    send(reply + 1, () => {
      send('stop', () => {
        process.exit()
      })
    })
  })
}

function work() {
  console.log('[work] init')
  parentPort.on('message', message => {
    console.log('[worker] received message:', message)
    if (message === 'stop') {
      process.exit()
    }
    let reply = message + 1
    console.log('[worker] post reply:', reply)
    parentPort.postMessage(reply)
  })
}
