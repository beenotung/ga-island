import { island_list, newGa, Gene, Island } from './islandHopCore'
import { populate } from '../src'
const { abs } = Math

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const madeit = document.getElementById('madeit') as HTMLParagraphElement
const context = canvas.getContext('2d')!
if (!context) {
  const msg = '2D Canvas Context is not supported'
  document.body.innerHTML = msg
  throw new Error(msg)
}

const MAX_SIZE = 600

const ga = newGa()

const { fitness, doesABeatB } = ga.options
const seed: Gene = { ...ga.options.population[0] }

function basic_ga() {
  ga.options.doesABeatB = (a, b) => {
    return fitness(a) >= fitness(b)
  }
}

function diversity_ga() {
  ga.options.doesABeatB = doesABeatB
}

function reset_population() {
  ga.options.population = [{ ...seed }]
  populate(ga.options)
}

// ********************** UI STUFF *************************

function drawCircle(x: number, y: number, s: number, color: number) {
  context.fillStyle = 'hsla(' + color + ',90%,40%,1)'
  context.strokeStyle = 'hsla(' + color + ',100%,20%,1)'
  context.beginPath()
  context.arc(
    (x * MAX_SIZE) / 10,
    (y * MAX_SIZE) / 10,
    (s * MAX_SIZE) / 10,
    0,
    Math.PI * 2,
    true,
  )
  context.fill()
  context.stroke()
}

function drawIsland({ x, y, score }: Island) {
  drawCircle(x, y, 0.4, 90)
  drawCircle(x, y, 0.1, 90)
  context.fillStyle = 'hsla(0,0%,0%,1)'
  context.strokeStyle = 'hsla(0,0%,0%,1)'
  context.fillText(
    score.toString(),
    (x * MAX_SIZE) / 10 - 5,
    (y * MAX_SIZE) / 10 - 10,
  )
}

function drawFrog(frog: Gene) {
  const score = fitness(frog)
  drawCircle(frog.x, frog.y, 0.1, score > 0 ? 270 : 320)
}

function draw() {
  // clear the screen
  context.fillStyle = 'hsla(180,90%,40%,1)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fill()

  if (ga) {
    for (const island of island_list) {
      drawIsland(island)
    }

    for (const frog of ga.options.population) {
      drawFrog(frog)
    }
  }
  window.requestAnimationFrame(draw)
}

window.onload = function() {
  basic_ga()
  window.requestAnimationFrame(draw)
}

let doSimulation = false

function startSimulation() {
  doSimulation = true
}

function stopSimulation() {
  doSimulation = false
}

Object.assign(window, {
  basic_ga,
  diversity_ga,
  reset_population,
  startSimulation,
  stopSimulation,
})

setInterval(function() {
  if (!doSimulation) return
  for (let x = 0; x < 10; x++) ga.evolve()
  let acc = 0
  ga.options.population.forEach(p => {
    if (abs(p.x - 8.5) < 1 && abs(p.y - 8.5) < 1) {
      acc++
    }
  })
  madeit.innerText = acc + ' of ' + ga.options.population.length
}, 50)
