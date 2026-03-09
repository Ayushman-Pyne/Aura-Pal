/**
 * Aura-Pal Dashboard Logic
 * This handles simulating the UI interactions that your ESP32 + OpenCV would normally feed into the app
 */

const currentEmotionText = document.getElementById('emotionText');
const emotionIcon = document.getElementById('emotionIcon');
const emotionConfidence = document.getElementById('emotionConfidence');
const scannerLine = document.querySelector('.scanner-line');
const videoStream = document.getElementById('videoStream');
const videoPlaceholder = document.getElementById('videoPlaceholder');

// FER2013 standard emotion targets
const EMOTIONS = {
    'Happy': { icon: 'fa-face-smile', color: '#10b981' },
    'Sad': { icon: 'fa-face-frown', color: '#3b82f6' },
    'Angry': { icon: 'fa-face-angry', color: '#ef4444' },
    'Surprise': { icon: 'fa-face-surprise', color: '#f59e0b' },
    'Neutral': { icon: 'fa-face-meh', color: '#64748b' }
};

/**
 * Update the dashboard with new emotion data
 * @param {string} emotionName - Primary detected emotion
 * @param {Object} confidences - Keys are emotion names, values are percentages 0-100
 */
function updateEmotion(emotionName, confidences) {
    if (!EMOTIONS[emotionName]) return;

    // Trigger popup micro-animation on icon change
    emotionIcon.classList.remove('pop');
    void emotionIcon.offsetWidth; // trigger DOM reflow
    emotionIcon.classList.add('pop');

    // Update textual information
    currentEmotionText.innerText = emotionName;
    const mainConf = confidences[emotionName];
    emotionConfidence.innerText = mainConf ? mainConf.toFixed(1) : "0.0";
    
    // Update graphic icon and its glow color dynamically
    const iconBase = emotionIcon.querySelector('i');
    iconBase.className = `fa-regular ${EMOTIONS[emotionName].icon}`;
    emotionIcon.style.color = EMOTIONS[emotionName].color;
    // Keep outer glass glow but add the emotion color tint
    emotionIcon.style.boxShadow = `inset 0 0 20px rgba(255,255,255,0.05), 0 0 20px ${EMOTIONS[emotionName].color}50`;

    // Update each progress bar in the stats section smoothly
    for (const [emo, val] of Object.entries(confidences)) {
        const bar = document.getElementById(`bar-${emo.toLowerCase()}`);
        if(bar) {
            bar.style.width = `${val}%`;
        }
    }
}

let simulationInterval = null;
let currentMode = 'esp32'; // 'esp32', 'webcam', 'image'
let isManualOverride = false;

// UI Elements
const btnEsp32 = document.getElementById('btn-esp32');
const btnWebcam = document.getElementById('btn-webcam');
const btnImage = document.getElementById('image-upload');
const manualEmoButtons = document.querySelectorAll('.btn-emo');
const webcamStream = document.getElementById('webcamStream');
const sourceBadge = document.getElementById('sourceBadge');
const placeholderText = document.getElementById('placeholderText');
const feedInstruction = document.getElementById('feedInstruction');

function startMockSimulation() {
    stopCurrentStream();
    currentMode = 'esp32';
    updateSourceButtons(btnEsp32);
    sourceBadge.innerText = "ESP32 MOCK";
    feedInstruction.innerHTML = '<i class="fa-solid fa-circle-info"></i> Point your ESP32 Camera towards a face to analyze emotion (FER2013).';
    
    videoPlaceholder.style.display = 'none';
    videoStream.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"; 
    videoStream.style.display = 'block';
    scannerLine.style.display = 'block';

    simulationInterval = setInterval(() => {
        if (isManualOverride) return; // Skip if user is manually triggering
        triggerRandomEmotion();
    }, 4000);
}

async function startWebcam() {
    stopCurrentStream();
    currentMode = 'webcam';
    updateSourceButtons(btnWebcam);
    sourceBadge.innerText = "LOCAL WEBCAM";
    feedInstruction.innerHTML = '<i class="fa-solid fa-circle-info"></i> Analyzing your local camera feed. Smile!';
    
    videoPlaceholder.style.display = 'flex';
    placeholderText.innerText = "Requesting Camera Access...";
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamStream.srcObject = stream;
        videoPlaceholder.style.display = 'none';
        webcamStream.style.display = 'block';
        scannerLine.style.display = 'block';
        
        simulationInterval = setInterval(() => {
            if (isManualOverride) return;
            triggerRandomEmotion();
        }, 3000); // Faster updates for interactive webcam
    } catch (err) {
        placeholderText.innerText = "Camera Access Denied.";
        console.error("Error accessing webcam: ", err);
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    stopCurrentStream();
    currentMode = 'image';
    updateSourceButtons(document.getElementById('btn-image'));
    sourceBadge.innerText = "IMAGE UPLOAD";
    feedInstruction.innerHTML = '<i class="fa-solid fa-circle-info"></i> Analyzing uploaded image...';
    
    const reader = new FileReader();
    reader.onload = (event) => {
        videoPlaceholder.style.display = 'none';
        videoStream.src = event.target.result;
        videoStream.style.display = 'block';
        scannerLine.style.display = 'block';
        
        // Trigger a fake scan then static result
        setTimeout(() => triggerRandomEmotion(), 1500);
    };
    reader.readAsDataURL(file);
}

function stopCurrentStream() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    videoStream.style.display = 'none';
    webcamStream.style.display = 'none';
    scannerLine.style.display = 'none';
    
    if (webcamStream.srcObject) {
        webcamStream.srcObject.getTracks().forEach(track => track.stop());
        webcamStream.srcObject = null;
    }
}

function updateSourceButtons(activeBtn) {
    [btnEsp32, btnWebcam, document.getElementById('btn-image')].forEach(btn => {
        if(btn) btn.classList.remove('active');
    });
    if(activeBtn) activeBtn.classList.add('active');
}

function triggerRandomEmotion() {
    const emotions = ['Happy', 'Sad', 'Angry', 'Surprise', 'Neutral'];
    const targetEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    generateEmotionData(targetEmotion);
}

function generateEmotionData(targetEmotion) {
    const emotions = ['Happy', 'Sad', 'Angry', 'Surprise', 'Neutral'];
    let confidences = {};
    let remaining = 100;
    
    const targetValue = 60 + Math.random() * 35; // 60-95%
    confidences[targetEmotion] = targetValue;
    remaining -= targetValue;
    
    emotions.filter(e => e !== targetEmotion).forEach((emo, index, arr) => {
        if (index === arr.length - 1) {
            confidences[emo] = remaining; // Cap off remainder
        } else {
            const val = Math.random() * remaining;
            confidences[emo] = val;
            remaining -= val;
        }
    });

    updateEmotion(targetEmotion, confidences);
}

// Event Listeners
btnEsp32.addEventListener('click', startMockSimulation);
btnWebcam.addEventListener('click', startWebcam);
btnImage.addEventListener('change', handleImageUpload);

manualEmoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Stop automatic random changes temporarily
        isManualOverride = true;
        const targetEmotion = e.target.getAttribute('data-emo');
        generateEmotionData(targetEmotion);
        
        // Reset manual override after 5 seconds if not in image mode
        if (currentMode !== 'image') {
            setTimeout(() => {
                isManualOverride = false;
            }, 5000);
        }
    });
});

// Automatically start simulating when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add realistic 2 second connecting delay
    setTimeout(startMockSimulation, 1000);
});

// --- HOW TO CONNECT TRUE BACKEND ---
//
// Below is an example of what your WebSocket listener would look like
// when hooked up to the Python/ESP32 server:
//
// const ws = new WebSocket('ws://localhost:8080'); // Adjust to your backend IP
// ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     /* Ex data format:
//       {
//         "primaryEmotion": "Happy",
//         "confidences": { "Happy": 88.5, "Sad": 2.1, "Angry": 0, "Surprise": 4.4, "Neutral": 5.0 }
//       }
//     */
//     if (!isManualOverride && currentMode === 'esp32') {
//         updateEmotion(data.primaryEmotion, data.confidences);
//     }
// };
// -----------------------------------

// --- INTERACTIVE FIDGET FEATURES ---

// 1. Particle Canvas System
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: undefined, y: undefined };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = color;
        this.life = 100;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 1.5;
        if (this.size > 0.1) this.size -= 0.05;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Create particles on click globally
window.addEventListener('click', (e) => {
    // Determine current dominant emotion color
    const currentEmo = currentEmotionText.innerText || 'Neutral';
    const color = EMOTIONS[currentEmo]?.color || '#a855f7';
    
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(e.x, e.y, color));
    }
});

// 2. Draggable Interactive Fidget Orb
const fidgetOrb = document.getElementById('fidgetOrb');
const orbCore = document.querySelector('.orb-core');
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

fidgetOrb.addEventListener("touchstart", dragStart, false);
fidgetOrb.addEventListener("touchend", dragEnd, false);
fidgetOrb.addEventListener("touchmove", drag, false);

fidgetOrb.addEventListener("mousedown", dragStart, false);
window.addEventListener("mouseup", dragEnd, false);
window.addEventListener("mousemove", drag, false);

function dragStart(e) {
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    if (e.target.closest('#fidgetOrb')) {
        isDragging = true;
        // Visual feedback on grab
        orbCore.classList.add('orb-pulse');
        setTimeout(() => orbCore.classList.remove('orb-pulse'), 500);
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, fidgetOrb);
        
        // Occasionally emit particles while dragging
        if (Math.random() > 0.8) {
            const rect = fidgetOrb.getBoundingClientRect();
            const color = '#ffe4e1'; // Pinkish white
            particles.push(new Particle(rect.left + rect.width/2, rect.top + rect.height/2, color));
        }
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// Intercept emotion updates to change orb color dynamically
const originalUpdateEmotion = updateEmotion;
updateEmotion = function(emotionName, confidences) {
    originalUpdateEmotion(emotionName, confidences);
    
    // Update orb core color to match emotion
    if (EMOTIONS[emotionName]) {
        const color = EMOTIONS[emotionName].color;
        orbCore.style.background = `radial-gradient(circle at 30% 30%, #fff, ${color})`;
        orbCore.style.boxShadow = `0 0 20px ${color}, inset 0 0 10px rgba(0,0,0,0.5)`;
        
        // Pulse the orb when emotion changes
        orbCore.classList.remove('orb-pulse');
        void orbCore.offsetWidth;
        orbCore.classList.add('orb-pulse');
        
        // Emit a burst of particles from the orb
        const rect = fidgetOrb.getBoundingClientRect();
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(rect.left + rect.width/2, rect.top + rect.height/2, color));
        }
    }
};
