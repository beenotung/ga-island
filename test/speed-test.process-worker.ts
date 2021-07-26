import { fitness, Gene } from './speed-test.shared'
import { ChildProcess, fork } from 'child_process'

const { ceil } = Math

const child_list: ChildProcess[] = []

if (process.send) {
  initChildProcess()
}

export function evalAll(
  population: Gene[],
  cb: (err: any, score_list: number[]) => void,
) {
  if (process.send) {
    cb('evalAll() is only available in main process', [])
    return
  }
  const n_child = child_list.length
  const score_list: number[] = []
  const slice_each_worker = ceil(population.length / n_child)
  let offset = 0
  let pending = 0
  for (let i = 0; i < n_child; i++) {
    const start = offset
    const sub_population = population.slice(start, start + slice_each_worker)
    offset += sub_population.length
    pending++
    child_list[i].once('message', (sub_score_list: number[]) => {
      sub_score_list.forEach((score, i) => {
        score_list[start + i] = score
      })
      pending--
      if (pending === 0) {
        cb(undefined, score_list)
      }
    })
    child_list[i].send(sub_population)
  }
}

export function initMainProcess(n_child: number) {
  for (let i = 0; i < n_child; i++) {
    child_list[i] = child_list[i] || fork(__filename)
  }
}

function initChildProcess() {
  process.on('message', message => {
    if (message === 'stop') {
      process.exit()
    }
    const gene_list: Gene[] = message
    const score_list = gene_list.map(fitness)
    process.send!(score_list)
  })
}
