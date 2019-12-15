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

Testing machine:
```
Architecture:                    x86_64
CPU op-mode(s):                  32-bit, 64-bit
Byte Order:                      Little Endian
Address sizes:                   36 bits physical, 48 bits virtual
CPU(s):                          8
On-line CPU(s) list:             0-7
Thread(s) per core:              2
Core(s) per socket:              4
Socket(s):                       1
NUMA node(s):                    1
Vendor ID:                       GenuineIntel
CPU family:                      6
Model:                           58
Model name:                      Intel(R) Xeon(R) CPU E3-1230 V2 @ 3.30GHz
Stepping:                        9
CPU MHz:                         1615.729
CPU max MHz:                     3700.0000
CPU min MHz:                     1600.0000
BogoMIPS:                        6587.28
Virtualization:                  VT-x
L1d cache:                       128 KiB
L1i cache:                       128 KiB
L2 cache:                        1 MiB
L3 cache:                        8 MiB
NUMA node0 CPU(s):               0-7
```


| Number of Process | Speed* | Speed Up Rate | Parallelize Rate |
|-------------------|--------|---------------|------------------|
| 1                 | 1.774  | -             | -                |
| 2                 | 2.839  | 1.600         | 0.8              |
| 3                 | 3.342  | 1.884         | 0.628            |
| 4                 | 4.084  | 2.302         | 0.576            |
| 5                 | 4.707  | 2.653         | 0.663            |
| 6                 | 4.054  | 2.285         | 0.571            |
| 7                 | 4.238  | 2.389         | 0.597            |
| 8                 | 4.418  | 2.490         | 0.622            |

*: Generation per second, higher better

## TODO

- [ ] Try to use worker pool with shared pool
- [ ] Re-implement in other compiled language, e.g. Golang, Java/Clojure/Scala
