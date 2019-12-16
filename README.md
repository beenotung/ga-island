# ga-island

Genetic Algorithm with 'island' Diversity control.

[![npm Package Version](https://img.shields.io/npm/v/ga-island.svg?maxAge=2592000)](https://www.npmjs.com/package/ga-island)

Simplified implementation with zero dependency.

Inspired from https://github.com/panchishin/geneticalgorithm

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
| 1                 | 2.081  | -             | -                |
| 2                 | 3.098  | 1.489         | 0.745            |
| 3                 | 3.983  | 1.914         | 0.638            |
| 4                 | 4.266  | 2.050         | 0.513            |
| 5                 | 4.202  | 2.019         | 0.505            |
| 6                 | 4.649  | 2.234         | 0.559            |
| 7                 | 4.966  | 2.386         | 0.597            |
| 8                 | 5.056  | 2.430         | 0.608            |

*: Generation per second, higher better

## TODO

- [x] Try to use worker thread with shared memory
- [ ] Re-implement in other compiled language, e.g. Golang, Java/Clojure/Scala

## Surprise

`child_process.fork` is more than 5 times faster than `worker_threads.Worker` in node.js v12.13.0.
That means IPC among processes is faster than as if they're multiple threads in the same processes.

Maybe due to accidentally triggered auto semaphore locking?
