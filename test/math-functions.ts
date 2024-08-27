import { basename } from 'path'
import { GaIsland, best } from '../src'

let { cos, PI } = Math

export function sphere(xs: number[]): number {
  let n = xs.length
  let acc = 0
  for (let i = 0; i < n; i++) {
    let x = xs[i]
    acc += x * x
  }
  return acc
}

export function rastrigin(xs: number[]): number {
  let n = xs.length
  let acc = 10 * n
  for (let i = 0; i < n; i++) {
    let x = xs[i]
    acc += x * x - 10 * cos(2 * PI * x)
  }
  return acc
}

export function rosenbrock(xs: number[]): number {
  let n = xs.length
  let acc = 10 * n
  for (let i = 0; i < n - 1; i++) {
    acc += 100 * (xs[i + 1] - xs[i] ** 2) ** 2 + (xs[i] - 1) ** 2
  }
  return acc
}

export async function test() {
  type Gene = number[]
  let n = 10
  let epochs = 500
  let f = rastrigin
  let ga = new GaIsland<Gene>({
    randomIndividual() {
      return new Array(n).fill(0).map(() => (Math.random() * 2 - 1) * 100)
    },
    fitness(gene) {
      return -f(gene)
    },
    crossover(aParent, bParent, child) {
      for (let i = 0; i < n; i++) {
        let r = Math.random()
        child[i] = r * aParent[i] + (1 - r) * bParent[i]
      }
    },
    mutate(input, output) {
      for (let i = 0; i < n; i++) {
        output[i] = input[i] + (Math.random() * 2 - 1)
        // output[i] = Math.random() * 2 - 1
      }
    },
  })
  for (let i = 1; i <= epochs; i++) {
    ga.evolve()
    let { gene, fitness } = best(ga.options)
    let loss = -fitness
    console.log({
      i,
      loss,
      gene,
    })
    // await new Promise(resolve => setTimeout(resolve, 33))
  }
}

if (basename(process.argv[1]) == basename(__filename)) {
  test()
}
