// Algorithmic art: Perlin-noise flow field with particle trails
// Produces dynamic, evolving visuals each frame — tests complex p5.js rendering pipeline.

const PARTICLE_COUNT = 120;
const NOISE_SCALE = 0.02;
const TRAIL_ALPHA = 20;

let particles = [];

function setup() {
  createCanvas(160, 90);
  colorMode(HSB, 360, 100, 100, 255);
  background(0, 0, 10);
  randomSeed(42); // deterministic for regression testing
  noiseSeed(42);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(random(width), random(height), i));
  }
}

function draw() {
  // Semi-transparent overlay for trails
  noStroke();
  fill(0, 0, 10, TRAIL_ALPHA);
  rect(0, 0, width, height);

  let t = frameCount * 0.005;

  for (let p of particles) {
    p.follow(t);
    p.update();
    p.edges();
    p.show();
  }
}

class Particle {
  constructor(x, y, idx) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 1.5;
    this.idx = idx;
    this.hueBase = (idx * 37) % 360;
  }

  follow(t) {
    let angle = noise(
      this.pos.x * NOISE_SCALE,
      this.pos.y * NOISE_SCALE,
      t
    ) * TWO_PI * 2;
    let force = p5.Vector.fromAngle(angle);
    force.setMag(0.3);
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    let h = (this.hueBase + frameCount * 0.5) % 360;
    let s = 70 + sin(frameCount * 0.03 + this.idx) * 20;
    let b = 80 + cos(frameCount * 0.02 + this.idx * 0.5) * 15;
    stroke(h, s, b, 180);
    strokeWeight(1.2);
    point(this.pos.x, this.pos.y);
  }
}
