import * as os from 'os'
import { promisify } from 'util'
import { Worker } from 'worker_threads'

function defaultWeights(): number[] {
  return os.cpus().map(cpu => cpu.speed)
}

export type WeightedWorker = {
  weight: number
  worker: Worker
}

/**
 * only support request-response batch-by-batch
 * DO NOT support multiple interlaced concurrent batches
 * */
export class ThreadPool {
  totalWeights: number
  workers: WeightedWorker[]

  dispatch: {
    <T, R>(inputs: T[], cb: (err: any, outputs: R[]) => void): void
    <T, R>(inputs: T[]): Promise<R[]>
  } = promisify(
    <T, R>(input_list: T[], cb: (err: any, outputs: R[]) => void) => {
      const n = input_list.length
      const output_list = new Array(n)
      let offset = 0
      let pending = 0
      for (const worker of this.workers) {
        const start_index = offset
        const slice_count = Math.ceil((worker.weight / this.totalWeights) * n)
        const input_sub_list = input_list.slice(offset, offset + slice_count)
        const end_index = offset + input_sub_list.length
        pending++
        worker.worker.once('message', output_sub_list => {
          for (
            let output_index = start_index, sub_list_index = 0;
            output_index < end_index;
            output_index++, sub_list_index++
          ) {
            output_list[output_index] = output_sub_list[sub_list_index]
          }
          pending--
          if (pending === 0) {
            cb(undefined, output_list)
          }
        })
        worker.worker.postMessage(input_sub_list)
        if (end_index >= n) {
          break
        }
        offset = end_index
      }
    },
  )

  constructor(
    options:
      | {
          modulePath: string
          /**
           * workload for each worker, default to 1.0 for all workers
           * */
          weights?: number[]
          /**
           * number of worker = (number of core / weights) * overload
           * default to 1.0
           * */
          overload?: number
        }
      | {
          workers: WeightedWorker[]
        },
  ) {
    if ('workers' in options) {
      if (options.workers.length === 0) {
        throw new Error('require at least 1 workers')
      }
      this.workers = options.workers
      this.totalWeights = 0
      this.workers.forEach(x => (this.totalWeights += x.weight))
      return
    }
    let { weights, overload } = options
    if (!weights) {
      weights = defaultWeights()
    }
    if (weights.length === 0) {
      throw new Error('require at least 1 weights')
    }
    if (!overload) {
      overload = 1
    }
    const n = weights.length * overload
    this.workers = new Array(n)
    this.totalWeights = 0
    for (let i = 0; i < n; i++) {
      const weight = weights[i % weights.length]
      this.totalWeights += weight
      this.workers[i] = {
        weight,
        worker: new Worker(options.modulePath),
      }
    }
  }

  close() {
    return this.workers.map(worker => worker.worker.terminate())
  }
}
