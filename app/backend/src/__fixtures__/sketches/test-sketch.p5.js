function setup() {
  createCanvas(320, 240);
}

function draw() {
  background(26, 26, 46);
  fill(237, 34, 93);
  ellipse(width / 2, height / 2, 80 + sin(frameCount * 0.1) * 40);
}
