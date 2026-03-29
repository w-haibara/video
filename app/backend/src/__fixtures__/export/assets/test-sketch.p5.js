// Sample p5.js sketch — rotating rectangle
function setup() {
  createCanvas(160, 90);
  background(30);
}

function draw() {
  background(30, 20);
  translate(width / 2, height / 2);
  rotate(frameCount * 0.05);
  fill(255, 120, 50);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, 40, 40);
}
