import { fork } from 'child_process'

let child = fork('./child.js')
child.send({ data: 1 })
child.on('message', message => {
  console.log('from child:', message)
  child.send('stop')
  console.log('parent closing')
  process.exit()
})
