# Integrating Aura-Pal Frontend with Physical Robot Hardware

The Aura-Pal Dashboard is currently running a simulated mock environment for the ESP32 feed and emotion detection logic. To connect this beautifully redesigned frontend to your actual physical robot and backend systems, follow these steps.

## Step 1: Connecting the Camera Feed
Currently, the "ESP32 MOCK" button populates an empty image wrapper with an Unsplash placeholder. To connect your actual stream:

1. Open `index.html` and find the `id="videoStream"` element inside the `<section class="camera-section">`.
2. In `script.js` inside the `startMockSimulation()` function, you will see a line assigning `videoStream.src = "..."`.
3. Replace the placeholder URL with the actual local IP stream provided by your ESP32 Camera (e.g., `http://192.168.1.100:81/stream`).

```javascript
// Change this:
videoStream.src = "https://images.unsplash.com/photo-1544717305...; 
// To your ESP32 IP:
videoStream.src = "http://192.168.1.XX:81/stream"; 
```

## Step 2: Connecting Emotion Telemetry via WebSockets
The physical robot likely uses a Python backend (like OpenCV + DeepFace/FER2013) that processes the ESP32 stream and infers the emotion. You need to establish a **WebSocket** connection to push these stats to the frontend in real-time.

1. At the very bottom of `script.js`, there is a commented block titled `--- HOW TO CONNECT TRUE BACKEND ---`.
2. Uncomment this block.
3. Update the WebSocket URL to point to your Python server's IP and port (e.g., `ws://localhost:8080`).

```javascript
const ws = new WebSocket('ws://localhost:8080'); // Adjust to your Python Backend IP
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // The expected format from your Python server should look exactly like this:
    // {
    //    "primaryEmotion": "Happy",
    //    "confidences": { "Happy": 88.5, "Sad": 2.1, "Angry": 0, "Surprise": 4.4, "Neutral": 5.0 }
    // }
    
    // Update the UI if we aren't manually overriding it
    if (!isManualOverride && currentMode === 'esp32') {
        updateEmotion(data.primaryEmotion, data.confidences);
    }
};
```

## Step 3: Python Backend Formatting
Ensure your Python server is formatting its output dictionary precisely to match what the `updateEmotion()` function expects. 

- The `primaryEmotion` string **MUST** exactly match one of these cases: `"Happy"`, `"Sad"`, `"Angry"`, `"Surprise"`, `"Neutral"`.
- The `confidences` object must contain numerical percentages (0-100) for all five of those keys perfectly capitalized.

*(If your Python script uses lowercase keys like "happy" or "sad", you should either `.capitalize()` them in Python before emitting the JSON, or map them inside the `ws.onmessage` handler before calling `updateEmotion()`.)*

## Step 4: Removing Mock Simulation Timers
In `script.js`, inside the `startMockSimulation()` function, there is a `setInterval` that fires mock data every 4 seconds. Once you are successfully receiving WebSocket data:

1. Remove the line `setInterval(() => { triggerRandomEmotion(); }, 4000);`.
2. You can rename `startMockSimulation` to something like `connectToRobot` since it is no longer mocking.
