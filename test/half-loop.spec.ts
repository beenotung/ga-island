import { expect } from 'chai'

describe('loop TestSuit', function () {
  function test(n: number) {
    let accFull = 0
    for (let i = 0; i < n; i++) {
      accFull++
    }
    let accHalf = 0
    let half = n / 2
    for (let i = 0; i < half; i++) {
      accHalf += 2
    }
    expect(accHalf).equals(accFull)
  }

  it('should loop for same number of times', function () {
    // test even number
    test(10)

    // test odd number
    // test(9)
  })
})
