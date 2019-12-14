# ga-island

Genetic Algorithm with 'island' Diversity control.

[![npm Package Version](https://img.shields.io/npm/v/ga-island.svg?maxAge=2592000)](https://www.npmjs.com/package/ga-island)

Inspired from https://github.com/panchishin/geneticalgorithm

## Features
- [x] Typescript Typing
- [ ] Support custom methods to improve efficiency
- [ ] Support dynamic adjustment on mutation rate
- [ ] Utilize multi-processor to speed up

## Remark
panchishin/geneticalgorith is a non-traditional genetic algorithm implementation.

It doesn't sort the population by fitness when making next generation.

Instead, it randomly picks a pair of 'parent genes',
and randomly choose one 'parent' to become the 'child',
and merge two 'parents' into another 'child'.

Also, the mutation v.s. crossover probability is 50%,
which is much higher than traditional setting where mutation is relative rare.
