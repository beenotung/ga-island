# ga-island

Genetic Algorithm with 'island' Diversity support

[![npm Package Version](https://img.shields.io/npm/v/ga-island.svg?maxAge=2592000)](https://www.npmjs.com/package/ga-island)

Simplified implementation with zero dependency.

[Demo website](https://ga-island-demo.surge.sh)

Inspired from [panchishin/geneticalgorithm](https://github.com/panchishin/geneticalgorithm)

## Features

- [x] Typescript Typing
- [x] Support custom methods to improve efficiency
- [x] Support dynamic adjustment on mutation rate
- [x] Niche Island Support (anti-competitor to encourage diversity)
- [x] Utilize multi-processor to speed up
- [x] Support async fitness evaluation and comparison functions

## Usage Example

```typescript
import { RequiredOptions, GaIsland, best } from 'ga-island'

type Gene = {
  pattern: string
}

let options: RequiredOptions<Gene> = {
  populationSize: 100, // should be even number, default 100
  randomIndividual: (): Gene => ({ pattern: '...' }),
  mutationRate: 0.5, // chance of mutation, otherwise will do crossover, default 0.5
  mutate: (input: Gene, output: Gene): void => {
    output.pattern = '...'
  },
  crossover: (aParent: Gene, bParent: Gene, child: Gene): void => {
    output.pattern = '...'
  },
  fitness: (gene: Gene) => 1, // higher is better
  doesABeatB: (a: Gene, b: Gene): boolean => true, // optional, default only compare by fitness, custom function can consider both similarity and fitness
  random: Math.random, // optional, return floating number from 0 to 1 inclusively
}

let ga = new GaIsland(options)
for (let generation = 1; generation <= 100; generation++) {
  ga.evolve()
  let { gene, fitness } = best(ga.options)
  console.log({ generation, fitness, gene })
}
```

## Async Usage Example

```typescript
import { RequiredAsyncOptions, GaIslandAsync, bestAsync } from 'ga-island'

type Gene = {
  pattern: string
}

let options: RequiredAsyncOptions<Gene> = {
  populationSize: 100, // should be even number, default 100
  randomIndividual: (): Gene => ({ pattern: '...' }),
  mutationRate: 0.5, // chance of mutation, otherwise will do crossover, default 0.5
  mutate: (input: Gene, output: Gene): void => {
    output.pattern = '...'
  },
  crossover: (aParent: Gene, bParent: Gene, child: Gene): void => {
    output.pattern = '...'
  },
  fitness: async (gene: Gene) => 1, // async fitness evaluation
  doesABeatB: async (a: Gene, b: Gene): Promise<boolean> => true, // optional async comparison
  random: Math.random, // optional, return floating number from 0 to 1 inclusively
}

let ga = new GaIslandAsync(options)
for (let generation = 1; generation <= 100; generation++) {
  await ga.evolve()
  let { gene, fitness } = await bestAsync(ga.options)
  console.log({ generation, fitness, gene })
}
```

More examples:

- [(frog) islandHop](./examples)
- [ga-island.spec.ts](./test/ga-island.spec.ts) (includes async example)
- [speed-test.master.ts](./test/speed-test.master.ts), [speed-test.thread-worker.ts](./test/speed-test.thread-worker.ts), [speed-test.process-worker.ts](./test/speed-test.process-worker.ts)

## Typescript Signature

<details>
<summary>
Core types and class in `ga-island`:
</summary>

```typescript
export class GaIsland<G> {
  options: FullOptions<G>
  constructor(options: RequiredOptions<G>)
  evolve(): void
}

export class GaIslandAsync<G> {
  options: FullAsyncOptions<G>
  constructor(options: RequiredAsyncOptions<G>)
  evolve(): Promise<void>
}

export type RequiredOptions<G> = Options<G> &
  (
    | {
        population: G[]
      }
    | {
        randomIndividual: () => G
      }
  )

export type RequiredAsyncOptions<G> = AsyncOptions<G> &
  (
    | {
        population: G[]
      }
    | {
        randomIndividual: () => G
      }
  )

export type FullOptions<G> = Required<Options<G>>

export type FullAsyncOptions<G> = Required<AsyncOptions<G>>

export type Options<G> = {
  /**
   * The output should be updated in-place.
   * This design can reduce GC pressure with object pooling.
   *  */
  mutate: (input: G, output: G) => void
  /**
   * default 0.5
   * chance of doing mutation, otherwise will do crossover
   * */
  mutationRate?: number
  /**
   * The child should be updated in-place.
   * This design can reduce GC pressure with object pooling.
   *  */
  crossover: (aParent: G, bParent: G, child: G) => void
  /**
   * higher is better
   * */
  fitness: (gene: G) => number
  /**
   * default only compare the fitness
   * custom function should consider both distance and fitness
   * */
  doesABeatB?: (a: G, b: G) => boolean
  population?: G[]
  /**
   * default 100
   * should be even number
   * */
  populationSize?: number
  /**
   * default randomly pick a gene from the population than mutate
   * */
  randomIndividual?: () => G
  /**
   * return floating number from 0 to 1 inclusively
   * default Math.random()
   * */
  random?: () => number
}

export type AsyncOptions<G> = Omit<Options<G>, 'fitness' | 'doesABeatB'> & {
  fitness: (gene: G) => Promise<number>
  doesABeatB?: (a: G, b: G) => Promise<boolean>
}
```

</details>

<details>
<summary>
Helper functions for ga-island in `ga-island`:
</summary>

```typescript
/**
 * inplace populate the options.population gene pool
 * */
export function populate<G>(options: FullOptions<G>): void

/**
 * Apply default options and populate when needed
 * */
export function populateOptions<G>(_options: RequiredOptions<G>): FullOptions<G>

/**
 * Apply default options and populate when needed for async options
 * */
export function populateOptionsAsync<G>(
  _options: RequiredAsyncOptions<G>,
): FullAsyncOptions<G>

/**
 * generate a not-bad doesABeatB() function for kick-starter
 * should use custom implement according to the context
 * */
export function genDoesABeatB<G>(options: {
  /**
   * higher is better,
   * zero or negative is failed gene
   * */
  fitness: (gene: G) => number
  distance: (a: G, b: G) => number
  min_distance: number
  /**
   * return float value from 0 to 1 inclusively
   * as chance to change the Math.random() implementation
   * */
  random?: Random
}): (a: G, b: G) => boolean

export function best<G>(options: {
  population: G[]
  fitness: (gene: G) => number
}): {
  gene: G
  fitness: number
}

export async function bestAsync<G>(options: {
  population: G[]
  fitness: (gene: G) => Promise<number>
}): Promise<{
  gene: G
  fitness: number
}>

export function maxIndex(scores: number[]): number
```

</details>

<details>
<summary>
Helper functions for random in `ga-island`:
</summary>

```typescript
/**
 * return float value from 0 to 1 inclusively
 * */
export type Random = () => number

/**
 * @param random  custom implementation of Math.random()
 * @param min     inclusive lower bound
 * @param max     inclusive upper bound
 * @param step    interval between each value
 * */
export function randomNumber(
  random: Random,
  min: number,
  max: number,
  step: number,
): number

export function randomElement<T>(random: Random, xs: T[]): T
/**
 * @param random        custom implementation of Math.random()
 * @param probability   change of getting true
 * */
export function randomBoolean(random: Random, probability?: number): boolean

/**
 * in-place shuffle the order of elements in the array
 * */
export function shuffleArray<T>(random: Random, xs: T[]): void
```

</details>

<details>
<summary>
Helper class for worker thread in `ga-island/thread-pool`:
</summary>

```typescript
import { Worker } from 'worker_threads'

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

  dispatch<T, R>(inputs: T[]): Promise<R[]>
  dispatch<T, R>(inputs: T[], cb: (err: any, outputs: R[]) => void): void

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
  )

  close(): void
}
```

</details>

## Remark

[panchishin/geneticalgorithm](https://github.com/panchishin/geneticalgorithm) is a non-traditional genetic algorithm implementation.

It doesn't sort the population by fitness when evolving into next generation.

Instead, it randomly picks a pair of 'parent genes',
and randomly choose one 'parent' to become the 'child',
and merge two 'parents' into another 'child'.

In `ga-island`, only the 'stronger parent' in the pair can survive to next generation. Another child is the mutation result of the 'stronger parent', or the crossover result of the 'stronger parent' and another random parent.

Also, in `panchishin/geneticalgorithm`, the mutation v.s. crossover probability is 50%,
which is much higher than traditional setting where mutation is relative rare.
(Custom probability is supported in `ga-island`)

## Performance

To better speed up the evolution iteration,
the fitness of the population can be calculated in multiple processes or threads.

However, node.js doesn't allow shared memory across process,
the IO cost may become the bottleneck. Therefore, you're recommended to use worker threads when it is supported in your node version.

<details>
<summary> <b>Example Benchmark on ThreadPool</b> <i>(click to expand)</i>
</summary>

Experiment setup:

```
Fitness function: sha256 hash
Population Size: 20,000
Max Generation: 100 * [num of process/thread]
```

Testing machine:

```
Architecture:                    x86_64
CPU op-mode(s):                  32-bit, 64-bit
CPU(s):                          8
Thread(s) per core:              2
Core(s) per socket:              4
Model name:                      Intel(R) Xeon(R) CPU E3-1230 V2 @ 3.30GHz
CPU MHz:                         1615.729
CPU max MHz:                     3700.0000
CPU min MHz:                     1600.0000

Node Version:                    v14.17.0
```

source code: [speed-test.ts](./test/speed-test.main.ts)

Single-core baseline: 2.378 gen/sec

| Number of Process | Speed\* | Speed Up Rate | Parallelize Rate |
| ----------------- | ------- | ------------- | ---------------- |
| 1                 | 2.880   | -             | -                |
| 2                 | 4.208   | 1.461         | 0.731            |
| 3                 | 5.024   | 1.744         | 0.581            |
| 4                 | 6.055   | 2.102         | 0.526            |
| 5                 | 6.197   | 2.152         | 0.430            |
| 6                 | 6.309   | 2.191         | 0.365            |
| 7                 | 7.443   | 2.584         | 0.369            |
| 8                 | 7.682   | 2.667         | 0.333            |

| Number of Thread | Speed\* | Speed Up Rate | Parallelize Rate |
| ---------------- | ------- | ------------- | ---------------- |
| 1                | 2.884   | -             | -                |
| 2                | 4.749   | 1.647         | 0.823            |
| 3                | 6.323   | 2.192         | 0.731            |
| 4                | 6.057   | 2.100         | 0.525            |
| 5                | 6.384   | 2.214         | 0.443            |
| 6                | 7.284   | 2.526         | 0.421            |
| 7                | 7.169   | 2.486         | 0.355            |
| 8                | 7.512   | 2.605         | 0.326            |

\*: Generation per second, higher better

</details>

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
