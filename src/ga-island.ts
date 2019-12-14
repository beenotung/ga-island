import { randomBoolean, randomElement, shuffleArray } from './utils/random';

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
  let {
    mutationRate,
    doesABeatB,
    population,
    populationSize,
    randomIndividual,
    random,
  } = options;
  if (!mutationRate) {
    mutationRate = 0.5;
  }
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
    population = [];
  }
  if (!randomIndividual) {
    randomIndividual = () => {
      if (!options.population || options.population.length < 1) {
        throw new Error('no population for randomIndividual to seed from');
      }
      const gene = randomElement(options.random!, options.population);
      return options.mutate(gene);
    };
  }
  if (!random) {
    random = Math.random;
  }
  return (options = {
    ...options,
    mutationRate,
    doesABeatB,
    population,
    populationSize,
    randomIndividual,
    random,
  });
}

export class GaIsland<G> {
  options: FullOptions<G>;

  /**
   * cached fitness
   * will be updated when call compete()
   * */
  private _scores?: number[];
  private _scoreDirty: boolean = true;

  constructor(options: RequiredOptions<G>) {
    this.options = populateOptions(options);
  }

  populate() {
    while (this.options.population.length < this.options.populationSize) {
      this.options.population.push(this.options.randomIndividual());
    }
  }

  randomizePopulationOrder() {
    shuffleArray(this.options.random, this.options.population);
  }

  evaluate(): number[] {
    const n = this.options.populationSize;
    let scores = this._scores;
    if (!scores || scores.length !== n) {
      scores = this._scores = new Array(n);
    }
    const population = this.options.population;
    for (let i = 0; i < n; i++) {
      scores[i] = this.options.fitness(population[i]);
    }
    this._scoreDirty = false;
    return scores;
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
          )[0];
        }
      } else {
        // competitor is stronger than current gene
        child = competitor;
      }
      nextGeneration[i + 1] = child;
    }
    this.options.population = nextGeneration;
    this._scoreDirty = true;
  }

  evolve() {
    this.populate();
    this.randomizePopulationOrder();
    this.compete();
  }

  getScores(): number[] {
    let scores = this._scores;
    if (this._scoreDirty || !scores) {
      scores = this.evaluate();
    }
    return scores;
  }

  best() {
    const scores = this.getScores();
    let maxIdx = 0;
    let maxScore = scores[0];
    const n = scores.length;
    for (let i = 1; i < n; i++) {
      const score = scores[i];
      if (score > maxScore) {
        maxScore = score;
        maxIdx = i;
      }
    }
    const gene = this.options.population[maxIdx];
    return { gene, fitness: maxScore };
  }
}
