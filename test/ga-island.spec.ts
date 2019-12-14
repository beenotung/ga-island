import { FullOptions, GaIsland, populateOptions } from '../src/ga-island';
import { expect } from 'chai';

describe('ga-island TestSuit', function() {
  let n = 60;

  function randomBoolean() {
    return Math.random() < 0.5;
  }

  function mutate(gene: string): string {
    let s = '';
    for (let i = 0; i < n; i++) {
      let c = gene[i];
      if (randomBoolean()) {
        c = c === '0' ? '1' : '0';
      }
      s += c;
    }
    return s;
  }

  function crossover(a: string, b: string): [string, string] {
    let c = '';
    let d = '';
    for (let i = 0; i < n; i++) {
      if (randomBoolean()) {
        c += a[i];
        d += b[i];
      } else {
        c += b[i];
        d += a[i];
      }
    }
    return randomBoolean() ? [c, d] : [d, c];
  }

  function fitness(gene: string): number {
    let acc = 0;
    for (let i = 0; i < n; i++) {
      if (gene[i] === '1') {
        acc++;
      }
    }
    return acc;
  }

  function randomIndividual(): string {
    let s = '';
    for (let i = 0; i < n; i++) {
      s += randomBoolean() ? '0' : '1';
    }
    return s;
  }

  function checkFunction(f: any, length: number) {
    expect(f).is.a('function');
    expect(f.length).equals(length);
  }

  function checkOptions(options: FullOptions<string>) {
    expect(options).is.an('object');
    checkFunction(options.mutate, 1);
    checkFunction(options.crossover, 2);
    checkFunction(options.fitness, 1);
    checkFunction(options.doesABeatB, 2);
    expect(options.population).is.a('Array');
    expect(options.populationSize).is.a('number');
    checkFunction(options.randomIndividual, 0);
  }

  it('should populate options', function() {
    expect(() =>
      populateOptions({
        mutate,
        crossover,
        fitness,
        population: [],
      }),
    ).to.throw('zero population');

    checkOptions(
      populateOptions({
        mutate,
        crossover,
        fitness,
        population: [randomIndividual()],
      }),
    );

    checkOptions(
      populateOptions({
        mutate,
        crossover,
        fitness,
        randomIndividual,
      }),
    );
  });

  it('should infer population size', function() {
    let populationSize = 123;
    expect(
      populateOptions({
        mutate,
        crossover,
        fitness,
        populationSize,
        randomIndividual,
      }).populationSize,
    ).equals(populationSize);

    expect(
      populateOptions({
        mutate,
        crossover,
        fitness,
        populationSize,
        population: [],
      }).populationSize,
    ).equals(populationSize);

    expect(
      populateOptions({
        mutate,
        crossover,
        fitness,
        population: new Array(populationSize),
      }).populationSize,
    ).equals(populationSize);
  });

  it('should solve the problem', function() {
    let ga = new GaIsland({
      mutate,
      crossover,
      fitness,
      randomIndividual,
    });
    for (let generation = 1; ; generation++) {
      ga.evolve();
      let best = ga.best();
      console.log({
        generation,
        best,
      });
      if (best.fitness === n) {
        return;
      }
    }
  });
});
