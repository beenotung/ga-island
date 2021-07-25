import { best } from '../src';
import { newGa } from './islandHopCore';

console.log(`
Test to see how well GeneticAlgorithm does with islands.

There are 10 islands located at [0.5,0.5], [2.5,0.5] ... [8.5,8.5], like so
+----------------+
| A  B  D  E  G  |
| C              |
| F              |
| H              |
| I           X  |
+----------------+
A = [0.5,0.5] and is the least valuable genetic island.
X = [8.5,8.5] is the most valuable, but it is very far from anything.
One phenotype starts at [0.3,0.5] which is close to island A.
The space inbetween the islands is very undesirable.
The mutation function allows mutations that have a small chance of crossing
islands and is not large enough to reach X.
`);

let ga = newGa();

function finished() {
  let best_frog = best(ga.options).gene;
  return (
    best_frog.x > 8 && best_frog.x < 9 && best_frog.y > 8 && best_frog.y < 9
  );
}

var done = finished();

for (var loop = 1; loop <= 1000 && !done; loop++) {
  ga.evolve();
  if (loop % 50 == 0) {
    process.stdout.write('Completed ' + loop + ' evolutions : ');
    console.log(best(ga.options).gene);
    done = finished();
  }
}

if (finished()) {
  console.log('\nSuccessfully hopped evolutionarily difficult islands.\n');
  process.exit(0);
} else {
  console.log('\nFailed to hop evolutionarily difficult islands.\n');
  process.exit(1);
}
