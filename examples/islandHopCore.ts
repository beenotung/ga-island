import { GaIsland } from '../src';
const { min, sqrt, pow, random } = Math;

export function newGa() {
  return new GaIsland<Gene>({
    populationSize: 500,
    population: [{ x: 0.3, y: 0.5 }],
    fitness,
    doesABeatB,
    mutate,
    crossover,
  });
}

export type Island = { x: number; y: number; score: number };

/* *
 *  3  7 11 15 19
 * 11
 * 19
 * 27
 * 35          51
 */
export const island_list: Island[] = [
  // upper left
  { x: 0.5, y: 0.5, score: 3 },
  // left column
  { x: 0.5, y: 2.5, score: 11 },
  { x: 0.5, y: 4.5, score: 19 },
  { x: 0.5, y: 6.5, score: 27 },
  { x: 0.5, y: 8.5, score: 35 },
  // upper row
  { x: 2.5, y: 0.5, score: 7 },
  { x: 4.5, y: 0.5, score: 11 },
  { x: 6.5, y: 0.5, score: 15 },
  { x: 8.5, y: 0.5, score: 19 },
  // sweet spot
  { x: 8.5, y: 8.5, score: 51 },
];

export type Gene = { x: number; y: number };

function distance(a: Gene, b: Gene): number {
  return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

// ********************** GENETIC ALGO FUNCTIONS *************************

function fitness(gene: Gene): number {
  let island = island_list.find(
    island =>
      gene.x >= island.x - 0.4 &&
      gene.x <= island.x + 0.4 &&
      gene.y >= island.y - 0.4 &&
      gene.y <= island.y + 0.4,
  );
  if (!island) return -10;
  return min(0.4, 0.5 - distance(gene, island)) * island.score;
}

function doesABeatB(a: Gene, b: Gene): boolean {
  let aScore = fitness(a);

  // if a isn't on an island, it can't beat b
  if (aScore < 0) return false;

  let bScore = fitness(b);

  // if b isn't on an island (and a is on an island), then a wins
  if (bScore < 0) return true;

  let dist = distance(a, b);

  // if they are far away, there is less chance
  if (dist > 2 && Math.random() > 0.1 / dist) return false;

  // otherwise, a beats b by the margin of difference
  return aScore >= bScore;
}

function mutate(input: Gene, output: Gene): void {
  output.x =
    input.x + 3 * (random() * 2 - 1) * (random() * 2 - 1) * (random() * 2 - 1);
  output.y =
    input.y + 3 * (random() * 2 - 1) * (random() * 2 - 1) * (random() * 2 - 1);
}

function crossover(aParent: Gene, bParent: Gene, child: Gene): void {
  child.x = random() < 0.5 ? aParent.x : bParent.x;
  child.y = random() < 0.5 ? aParent.y : bParent.y;
}
