/**
 * test techniques to speed up the iteration
 * 1. cache         : depends on implementation of doesABeatB()
 * 2. multi-process : works
 *
 *  ## speed table
 *  |===|
 *  | technique               | generation per second |
 *
 *  | single-process fitness  | 1.95                  |
 *  |  multi-process fitness  |                       |
 *  |===|
 *
 *  *: generation per second, higher better
 *
 * */
import {
  GaIsland,
  genDoesABeatB,
  randomBoolean,
  randomNumber,
  RequiredOptions,
} from '../src';
import { createHash } from 'crypto';
import {
  random,
  print,
  log,
  roundNumber,
  inspect,
  appendFileSync,
} from './helpers';
import { ThreadPool } from '../src/thread-pool';

function hash(s: string): string {
  let h = createHash('sha256');
  h.write(s);
  let bin = h.digest();
  h.end();
  s = bin.toString('hex');
  return s;
}

let n = hash('').length;

function randomCode(): string {
  return randomNumber(random, 0, 15, 1).toString(16);
}

function randomIndividual(): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += randomCode();
  }
  return s;
}

function distance(a: string, b: string): number {
  let acc = 0;
  for (let i = 0; i < n; i++) {
    let x = parseInt(a[i], 16);
    let y = parseInt(b[i], 16);
    let d = (x - y) / 16;
    acc += d * d;
  }
  acc = Math.sqrt(acc);
  // appendFileSync('distance.csv', acc + '\n')
  return acc;
}

let options: RequiredOptions<string> = {
  mutate: gene => {
    let res = '';
    for (let i = 0; i < n; i++) {
      if (randomBoolean(random, 1 / n)) {
        res += randomCode();
      } else {
        res += gene[i];
      }
    }
    return res;
  },
  crossover: (a, b) => {
    let c = '';
    let d = '';
    for (let i = 0; i < n; i++) {
      if (randomBoolean(random)) {
        c += a[i];
        d += b[i];
      } else {
        c += b[i];
        d += a[i];
      }
    }
    return [c, d];
  },
  fitness: gene => {
    let s = hash(gene);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      acc += parseInt(s[i], 16);
    }
    return acc;
  },
  populationSize: 20000,
  randomIndividual,
};
options.doesABeatB = genDoesABeatB({
  ...options,
  min_distance: 3.25,
  distance,
});
let ga = new GaIsland(options);

let generation = 0;

let threadPool = new ThreadPool({ modulePath: './worker.js' });

function evolve(cb: () => void) {
  log('master:', { generation });
  // threadPool.
  // ga.evolve()
  // cb()
}

let start = Date.now();

function run() {
  generation++;
  evolve(() => {
    let now = Date.now();
    let t = (now - start) / 1000;
    let speed = generation / t;
    print(
      '\r' +
        inspect({
          'gen/sec': roundNumber(speed, 3),
          population: ga.options.populationSize,
        }),
    );
    run();
  });
}

run();
