/**
 * @param min   inclusive lower bound
 * @param max   inclusive upper bound
 * @param step  interval between each value
 * */
export function randomNumber(min: number, max: number, step: number) {
  let range = (max - min) / step + 1
  return Math.floor(Math.random() * range) * step + min
}
