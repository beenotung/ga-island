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

## Remark
panchishin/geneticalgorith is a non-traditional genetic algorithm implementation.

It doesn't sort the population by fitness when making next generation.

Instead, it randomly picks a pair of 'parent genes',
and randomly choose one 'parent' to become the 'child',
and merge two 'parents' into another 'child'.

Also, the mutation v.s. crossover probability is 50%,
which is much higher than traditional setting where mutation is relative rare.
(Custom probability is supported in this implementation)

## Performance

To better speed up the evolution iteration,
the fitness of the population can be calculated in multiple processes.

However, node.js doesn't allow shared memory across process,
the IO cost may becomes the bottleneck.

Speed up of an example (IO-Heavy)
Fitness function: sha256 value
Population Size: 20,000

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
