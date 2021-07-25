import { fitness, Gene } from './speed-test.shared'
import { ThreadPool } from '../src/thread-pool'

let nWorker = 8
let threadPool: ThreadPool
export let evalAll: (
  population: Gene[],
  cb: (err: any, scores: number[]) => void,
) => void = (population, cb) => {
  if (!threadPool) {
    threadPool = new ThreadPool({
      modulePath: __filename,
      weights: new Array(nWorker).fill(1),
    })
    console.log('created', nWorker, 'workers')
  }
  threadPool.dispatch(population, cb)
}

process.on('message', message => {
  let inputs: Gene[] = message
  let outputs: number[] = inputs.map(gene => fitness(gene))
  process.send!(outputs)
})
