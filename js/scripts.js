/**
 * Starfield Animation Script
 * Creates an interactive starfield background with mouse/touch interaction
 */

// Animation constants
const STAR_COUNT = (window.innerWidth + window.innerHeight) / 8;
const STAR_SIZE = 3;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;

// Canvas setup
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// Canvas dimensions and scale
let scale = 1; // Device pixel ratio
let width;
let height;

// Star array
let stars = [];

// Pointer coordinates (for future mouse/touch tracking)
let pointerX;
let pointerY;

// Velocity object for star movement
let velocity = { 
  x: 0,   // Current horizontal velocity
  y: 0,   // Current vertical velocity
  tx: 0,  // Target horizontal velocity
  ty: 0,  // Target vertical velocity
  z: 0.0005 // Depth velocity
};

let touchInput = false;

// Initialize animation
generate();
resize();
step();

// Event listeners
window.onresize = resize;
canvas.onmousemove = onMouseMove;
canvas.ontouchmove = onTouchMove;
canvas.ontouchend = onMouseLeave;
document.onmouseleave = onMouseLeave;

/**
 * Generate stars array with initial positions
 */
function generate() {
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: 0,
      y: 0,
      z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE)
    });
  }
}

/**
 * Place a star at random position on canvas
 * @param {Object} star - Star object with x, y, z properties
 */
function placeStar(star) {
  star.x = Math.random() * width;
  star.y = Math.random() * height;
}

/**
 * Recycle star that went out of bounds
 * Repositions star based on movement direction
 * @param {Object} star - Star object to recycle
 */
function recycleStar(star) {
  let direction = 'z';

  let vx = Math.abs(velocity.x);
  let vy = Math.abs(velocity.y);

  // Determine recycle direction based on velocity
  if (vx > 1 || vy > 1) {
    let axis;

    if (vx > vy) {
      axis = Math.random() < vx / (vx + vy) ? 'h' : 'v';
    } else {
      axis = Math.random() < vy / (vx + vy) ? 'v' : 'h';
    }

    if (axis === 'h') {
      direction = velocity.x > 0 ? 'l' : 'r';
    } else {
      direction = velocity.y > 0 ? 't' : 'b';
    }
  }

  // Reset star z value
  star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

  // Reposition star based on direction
  // z = center, l = left, r = right, t = top, b = bottom
  if (direction === 'z') {
    star.z = 0.1;
    star.x = Math.random() * width;
    star.y = Math.random() * height;
  } else if (direction === 'l') {
    star.x = -OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === 'r') {
    star.x = width + OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === 't') {
    star.x = width * Math.random();
    star.y = -OVERFLOW_THRESHOLD;
  } else if (direction === 'b') {
    star.x = width * Math.random();
    star.y = height + OVERFLOW_THRESHOLD;
  }
}

/**
 * Resize canvas and reposition stars
 */
function resize() {
  scale = window.devicePixelRatio || 1;

  width = window.innerWidth * scale;
  height = window.innerHeight * scale;

  canvas.width = width;
  canvas.height = height;

  // Reposition all stars
  stars.forEach(placeStar);
}

/**
 * Animation loop - updates and renders each frame
 */
function step() {
  context.clearRect(0, 0, width, height);

  update();
  render();

  requestAnimationFrame(step);
}

/**
 * Update star positions and velocities
 */
function update() {
  // Gradually slow down velocity (damping)
  velocity.tx *= 0.96;
  velocity.ty *= 0.96;

  // Smooth velocity interpolation
  velocity.x += (velocity.tx - velocity.x) * 0.07;
  velocity.y += (velocity.ty - velocity.y) * 0.07;

  // Update each star's position
  stars.forEach((star) => {
    // Move star based on velocity and depth
    star.x += velocity.x * star.z;
    star.y += velocity.y * star.z;

    // Depth effect - stars move toward center
    star.x += (star.x - width / 2) * velocity.z * star.z;
    star.y += (star.y - height / 2) * velocity.z * star.z;
    star.z += velocity.z;

    // Recycle star if out of bounds
    if (
      star.x < -OVERFLOW_THRESHOLD ||
      star.x > width + OVERFLOW_THRESHOLD ||
      star.y < -OVERFLOW_THRESHOLD ||
      star.y > height + OVERFLOW_THRESHOLD
    ) {
      recycleStar(star);
    }
  });
}

/**
 * Render stars on canvas
 */
function render() {
  stars.forEach((star) => {
    context.beginPath();
    context.lineCap = 'round';
    context.lineWidth = STAR_SIZE * star.z * scale;
    
    // Random opacity for visual variation
    context.strokeStyle = 'rgba(255,255,255,' + (100 + 100 * Math.random()) + ')';

    context.beginPath();
    context.moveTo(star.x, star.y);

    // Calculate tail based on velocity
    let tailX = velocity.x * 2;
    let tailY = velocity.y * 2;

    // Prevent invisible lines (stroke() won't work)
    if (Math.abs(tailX) < 100000) tailX = 0;
    if (Math.abs(tailY) < 100000) tailY = 0;

    context.lineTo(star.x + tailX, star.y + tailY);
    context.stroke();
  });
}

/**
 * Mouse move handler (placeholder - to be implemented)
 */
function onMouseMove(e) {
  // Mouse tracking can be implemented here
}

/**
 * Touch move handler (placeholder - to be implemented)
 */
function onTouchMove(e) {
  // Touch tracking can be implemented here
}

/**
 * Mouse/touch leave handler
 */
function onMouseLeave() {
  // Reset velocity when pointer leaves
  velocity.tx = 0;
  velocity.ty = 0;
}
