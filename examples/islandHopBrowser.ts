import {
  crossoverFunction,
  doesABeatBFunction,
  fitnessFunction,
  Gene, islands,
  mutationFunction, positionScore
} from "./islandHopCore";
import { GaIsland, populate, randomBoolean } from "../src";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const madeit = document.getElementById("madeit") as HTMLParagraphElement;
const context = canvas.getContext("2d") !;

let MAX_SIZE = 600;


const ga: GaIsland<Gene> = new GaIsland<Gene>({
  mutate: mutationFunction,
  crossover: crossoverFunction,
  fitness: fitnessFunction,
  population: [{ x: .3, y: .5 }],
  populationSize: 500
});


function basic_ga() {
  ga.options.doesABeatB = (a, b) => {
    return fitnessFunction(a) >= fitnessFunction(b);
  };
}

function diversity_ga() {
  ga.options.doesABeatB = doesABeatBFunction;
}

function reset_population() {
  ga.options.population = [{ x: .3, y: .5 }];
  populate(ga.options);
}


// ********************** UI STUFF *************************


function drawCircle(x: number, y: number, s: number, color: number) {
  context.fillStyle = "hsla(" + color + ",90%,40%,1)";
  context.strokeStyle = "hsla(" + color + ",100%,20%,1)";
  context.beginPath();
  context.arc(x * MAX_SIZE / 10., y * MAX_SIZE / 10., s * MAX_SIZE / 10., 0, Math.PI * 2, true);
  context.fill();
  context.stroke();
}

function drawIsland(x: number, y: number) {
  drawCircle(x, y, .4, 90);
  drawCircle(x, y, .1, 90);
  context.fillStyle = "hsla(0,0%,0%,1)";
  context.strokeStyle = "hsla(0,0%,0%,1)";
  context.fillText(Math.round(positionScore(x, y)).toString(), x * MAX_SIZE / 10. - 5, y * MAX_SIZE / 10. - 10);
}

function drawFrog(x: number, y: number) {
  let score = positionScore(x, y);
  drawCircle(x, y, .1, score > 0 ? 270 : 320);
}

function draw() {
  // clear the screen
  context.fillStyle = "hsla(180,90%,40%,1)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fill();

  if (ga) {
    for (let island of islands) {
      drawIsland(island[0], island[1]);
    }

    for (let frog of ga.options.population) {
      drawFrog(frog.x, frog.y);
    }
  }
  window.requestAnimationFrame(draw);
}

window.onload = function() {
  basic_ga();
  window.requestAnimationFrame(draw);
};

var doSimulation = false;

function startSimulation() {
  doSimulation = true;
}

function stopSimulation() {
  doSimulation = false;
}

Object.assign(window, {
  basic_ga,
  diversity_ga,
  reset_population,
  startSimulation,
  stopSimulation
});

setInterval(function() {
  if (doSimulation) {
    for (let x = 0; x < 10; x++) ga!.evolve();
    madeit.innerText = ga!.options.population.map(function(p) {
      return Math.abs(p.x - 8.5) < 1 && Math.abs(p.y - 8.5) < 1 ? 1 : 0 as number;
    }).reduce(function(a: number, b: number): number {
      return a + b;
    }) + " of " + ga!.options.population.length;
  }
}, 50);

