import { createHash } from 'crypto';

// [id, payload]
export type Gene = [number, string];

export function hash(s: string): string {
  let h = createHash('sha256');
  h.write(s);
  let bin = h.digest();
  h.end();
  s = bin.toString('hex');
  return s;
}

export let n = hash('').length;
