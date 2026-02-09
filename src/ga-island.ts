import { randomElement, shuffleArray } from './utils/random'

export type Options<G extends object> = {
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
export type AsyncOptions<G extends object> = Omit<
  Options<G>,
  'fitness' | 'doesABeatB'
> & {
  fitness: (gene: G) => Promise<number>
  doesABeatB?: (a: G, b: G) => Promise<boolean>
}
type PopulationOptions<G extends object> =
  | {
      population: G[]
    }
  | {
      randomIndividual: () => G
    }

export type RequiredOptions<G extends object> = Options<G> &
  PopulationOptions<G>
export type RequiredAsyncOptions<G extends object> = AsyncOptions<G> &
  PopulationOptions<G>

export type FullOptions<G extends object> = Required<Options<G>>
export type FullAsyncOptions<G extends object> = Required<AsyncOptions<G>>

/**
 * in-place populate the options.population gene pool
 * */
export function populate<G extends object>(
  options: FullOptions<G> | FullAsyncOptions<G>,
) {
  while (options.population.length < options.populationSize) {
    options.population.push(options.randomIndividual())
  }
}

function populateOptionsHelper<G extends object>(
  _options: RequiredOptions<G>,
): FullOptions<G>
function populateOptionsHelper<G extends object>(
  _options: RequiredAsyncOptions<G>,
): FullAsyncOptions<G>
function populateOptionsHelper<G extends object>(
  _options: RequiredOptions<G> | RequiredAsyncOptions<G>,
): FullOptions<G> | FullAsyncOptions<G> {
  let {
    mutationRate,
    doesABeatB,
    population,
    populationSize,
    randomIndividual,
    random,
  } = _options
  /* eslint-disable-next-line prefer-const */
  let fullOptions = _options as FullOptions<G> | FullAsyncOptions<G>
  if (!mutationRate) {
    mutationRate = 0.5
  }
  if (doesABeatB!.length !== 2) {
    throw new TypeError('doesABeatB() should takes 2 arguments')
  }
  if (!populationSize) {
    populationSize = population ? population.length : 100
  }
  if (populationSize < 1) {
    throw new Error('zero population')
  }
  if (!population) {
    if (!randomIndividual) {
      throw new Error('missing randomIndividual in options')
    }
    population = []
  }
  if (!randomIndividual) {
    randomIndividual = () => {
      if (!fullOptions.population || fullOptions.population.length < 1) {
        throw new Error('no population for randomIndividual to seed from')
      }
      const gene = {
        ...randomElement(fullOptions.random, fullOptions.population),
      }
      fullOptions.mutate(gene, gene)
      return gene
    }
  }
  if (randomIndividual.length !== 0) {
    throw new TypeError('randomIndividual() should takes no arguments')
  }
  if (!random) {
    random = Math.random
  }
  if (random.length !== 0) {
    throw new TypeError('random() should takes no arguments')
  }
  if (_options.mutate.length !== 2) {
    throw new TypeError('mutate() should takes 2 arguments')
  }
  if (_options.crossover.length !== 3) {
    throw new TypeError('mutate() should takes 3 arguments')
  }
  fullOptions = {
    ..._options,
    mutationRate,
    doesABeatB: doesABeatB!,
    population,
    populationSize,
    randomIndividual,
    random,
  } as FullOptions<G> | FullAsyncOptions<G>
  populate(fullOptions)
  return fullOptions
}

/**
 * Apply default options and populate when needed
 * */
export function populateOptions<G extends object>(
  _options: RequiredOptions<G>,
): FullOptions<G> {
  let { doesABeatB } = _options
  /* eslint-disable-next-line prefer-const */
  let fullOptions: FullOptions<G>
  if (!doesABeatB) {
    doesABeatB = (a, b) => {
      return fullOptions.fitness(a) >= fullOptions.fitness(b)
    }
  }
  fullOptions = populateOptionsHelper({
    ..._options,
    doesABeatB,
  })
  return fullOptions
}

/**
 * Apply default options and populate when needed
 * */
export function populateOptionsAsync<G extends object>(
  _options: RequiredAsyncOptions<G>,
): FullAsyncOptions<G> {
  let { doesABeatB } = _options
  /* eslint-disable-next-line prefer-const */
  let fullOptions: FullAsyncOptions<G>
  if (!doesABeatB) {
    doesABeatB = async (a, b) => {
      const aFitness = await fullOptions.fitness(a)
      const bFitness = await fullOptions.fitness(b)
      return aFitness >= bFitness
    }
  }
  fullOptions = populateOptionsHelper({
    ..._options,
    doesABeatB,
  })
  return fullOptions
}

export class GaIsland<G extends object> {
  options: FullOptions<G>

  constructor(options: RequiredOptions<G>) {
    this.options = populateOptions(options)
  }

  randomizePopulationOrder() {
    shuffleArray(this.options.random, this.options.population)
  }

  /**
   * should run populate() before invoking this function,
   * therefore assume options.population size is aligned with options.populationSize
   * */
  compete() {
    const n = this.options.populationSize
    const population = this.options.population
    const end = n - 1
    for (let i = 0; i < end; i += 2) {
      const gene = population[i]
      const competitor = population[i + 1]
      if (!this.options.doesABeatB(gene, competitor)) {
        // competitor is stronger than current gene, or too far from this gene
        continue
      }
      // competitor is weaker than the current gene, will reuse the competitor for new gene
      if (this.options.random() < this.options.mutationRate) {
        // mutate the gene, store the result on weak competitor
        this.options.mutate(gene, competitor)
      } else {
        // crossover the gene with a random parent, store the result on weak competitor
        const parent2 = randomElement(
          this.options.random,
          this.options.population,
        )
        this.options.crossover(gene, parent2, competitor)
      }
    }
  }

  /**
   * internally calls `this.randomizePopulationOrder()` and `this.compete()`
   */
  evolve() {
    this.randomizePopulationOrder()
    this.compete()
  }
}

export class GaIslandAsync<G extends object> {
  options: FullAsyncOptions<G>

  constructor(options: RequiredAsyncOptions<G>) {
    this.options = populateOptionsAsync(options)
  }

  randomizePopulationOrder() {
    shuffleArray(this.options.random, this.options.population)
  }

  /**
   * should run populate() before invoking this function,
   * therefore assume options.population size is aligned with options.populationSize
   * */
  async compete() {
    const n = this.options.populationSize
    const population = this.options.population
    const end = n - 1
    for (let i = 0; i < end; i += 2) {
      const gene = population[i]
      const competitor = population[i + 1]
      if (!(await this.options.doesABeatB(gene, competitor))) {
        // competitor is stronger than current gene, or too far from this gene
        continue
      }
      // competitor is weaker than the current gene, will reuse the competitor for new gene
      if (this.options.random() < this.options.mutationRate) {
        // mutate the gene, store the result on weak competitor
        this.options.mutate(gene, competitor)
      } else {
        // crossover the gene with a random parent, store the result on weak competitor
        const parent2 = randomElement(
          this.options.random,
          this.options.population,
        )
        this.options.crossover(gene, parent2, competitor)
      }
    }
  }

  /**
   * internally calls `this.randomizePopulationOrder()` and `this.competeAsync()`
   */
  async evolve() {
    this.randomizePopulationOrder()
    await this.compete()
  }
}
