export let { log } = console;
export let { random } = Math;
export let print = process.stdout.write.bind(process.stdout);
export { inspect } from 'util';
export { appendFileSync } from 'fs';

export function roundNumber(x: number, decimal: number): string {
  let p = Math.pow(10, decimal);
  let res = (Math.round(x * p) / p).toString();
  let ss = res.split('.');
  if (ss.length === 1) {
    return res + '.' + '0'.repeat(decimal);
  }
  return res + '0'.repeat(decimal - ss[1].length);
}
