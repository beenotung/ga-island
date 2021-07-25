let { fork } = require('child_process')

if (process.send) {
  work()
} else {
  main()
}

function main() {
  console.log('[main] init')
  let child = fork(__filename)
  console.log('[main] forked child:', __filename)

  function send(message, cb) {
    console.log('[main] send:', message)
    child.once('message', reply => {
      console.log('[main] received:', reply)
      cb(reply)
    })
    child.send(message)
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
  process.on('message', message => {
    console.log('[child] received:', message)
    if (message === 'stop') {
      process.exit()
    }
    let reply = message + 1
    console.log('[child] send reply:', reply)
    process.send(reply)
  })
}
