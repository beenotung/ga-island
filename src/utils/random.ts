/**
 * return float value from 0 to 1 inclusively
 * as chance to change the Math.random() implementation
 * */
export type Random = () => number;

/**
 * @param random  custom implementation of Math.random()
 * @param min     inclusive lower bound
 * @param max     inclusive upper bound
 * @param step    interval between each value
 * */
export function randomNumber(
  random: Random,
  min: number,
  max: number,
  step: number,
) {
  const range = (max - min) / step + 1;
  return Math.floor(random() * range) * step + min;
}

export function randomElement<T>(random: Random, xs: T[]): T {
  const idx = Math.floor(random() * xs.length);
  return xs[idx];
}

/**
 * @param random        custom implementation of Math.random()
 * @param probability   change of getting true
 * */
export function randomBoolean(
  random: Random,
  probability: number = 0.5,
): boolean {
  return random() < probability;
}

/**
 * in-place shuffle the order of elements in the array
 * */
export function shuffleArray<T>(random: Random, xs: T[]): void {
  const n = xs.length;
  for (let i = 0; i < n; i++) {
    const j = Math.floor(random() * n);
    const temp = xs[i];
    xs[i] = xs[j];
    xs[j] = temp;
  }
}
