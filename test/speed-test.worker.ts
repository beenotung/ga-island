import { Gene, hash, n } from './speed-test.shared';

export function fitness(gene: Gene): number {
  let s = hash(gene[1]);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += parseInt(s[i], 16);
  }
  return acc;
}

process.on('message', message => {
  if (message === 'stop') {
    process.exit();
    return;
  }
  let population: Gene[] = message;
  let outputs: number[] = population.map(gene => fitness(gene));
  // console.log('worker:', {
  //   population,
  //   outputs,
  // })
  process.send(outputs);
});
