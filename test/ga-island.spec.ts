import {
  FullOptions,
  GaIsland,
  GaIslandAsync,
  populateOptions,
} from '../src/ga-island'
import { expect } from 'chai'
import { best, bestAsync } from '../src'

describe('ga-island TestSuit', function () {
  let n = 60

  function randomBoolean() {
    return Math.random() < 0.5
  }

  type Gene = { pattern: string }

  function mutate(gene: Gene, output: Gene): void {
    let s = ''
    for (let i = 0; i < n; i++) {
      let c = gene.pattern[i]
      if (randomBoolean()) {
        c = c === '0' ? '1' : '0'
      }
      s += c
    }
    output.pattern = s
  }

  function crossover(a: Gene, b: Gene, child: Gene): void {
    let c = ''
    for (let i = 0; i < n; i++) {
      if (randomBoolean()) {
        c += a.pattern[i]
      } else {
        c += b.pattern[i]
      }
    }
    child.pattern = c
  }

  function fitness(gene: Gene): number {
    let acc = 0
    for (let i = 0; i < n; i++) {
      if (gene.pattern[i] === '1') {
        acc++
      }
    }
    return acc
  }

  function randomIndividual(): Gene {
    let s = ''
    for (let i = 0; i < n; i++) {
      s += randomBoolean() ? '0' : '1'
    }
    return { pattern: s }
  }

  function checkFunction(f: any, length: number) {
    expect(f).is.a('function')
    expect(f.length).equals(length)
  }

  function checkOptions(options: FullOptions<Gene>) {
    expect(options).is.an('object')
    checkFunction(options.mutate, 2)
    checkFunction(options.crossover, 3)
    checkFunction(options.fitness, 1)
    checkFunction(options.doesABeatB, 2)
    expect(options.population).is.a('Array')
    expect(options.populationSize).is.a('number')
    checkFunction(options.randomIndividual, 0)
  }

  it('should populate options', function () {
    expect(() =>
      populateOptions({
        mutate,
        crossover,
        fitness,
        population: [],
      }),
    ).to.throw('zero population')

    checkOptions(
      populateOptions({
        mutate,
        crossover,
        fitness,
        population: [randomIndividual()],
      }),
    )

    checkOptions(
      populateOptions({
        mutate,
        crossover,
        fitness,
        randomIndividual,
      }),
    )
  })

  it('should infer population size', function () {
    let populationSize = 123
    expect(
      populateOptions({
        mutate,
        crossover,
        fitness,
        populationSize,
        randomIndividual,
      }).populationSize,
    ).equals(populationSize)

    expect(() =>
      populateOptions({
        mutate,
        crossover,
        fitness,
        populationSize,
        population: [],
      }),
    ).to.throw('no population for randomIndividual to seed from')

    expect(
      populateOptions({
        mutate,
        crossover,
        fitness,
        population: new Array(populationSize),
      }).populationSize,
    ).equals(populationSize)
  })

  it('should solve the problem', function () {
    let ga = new GaIsland({
      mutate,
      crossover,
      fitness,
      randomIndividual,
    })
    for (let generation = 1; ; generation++) {
      ga.evolve()
      let { gene, fitness } = best(ga.options)
      // console.log({
      //   generation,
      //   bestGene: gene.pattern,
      //   fitness,
      // })
      if (fitness === n) {
        return
      }
    }
  })

  it('should solve the problem async', async function () {
    let ga = new GaIslandAsync<Gene>({
      mutate,
      crossover,
      fitness: async gene => fitness(gene),
      randomIndividual,
    })
    for (let generation = 1; ; generation++) {
      ga.evolve()
      let { gene, fitness } = await bestAsync(ga.options)
      // console.log({
      //   generation,
      //   bestGene: gene.pattern,
      //   fitness,
      // })
      if (fitness === n) {
        return
      }
    }
  })
})
