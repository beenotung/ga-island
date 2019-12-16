import { best, GaIsland } from "../src";


export let islands = [
  [0.5, 0.5],                                      // upper left
  [2.5, 0.5], [4.5, 0.5], [6.5, 0.5], [8.5, 0.5],  // x column
  [0.5, 2.5], [0.5, 4.5], [0.5, 6.5], [0.5, 8.5],  // y column
  [8.5, 8.5]];                                     // sweet spot

export type Gene = {
  x: number
  y: number
}

export function sqr(x: number) {
  return Math.pow(x, 2);
}

export function cloneJSON(item: Gene): Gene {
  return {
    x: item.x,
    y: item.y
  };
}


// ********************** GENETIC ALGO FUNCTIONS *************************


export function mutationFunction(phenotype: Gene): Gene {
  return {
    x: phenotype.x + 3 * (Math.random() * 2 - 1) * (Math.random() * 2 - 1) * (Math.random() * 2 - 1),
    y: phenotype.y + 3 * (Math.random() * 2 - 1) * (Math.random() * 2 - 1) * (Math.random() * 2 - 1)
  };
}

export function crossoverFunction(a: Gene, b: Gene): [Gene, Gene] {
  let x = cloneJSON(a);
  let y = cloneJSON(b);
  x.x = b.x;
  y.y = a.y;
  return Math.random() < .5 ? [x, y] : [y, x];
}

export function positionScore(x: number, y: number): number {
  return islands.map(function(island) {
    let islandValue = island[0] / 2. + island[1];
    let distance = Math.sqrt((sqr(x - island[0]) + sqr(y - island[1])) / 2);
    if (distance > .4) {
      return -10;
    }
    return Math.min(.4, .5 - distance) * islandValue;
  }).reduce(function(a, b) {
    return Math.max(a, b);
  }) * 10;
}

export function fitnessFunction(phenotype: Gene) {
  return positionScore(phenotype.x, phenotype.y);
}


//  This function implements genetic diversity.
export function doesABeatBFunction(a: Gene, b: Gene): boolean {
  let aScore = fitnessFunction(a);
  let bScore = fitnessFunction(b);
  let distance = Math.sqrt(sqr(a.x - b.x) + sqr(a.y - b.y));

  // if b isn't on an island and 'a' is, then a wins
  if (aScore >= 0 && bScore < 0) return true;

  // if a isn't on an island, it can't beat b
  if (aScore < 0) return false;

  // if it is far away, then there is little chance
  if (distance > 2 && Math.random() > .1 / distance) return false;

  // otherwise, a beats b by the margin of difference
  return aScore >= bScore;
}


export function findBest(options: {
  population: Gene[];
  fitness: (gene: Gene) => number;
}): Gene {
  return best<Gene>(options).gene;
}
