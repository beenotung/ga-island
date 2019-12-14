export type Options<G> = {
  mutate: (gene: G) => G

  crossover: (a: G, b: G) => [G, G]

  // higher is better
  fitness: (gene: G) => number

  doesABeatB?: (a: G, b: G) => boolean

  population?: G[]

  populationSize?: number

  randomIndividual?: () => G
}
export type RequiredOptions<G> = Options<G> & ({
  population: G[]
} | {
  populationSize: number

  randomIndividual: () => G
} | {})
export type FullOptions<G> = Required<Options<G>>

export function populateOptions<G>(options: RequiredOptions<G>): FullOptions<G> {
  let {
    doesABeatB,
    population,
    populationSize,
    randomIndividual
  } = options
  if (!doesABeatB) {
    doesABeatB = (a, b) => {
      return options.fitness(a) >= options.fitness(b)
    }
  }
  if (!population) {
    if (!options.populationSize) {
      throw new Error('missing populationSize in options')
    }
    if (!options.randomIndividual) {
      throw new Error('missing randomIndividual in options')
    }
    let n = options.populationSize
    population = new Array(n)
    for (let i = 0; i < n; i++) {
      population[i] = options.randomIndividual()
    }
  }
  if (!populationSize) {
    populationSize = population.length
  }
  if (populationSize < 1) {
    throw new Error('zero population')
  }
  if (!randomIndividual) {
    if (population.length < 1) {
      throw new Error('no initial population for randomIndividual to seed from')
    }
    randomIndividual = () => {
      return {} as G
    }
  }
  while (population.length < populationSize) {
    population.push(randomIndividual())
  }
  return options = {
    ...options,
    doesABeatB,
    population,
    populationSize,
    randomIndividual,
  }
}

export class GaIsland<GenoTypes> {
  constructor(public options: Options<GenoTypes>) {
  }

  populate() {
  }

  randomizePopulationOrder() {
  }

  compete() {
  }

  evolve() {
    this.populate()
    this.randomizePopulationOrder()
    this.compete()
  }
}
