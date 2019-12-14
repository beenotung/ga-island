/**
 * generate a not-bad doesABeatB() function for kick-starter
 * should use custom implement according to the context
 * */
import { Random } from './utils/random';

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
