import { ThreadPool } from '../src/thread-pool'
import { expect } from 'chai'
import { modulePath } from './worker-test'

describe('ThreadPool TestSuit', function () {
  function test(n: number, done: () => void) {
    console.log({ test: n })
    let threadPool = new ThreadPool({ modulePath })
    let inputs = new Array(n).fill(0).map((_, i) => i + 1)
    let acc = 0
    let onResult = (outputs: Array<{ echo: number }>) => {
      let progress = new Array(n).fill(false)
      try {
        outputs.forEach(output => (progress[output.echo] = true))
      } catch (e) {
        throw e
      }
      expect(progress.every(x => x))
      acc++
      if (acc === 2) {
        console.log({ done: n })
        Promise.all(threadPool.close()).then(done)
      }
    }
    threadPool.dispatch<number, { echo: number }>(inputs).then(onResult)
    threadPool.dispatch<number, { echo: number }>(inputs, (err, outputs) => {
      expect(!err)
      onResult(outputs)
    })
  }

  it('should dispatch message', function (done) {
    ;[1, 2, 5, 10, 8, 11].reduce(
      (acc, c) => {
        return () => test(c, () => acc())
      },
      () => {
        done()
        setTimeout(() => process.exit())
      },
    )()
  })
})
