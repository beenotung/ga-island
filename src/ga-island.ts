import { randomBoolean, randomElement, shuffleArray } from './utils/random';

export type Options<G> = {
  mutate: (gene: G) => G;

  /**
   * default 0.5
   * chance of doing mutation, otherwise will do crossover
   * */
  mutationRate?: number;

  crossover: (a: G, b: G) => G;

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
export type RequiredOptions<G> = Options<G> &
  (
    | {
        population: G[];
      }
    | {
        randomIndividual: () => G;
      }
  );
export type FullOptions<G> = Required<Options<G>>;

/**
 * inplace populate the options.population gene pool
 * */
export function populate<G>(options: FullOptions<G>) {
  while (options.population.length < options.populationSize) {
    options.population.push(options.randomIndividual());
  }
}

/**
 * Apply default options and populate when needed
 * */
export function populateOptions<G>(
  _options: RequiredOptions<G>,
): FullOptions<G> {
  let {
    mutationRate,
    doesABeatB,
    population,
    populationSize,
    randomIndividual,
    random,
  } = _options;
  let fullOptions: FullOptions<G>;
  if (!mutationRate) {
    mutationRate = 0.5;
  }
  if (!doesABeatB) {
    doesABeatB = (a, b) => {
      return fullOptions.fitness(a) >= fullOptions.fitness(b);
    };
  }
  if (!populationSize) {
    populationSize = population ? population.length : 100;
  }
  if (populationSize < 1) {
    throw new Error('zero population');
  }
  if (!population) {
    if (!randomIndividual) {
      throw new Error('missing randomIndividual in options');
    }
    population = [];
  }
  if (!randomIndividual) {
    randomIndividual = () => {
      if (!fullOptions.population || fullOptions.population.length < 1) {
        throw new Error('no population for randomIndividual to seed from');
      }
      const gene = randomElement(fullOptions.random, fullOptions.population);
      return fullOptions.mutate(gene);
    };
  }
  if (!random) {
    random = Math.random;
  }
  fullOptions = {
    ..._options,
    mutationRate,
    doesABeatB,
    population,
    populationSize,
    randomIndividual,
    random,
  };
  populate(fullOptions);
  return fullOptions;
}

export class GaIsland<G> {
  options: FullOptions<G>;

  constructor(options: RequiredOptions<G>) {
    this.options = populateOptions(options);
  }

  randomizePopulationOrder() {
    shuffleArray(this.options.random, this.options.population);
  }

  /**
   * should run populate() before invoking this function,
   * therefore assume options.population size is aligned with options.populationSize
   * */
  compete() {
    const n = this.options.populationSize;
    const nextGeneration = new Array(n);
    const end = n - 1;
    for (let i = 0; i < end; i += 2) {
      const gene = this.options.population[i];
      const competitor = this.options.population[i + 1];
      nextGeneration[i] = gene;
      let child: G;
      if (this.options.doesABeatB(gene, competitor)) {
        // competitor is weaker than current gene
        if (randomBoolean(this.options.random, this.options.mutationRate)) {
          child = this.options.mutate(gene);
        } else {
          child = this.options.crossover(
            gene,
            randomElement(this.options.random, this.options.population),
          );
        }
      } else {
        // competitor is stronger than current gene
        child = competitor;
      }
      nextGeneration[i + 1] = child;
    }
    this.options.population = nextGeneration;
  }

  evolve() {
    this.randomizePopulationOrder();
    this.compete();
  }
}
