import { GaIsland } from "../src";
import { crossoverFunction, doesABeatBFunction, findBest, fitnessFunction, mutationFunction } from "./islandHopCore";

console.log("\nTest to see how well GeneticAlgorithm does with islands.\n");
console.log("There are 10 islands located at [0.5,0.5], [2.5,0.5] ... [8.5,8.5], like so");
console.log("+----------------+");
console.log("| A  B  D  E  G  |");
console.log("| C              |");
console.log("| F              |");
console.log("| H              |");
console.log("| I           X  |");
console.log("+----------------+");
console.log("A = [0.5,0.5] and is the least valuable genetic island.");
console.log("X = [8.5,8.5] is the most valuable, but it is very far from anything.");
console.log("One phenotype starts at [0.3,0.5] which is close to island A.");
console.log("The space inbetween the islands is very undesirable.");
console.log("The mutation function allows mutations that have a small chance of crossing");
console.log("islands and is not large enough to reach X.\n");





let ga = new GaIsland({
  mutate: mutationFunction,
  crossover: crossoverFunction,
  fitness: fitnessFunction,
  doesABeatB: doesABeatBFunction,
  population: [{ x: .3, y: .5 }],
  populationSize: 500
});



function finished() {
  let best_frog = findBest(ga.options);
  return best_frog.x > 8 && best_frog.x < 9 && best_frog.y > 8 && best_frog.y < 9;
}

var done = finished();

for (var loop = 1; loop <= 1000 && !done; loop++) {
  ga.evolve();
  if (loop % 50 == 0) {
    process.stdout.write("Completed " + loop + " evolutions : ");
    console.log(findBest(ga.options));
    done = finished();
  }
}

if (finished()) {
  console.log("\nSuccessfully hopped evolutionaryly difficult islands.\n");
} else {
  console.log("\nFailed to hop evolutionaryly difficult islands.\n");
}
