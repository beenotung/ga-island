const { random } = Math;
let min = random();
let max = min;
let i = 0;
for (;;) {
  let r = random();
  if (r < min) {
    min = r;
    i++;
    console.log({ i, min, max, range: max - min });
  } else if (r > max) {
    max = r;
    i++;
    console.log({ i, min, max, range: max - min });
  }
}
