import { ChildProcess, fork } from 'child_process';
import * as os from 'os';
import { promisify } from 'util';

function defaultWeights(): number[] {
  return os.cpus().map(cpu => cpu.speed);
}

export type Worker = {
  weight: number;
  process: ChildProcess;
};

/**
 * only support request-response batch-by-batch
 * DO NOT support multiple interlaced concurrent batches
 * */
export class ThreadPool {
  totalWeights: number;
  workers: Worker[];

  dispatch: {
    <T, R>(inputs: T[], cb: (err: any, outputs: R[]) => void): void;
    <T, R>(inputs: T[]): Promise<R[]>;
  } = promisify(<T, R>(inputs: T[], cb: (err: any, outputs: R[]) => void) => {
    const n = inputs.length;
    const outputs = new Array(n);
    let offset = 0;
    let pending = 0;
    for (const worker of this.workers) {
      const start = offset;
      const count = Math.ceil(worker.weight / this.totalWeights);
      const end = offset + count;
      const xs = inputs.slice(offset, end);
      pending++;
      worker.process.once('message', ys => {
        for (let o = start, c = 0; o < end; o++, c++) {
          outputs[o] = ys[c];
        }
        pending--;
        if (pending === 0) {
          cb(undefined, outputs);
        }
      });
      worker.process.send(xs);
      if (end >= n) {
        break;
      }
      offset = end;
    }
  });

  constructor(
    options:
      | {
          modulePath: string;
          weights?: number[];
        }
      | {
          workers: Worker[];
        },
  ) {
    if ('workers' in options) {
      if (options.workers.length === 0) {
        throw new Error('require at least 1 workers');
      }
      this.workers = options.workers;
      this.totalWeights = 0;
      this.workers.forEach(x => (this.totalWeights += x.weight));
      return;
    }
    let { weights } = options;
    if (!weights) {
      weights = defaultWeights();
    }
    if (weights.length === 0) {
      throw new Error('require at least 1 weights');
    }
    const n = weights.length;
    // console.log('created', n, 'workers');
    this.workers = new Array(n);
    this.totalWeights = 0;
    for (let i = 0; i < n; i++) {
      const weight = weights[i];
      this.totalWeights += weight;
      this.workers[i] = {
        weight,
        process: fork(options.modulePath),
      };
    }
  }

  close(signal: NodeJS.Signals | number = os.constants.signals.SIGTERM) {
    this.workers.forEach(worker => worker.process.kill(signal));
  }
}
