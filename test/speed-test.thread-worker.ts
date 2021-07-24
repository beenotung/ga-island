import { fitness, Gene } from './speed-test.shared';

import { Worker, isMainThread, parentPort } from 'worker_threads';

let nWorker = 8;
let workers: Worker[];
export let evalAll: (
  population: Gene[],
  cb: (err: any, scores: number[]) => void,
) => void;
if (isMainThread) {
  // is master
  workers = new Array(nWorker);
  for (let i = 0; i < nWorker; i++) {
    let worker = new Worker(__filename);
    workers[i] = worker;
  }
  console.log('created', nWorker, 'workers');
  evalAll = (population, cb) => {
    let n = population.length;
    let offset = 0;
    let pending = 0;
    let outputs: number[] = [];
    for (let i = 0; i < nWorker; i++) {
      let start = offset;
      let count = Math.ceil((1 / nWorker) * n);
      let end = offset + count;
      offset = end;
      const inputs = population.slice(start, end);
      let worker = workers[i];
      worker.postMessage(inputs);
      pending++;
      // console.log({pending})
      worker.once('message', ys => {
        for (let o = start, c = 0; o < end; o++, c++) {
          outputs[o] = ys[c];
        }
        pending--;
        // console.log({pending})
        if (pending === 0) {
          cb(undefined, outputs);
        }
      });
    }
    // console.log('master: sent to',pending,'workers')
  };
} else {
  // is worker
  parentPort!.on('message', message => {
    if (message === 'stop') {
      process.exit();
      return;
    }
    let population: Gene[] = message;
    let outputs: number[] = population.map(gene => fitness(gene));
    // console.log('worker:', {
    //   population,
    //   outputs,
    // })
    parentPort!.postMessage(outputs);
  });
  evalAll = (population, cb) => {
    cb(new Error('cannot call evalAll() from worker'), undefined as any);
  };
}
