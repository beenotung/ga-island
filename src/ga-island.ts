import { randomElement } from './utils/random';

export type Options<G> = {
  mutate: (gene: G) => G;

  crossover: (a: G, b: G) => [G, G];

  // higher is better
  fitness: (gene: G) => number;

  doesABeatB?: (a: G, b: G) => boolean;

  population?: G[];

  populationSize?: number;

  randomIndividual?: () => G;
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

export function populateOptions<G>(
  options: RequiredOptions<G>,
): FullOptions<G> {
  let { doesABeatB, population, populationSize, randomIndividual } = options;
  if (!doesABeatB) {
    doesABeatB = (a, b) => {
      return options.fitness(a) >= options.fitness(b);
    };
  }
  if (!populationSize) {
    populationSize = population ? population.length : 100;
  }
  if (populationSize < 1) {
    throw new Error('zero population');
  }
  if (!population) {
    if (!options.randomIndividual) {
      throw new Error('missing randomIndividual in options');
    }
    const n = populationSize;
    population = new Array(n);
    for (let i = 0; i < n; i++) {
      population[i] = options.randomIndividual();
    }
  }
  if (!randomIndividual) {
    randomIndividual = () => {
      if (!options.population || options.population.length < 1) {
        throw new Error('no population for randomIndividual to seed from');
      }
      const gene = randomElement(options.population);
      return options.mutate(gene);
    };
  }
  while (population.length < populationSize) {
    population.push(randomIndividual());
  }
  return (options = {
    ...options,
    doesABeatB,
    population,
    populationSize,
    randomIndividual,
  });
}

export class GaIsland<G> {
  options: FullOptions<G>;

  constructor(options: RequiredOptions<G>) {
    this.options = populateOptions(options);
  }

  populate() {
    // TODO
  }

  randomizePopulationOrder() {
    // TODO
  }

  compete() {
    // TODO
  }

  evolve() {
    this.populate();
    this.randomizePopulationOrder();
    this.compete();
  }
}
