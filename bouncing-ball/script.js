const wrapper = document.getElementById('ball-wrapper');
const container = document.getElementById('container');

// Configuration
let ballRadius = 30; // Half of 60px width/height
let x = container.clientWidth / 2;
let y = container.clientHeight / 4;
let vx = (Math.random() - 0.5) * 20; // Initial X velocity
let vy = 0; // Initial Y velocity

const gravity = 0.6;
const friction = 0.99; // Air resistance
const bounceRetained = 0.85; // Energy retained when hitting a wall/floor
const floorFriction = 0.96; // Friction applied when rolling

let isDragging = false;
let mouseX, mouseY;
let lastMouseX, lastMouseY;
let lastTime = 0;
let animationFrameId;

function update() {
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    if (!isDragging) {
        // Apply gravity
        vy += gravity;

        // Apply air friction
        vx *= friction;
        vy *= friction;

        // Update position
        x += vx;
        y += vy;

        // Collision logic
        
        // Floor
        if (y + ballRadius > containerHeight) {
            y = containerHeight - ballRadius;
            vy = -vy * bounceRetained;
            vx *= floorFriction; // Ground friction
            
            // Avoid micro-bounces at the end to let it rest
            if (Math.abs(vy) < 1) vy = 0;
        }
        
        // Ceiling
        if (y - ballRadius < 0) {
            y = ballRadius;
            vy = -vy * bounceRetained;
        }

        // Right Wall
        if (x + ballRadius > containerWidth) {
            x = containerWidth - ballRadius;
            vx = -vx * bounceRetained;
        }

        // Left Wall
        if (x - ballRadius < 0) {
            x = ballRadius;
            vx = -vx * bounceRetained;
        }
        
        // Stop completely if moving extremely slow on the floor
        if (y + ballRadius === containerHeight && Math.abs(vx) < 0.1) {
            vx = 0;
        }
    }

    // Apply transformation
    wrapper.style.transform = `translate(${x - ballRadius}px, ${y - ballRadius}px)`;

    animationFrameId = requestAnimationFrame(update);
}

// Interaction handling
function handleDragStart(e) {
    isDragging = true;
    lastMouseX = e.clientX ?? e.touches[0].clientX;
    lastMouseY = e.clientY ?? e.touches[0].clientY;
    lastTime = performance.now();
    vx = 0; // Stop Physics
    vy = 0;
    
    // Slight stylistic class tweak can be done here if needed
}

function handleDragMove(e) {
    if (!isDragging) return;
    
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    
    const rect = container.getBoundingClientRect();
    
    // Calculate new position based on container local space
    x = clientX - rect.left;
    y = clientY - rect.top;
    
    // Constrain to container boundaries while dragging
    x = Math.max(ballRadius, Math.min(x, container.clientWidth - ballRadius));
    y = Math.max(ballRadius, Math.min(y, container.clientHeight - ballRadius));
    
    // Calculate velocity based on movement distance
    const currentTime = performance.now();
    const dt = Math.max(1, currentTime - lastTime); // prevent divide by zero
    
    vx = (clientX - lastMouseX) * (16 / dt); // Normalize to approx 60fps frame
    vy = (clientY - lastMouseY) * (16 / dt);
    
    lastMouseX = clientX;
    lastMouseY = clientY;
    lastTime = currentTime;
    
    wrapper.style.transform = `translate(${x - ballRadius}px, ${y - ballRadius}px)`;
}

function handleDragEnd() {
    isDragging = false;
    
    // Cap maximum throw velocity so it doesn't break physics or fly too crazy
    const maxVelocity = 40;
    vx = Math.max(-maxVelocity, Math.min(maxVelocity, vx));
    vy = Math.max(-maxVelocity, Math.min(maxVelocity, vy));
}

// Mouse events
wrapper.addEventListener('mousedown', handleDragStart);
window.addEventListener('mousemove', handleDragMove);
window.addEventListener('mouseup', handleDragEnd);

// Touch events for mobile
wrapper.addEventListener('touchstart', handleDragStart, { passive: false });
window.addEventListener('touchmove', handleDragMove, { passive: false });
window.addEventListener('touchend', handleDragEnd);

// Prevent default drag behaviors
wrapper.addEventListener('dragstart', (e) => e.preventDefault());

// Handle window resize dynamically re-constraining the ball if it goes out of bounds
window.addEventListener('resize', () => {
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;
    
    if (x + ballRadius > containerWidth) x = containerWidth - ballRadius;
    if (y + ballRadius > containerHeight) y = containerHeight - ballRadius;
});

// Kick off animation loop
update();
