import { createHash } from 'crypto'

// [id, payload]
export type Gene = [number, string]

export function hash(s: string): string {
  let h = createHash('sha256')
  h.write(s)
  let bin = h.digest()
  h.end()
  s = bin.toString('hex')
  return s
}

export let n = hash('').length

export function fitness(gene: Gene): number {
  let s = hash(gene[1])
  let acc = 0
  for (let i = 0; i < n; i++) {
    acc += parseInt(s[i], 16)
  }
  return acc
}
