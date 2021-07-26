/**
 * test techniques to speed up the iteration
 * 1. cache         : depends on implementation of doesABeatB()
 * 2. multi-process : works but not linearly scalable
 * */
import {
  GaIsland,
  genDoesABeatB,
  randomBoolean,
  randomNumber,
  RequiredOptions,
} from '../src'
import { inspect, print, random, roundNumber } from './helpers'
import { fitness as singleCoreFitness, Gene, n } from './speed-test.shared'
import {
  evalAll as threadEvalAll,
  initMainThread,
} from './speed-test.thread-worker'
import {
  evalAll as processEvalAll,
  initMainProcess,
} from './speed-test.process-worker'

const concurrentMode = process.argv[2]
const numberOfCore = +process.argv[3]
const maxGeneration = 100 * numberOfCore
const populationSize = 20000
const singleCore = false

const [evalAll, initMain] =
  concurrentMode === 'thread'
    ? [threadEvalAll, initMainThread]
    : [processEvalAll, initMainProcess]
initMain(numberOfCore)

function randomCode(): string {
  return randomNumber(random, 0, 15, 1).toString(16)
}

function randomIndividual(): Gene {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += randomCode()
  }
  return [-1, s]
}

function distance([_a, a]: Gene, [_b, b]: Gene): number {
  let acc = 0
  for (let i = 0; i < n; i++) {
    let x = parseInt(a[i], 16)
    let y = parseInt(b[i], 16)
    let d = (x - y) / 16
    acc += d * d
  }
  acc = Math.sqrt(acc)
  return acc
}

let scores: number[]

function fitness(gene: Gene): number {
  if (singleCore) {
    return singleCoreFitness(gene)
  }
  return scores[gene[0]]
}

function evolve(ga: GaIsland<Gene>, cb: () => void) {
  if (singleCore) {
    ga.options.fitness = singleCoreFitness
    ga.evolve()
    cb()
    return
  }
  ga.options.population.forEach((gene, i) => (gene[0] = i))
  evalAll(ga.options.population, (err, outputs) => {
    if (err) {
      throw err
    }
    scores = outputs
    ga.evolve()
    cb()
  })
}

let options: RequiredOptions<Gene> = {
  mutate: (gene, output): void => {
    let res = ''
    for (let i = 0; i < n; i++) {
      if (randomBoolean(random, 1 / n)) {
        res += randomCode()
      } else {
        res += gene[1][i]
      }
    }
    output[0] = -1
    output[1] = res
  },
  crossover: ([_a, a], [_b, b], child): void => {
    let c = ''
    for (let i = 0; i < n; i++) {
      if (randomBoolean(random)) {
        c += a[i]
      } else {
        c += b[i]
      }
    }
    child[0] = -1
    child[1] = c
  },
  fitness,
  populationSize,
  randomIndividual,
}
options.doesABeatB = genDoesABeatB({
  ...options,
  min_distance: 3.25,
  distance,
})
let ga = new GaIsland(options)

let start = Date.now()

let generation = 0

function run() {
  generation++
  evolve(ga, () => {
    let now = Date.now()
    let t = (now - start) / 1000
    let speed = generation / t
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
    )
    if (generation < maxGeneration) {
      return run()
    }
    console.log()
    process.exit()
  })
}

console.log({ concurrentMode, numberOfCore })
run()
