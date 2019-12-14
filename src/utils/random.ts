/**
 * @param min   inclusive lower bound
 * @param max   inclusive upper bound
 * @param step  interval between each value
 * */
export function randomNumber(min: number, max: number, step: number) {
  const range = (max - min) / step + 1;
  return Math.floor(Math.random() * range) * step + min;
}

export function randomElement<T>(xs: T[]): T {
  const idx = randomNumber(0, xs.length - 1, 1);
  return xs[idx];
}

/**
 * @param probability   change of getting true
 * */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() <= probability;
}
