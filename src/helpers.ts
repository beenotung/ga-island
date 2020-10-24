import { Random } from './utils/random';

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
  /**
   * normalized to 0..1 ?
   * */
  distance: (a: G, b: G) => number;
  min_distance: number;
  random?: Random;
}): (a: G, b: G) => boolean {
  return function doesABeatB(a: G, b: G): boolean {
    const aScore = options.fitness(a);
    if (aScore <= 0) {
      return false;
    }
    // aScore > 0
    const bScore = options.fitness(b);
    if (bScore <= 0) {
      return true;
    }
    const distance = options.distance(a, b);
    if (
      distance >= options.min_distance &&
      (options.random || Math.random)() > 0.1 / distance
    ) {
      return false;
    }
    return aScore > bScore;
  };
}

export function best<G>(options: {
  population: G[];
  fitness: (gene: G) => number;
}): { gene: G; fitness: number } {
  const n = options.population.length;
  if (n === 0) {
    throw new Error('empty population');
  }
  let bestGene = options.population[0];
  let bestFitness = options.fitness(bestGene);
  for (let i = 1; i < n; i++) {
    const gene = options.population[i];
    const fitness = options.fitness(gene);
    if (fitness > bestFitness) {
      bestFitness = fitness;
      bestGene = gene;
    }
  }
  return {
    gene: bestGene,
    fitness: bestFitness,
  };
}

export function maxIndex(scores: number[]): number {
  const n = scores.length;
  if (n === 0) {
    throw new Error('empty array');
  }
  let maxIdx = 0;
  let maxScore = scores[0];
  for (let idx = 1; idx < n; idx++) {
    const score = scores[idx];
    if (score > maxScore) {
      maxScore = score;
      maxIdx = idx;
    }
  }
  return maxIdx;
}
