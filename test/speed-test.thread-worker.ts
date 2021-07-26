import { fitness, Gene } from './speed-test.shared'
import { isMainThread, MessagePort, parentPort, Worker } from 'worker_threads'

const { ceil } = Math

const worker_list: Worker[] = []

if (parentPort) {
  initWorkerThread(parentPort)
}

export function evalAll(
  population: Gene[],
  cb: (err: any, score_list: number[]) => void,
) {
  if (!isMainThread) {
    cb('evalAll() is only available in main thread', [])
    return
  }
  const n_worker = worker_list.length
  const score_list: number[] = []
  const slice_each_worker = ceil(population.length / n_worker)
  let offset = 0
  let pending = 0
  for (let i = 0; i < n_worker; i++) {
    const start = offset
    const sub_population = population.slice(start, start + slice_each_worker)
    offset += sub_population.length
    pending++
    worker_list[i].once('message', (sub_score_list: number[]) => {
      sub_score_list.forEach((score, i) => {
        score_list[start + i] = score
      })
      pending--
      if (pending === 0) {
        cb(undefined, score_list)
      }
    })
    worker_list[i].postMessage(sub_population)
  }
}

export function initMainThread(n_worker: number) {
  for (let i = 0; i < n_worker; i++) {
    worker_list[i] = worker_list[i] || new Worker(__filename)
  }
}

function initWorkerThread(parentPort: MessagePort) {
  parentPort.on('message', message => {
    if (message === 'stop') {
      process.exit()
    }
    const gene_list: Gene[] = message
    const score_list = gene_list.map(fitness)
    parentPort.postMessage(score_list)
  })
}
