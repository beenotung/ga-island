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

## Usage Example

```typescript
import { RequiredOptions, GaIsland } from 'ga-island';

type Gene = string;

let options: RequiredOptions<Gene> = {
  populationSize: 100, // shoud be even numner, default 100
  randomIndividual: (): Gene => '...',
  mutationRate: 0.5, // chance of mutation, otherwise will do crossover, default 0.5
  mutate: (gene: Gene): Gene => '...',
  crossover: (a: Gene, b: Gene): [Gene, Gene] => ['...', '...'],
  fitness: (gene: Gene) => 1, // higher is better
  doesABeatB: (a: Gene, b: Gene): boolean => true,  // default only compare by fitness, custom function can consider both distance and fitness
  random: Math.random, // optional, return floating number from 0 to 1 inclusively
};

let ga = new GaIsland(options);
for (let generation = 1; generation <= 100 ; generation++) {
  ga.evolve();
  let { gene, fitness } = best(ga.options);
  console.log({ generation, fitness, gene });
}
```

More examples:
- [(frog) islandHop](./examples)
- [ga-island.spec.ts](./test/ga-island.spec.ts)
- [speed-test.master.ts](./test/speed-test.master.ts), [speed-test.thread-worker.ts](./test/speed-test.thread-worker.ts), [speed-test.process-worker.ts](./test/speed-test.process-worker.ts)

## Typescript Signature

Core types and class:
```typescript
export class GaIsland<G> {
  options: FullOptions<G>;
  constructor(options: RequiredOptions<G>);
  evolve(): void;
}

export type RequiredOptions<G> = Options<G> & ({
  population: G[];
} | {
  randomIndividual: () => G;
});

export type FullOptions<G> = Required<Options<G>>;

export type Options<G> = {
    mutate: (gene: G) => G;
    /**
     * default 0.5
     * chance of doing mutation, otherwise will do crossover
     * */
    mutationRate?: number;
    crossover: (a: G, b: G) => [G, G];
    /**
     * higher is better
     * */
    fitness: (gene: G) => number;
    /**
     * default only compare the fitness
     * custom function should consider both distance and fitness
     * */
    doesABeatB?: (a: G, b: G) => boolean;
    population?: G[];
    /**
     * default 100
     * should be even number
     * */
    populationSize?: number;
    /**
     * default randomly pick a gene from the population than mutate
     * */
    randomIndividual?: () => G;
    /**
     * return floating number from 0 to 1 inclusively
     * default Math.random()
     * */
    random?: () => number;
};
```

Helper functions for ga-island:
```typescript
/**
 * inplace populate the options.population gene pool
 * */
export function populate<G>(options: FullOptions<G>): void;

/**
 * Apply default options and populate when needed
 * */
export function populateOptions<G>(_options: RequiredOptions<G>): FullOptions<G>;

/**
 * generate a not-bad doesABeatB() function for kick-starter
 * should use custom implement according to the context
 * */
export function genDoesABeatB<G>(options: {
  /**
   * higher is better,
   * zero or negative is failed gene
   * */
  fitness: (gene: G) => number;
  distance: (a: G, b: G) => number;
  min_distance: number;
  /**
   * return float value from 0 to 1 inclusively
   * as chance to change the Math.random() implementation
   * */
  random?: Random;
}): (a: G, b: G) => boolean;

export function best<G>(options: {
  population: G[];
  fitness: (gene: G) => number;
}): {
  gene: G;
  fitness: number;
};

export function maxIndex(scores: number[]): number;
```

Helper functions for random:
```typescript
/**
 * return float value from 0 to 1 inclusively
 * */
export type Random = () => number;

/**
 * @param random  custom implementation of Math.random()
 * @param min     inclusive lower bound
 * @param max     inclusive upper bound
 * @param step    interval between each value
 * */
export function randomNumber(random: Random, min: number, max: number, step: number): number;

export function randomElement<T>(random: Random, xs: T[]): T;
/**
 * @param random        custom implementation of Math.random()
 * @param probability   change of getting true
 * */
export function randomBoolean(random: Random, probability?: number): boolean;

/**
 * in-place shuffle the order of elements in the array
 * */
export function shuffleArray<T>(random: Random, xs: T[]): void;
```

## Remark
[panchishin/geneticalgorithm](https://github.com/panchishin/geneticalgorithm) is a non-traditional genetic algorithm implementation.

It doesn't sort the population by fitness when making next generation.

Instead, it randomly picks a pair of 'parent genes',
and randomly choose one 'parent' to become the 'child',
and merge two 'parents' into another 'child'.

Also, the mutation v.s. crossover probability is 50%,
which is much higher than traditional setting where mutation is relative rare.
(Custom probability is supported in this implementation)

## Performance

To better speed up the evolution iteration,
the fitness of the population can be calculated in multiple processes or threads.

However, node.js doesn't allow shared memory across process,
the IO cost may become the bottleneck. Therefore, you're recommended to use worker threads when it is supported in your node version.

Speed up of an example (IO-Heavy)
```
Fitness function: sha256 value
Population Size: 20,000
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
```


| Number of Process | Speed* | Speed Up Rate | Parallelize Rate |
|-------------------|--------|---------------|------------------|
| 1                 | 2.013  | -             | -                |
| 2                 | 3.244  | 1.612         | 0.806            |
| 3                 | 4.002  | 1.988         | 0.663            |
| 4                 | 4.338  | 2.155         | 0.539            |
| 5                 | 4.183  | 2.078         | 0.519            |
| 6                 | 4.436  | 2.204         | 0.551            |
| 7                 | 4.796  | 2.383         | 0.596            |
| 8                 | 4.803  | 2.386         | 0.596            |

| Number of Thread  | Speed* | Speed Up Rate | Parallelize Rate |
|-------------------|--------|---------------|------------------|
| 1                 | 1.954  | -             | -                |
| 2                 | 3.482  | 1.782         | 0.891            |
| 3                 | 4.507  | 2.307         | 0.769            |
| 4                 | 4.775  | 2.444         | 0.611            |
| 5                 | 4.622  | 2.365         | 0.591            |
| 6                 | 4.942  | 2.529         | 0.632            |
| 7                 | 5.085  | 2.602         | 0.651            |
| 8                 | 5.412  | 2.770         | 0.692            |

*: Generation per second, higher better

## TODO

- [x] Try to use worker thread with shared memory
