// Sample p5.js sketch — blue circle on red background
function setup() {
  createCanvas(160, 90);
}

function draw() {
  background(220, 40, 40);
  fill(40, 80, 220);
  noStroke();
  ellipse(width / 2, height / 2, 50, 50);
}
