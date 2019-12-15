/**
 * test techniques to speed up the iteration
 * 1. cache         : depends on implementation of doesABeatB()
 * 2. multi-process : works but not linearly scalable
 * */
import {
  best,
  GaIsland,
  genDoesABeatB,
  maxIndex,
  randomBoolean,
  randomNumber,
  RequiredOptions,
} from '../src';
import {
  random,
  print,
  log,
  roundNumber,
  inspect,
  appendFileSync,
} from './helpers';
import { ThreadPool } from '../src/thread-pool';
import { Gene, n } from './speed-test.shared';

let singleCore = false;
let numberOfProcess = 8;

function randomCode(): string {
  return randomNumber(random, 0, 15, 1).toString(16);
}

function randomIndividual(): Gene {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += randomCode();
  }
  return [-1, s];
}

function distance([_a, a]: Gene, [_b, b]: Gene): number {
  let acc = 0;
  for (let i = 0; i < n; i++) {
    let x = parseInt(a[i], 16);
    let y = parseInt(b[i], 16);
    let d = (x - y) / 16;
    acc += d * d;
  }
  acc = Math.sqrt(acc);
  return acc;
}

let threadPool = new ThreadPool({
  modulePath: `${__dirname}/speed-test.worker.js`,
  weights: new Array(numberOfProcess).fill(1),
});
let scores: number[];

function fitness(gene: Gene): number {
  if (singleCore) {
    const { fitness } = require('./speed-test.worker');
    return fitness(gene);
  }
  return scores[gene[0]];
}

function evolve(ga: GaIsland<Gene>, cb: () => void) {
  if (singleCore) {
    const { fitness } = require('./speed-test.worker');
    ga.options.fitness = fitness;
    ga.evolve();
    cb();
    return;
  }
  ga.options.population.forEach((gene, i) => (gene[0] = i));
  threadPool.dispatch<Gene, number>(ga.options.population, (err, outputs) => {
    if (err) {
      throw err;
    }
    scores = outputs;
    ga.evolve();
    cb();
  });
}

let options: RequiredOptions<Gene> = {
  mutate: ([_, gene]) => {
    let res = '';
    for (let i = 0; i < n; i++) {
      if (randomBoolean(random, 1 / n)) {
        res += randomCode();
      } else {
        res += gene[i];
      }
    }
    return [-1, res];
  },
  crossover: ([_a, a], [_b, b]) => {
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
    return [
      [-1, c],
      [-1, d],
    ];
  },
  fitness,
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

let start = Date.now();

function run() {
  generation++;
  evolve(ga, () => {
    let now = Date.now();
    let t = (now - start) / 1000;
    let speed = generation / t;
    // let { gene, fitness } = best({
    //   fitness: require("./speed-test.worker").fitness,
    //   population: ga.options.population
    // });
    print(
      '\r' +
        inspect({
          generation,
          'gen/sec': roundNumber(speed, 3),
          population: ga.options.populationSize,
          // best: { gene: gene[1], fitness }
        }),
    );
    if (generation >= 50) {
      process.exit();
    }
    run();
  });
}

// it('should run', function () {
//   run();
// });
run();
