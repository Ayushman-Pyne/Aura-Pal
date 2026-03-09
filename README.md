# Aura-Pal Web Dashboard ✨

A cute, minimalistic, and modern tech dashboard designed as the web interface for the **Aura-Pal** mini AI assistant robot. It features a responsive layout, beautiful animated backgrounds, and interactive fidget toys.

This dashboard is designed to connect to an ESP32 robot equipped with OpenCV to display FER2013 emotion analysis.

## 📂 Project Files

- **`index.html`**
  The main HTML document defining the physical structure of the dashboard. It contains the layout for the video feed, the interactive controls panel, and the emotion analysis display. It also includes the placeholders for the interactive particle background and the drag-and-drop fidget orb.

- **`style.css`**
  The custom stylesheet responsible for the "rich aesthetics" and "modern tech" feel. It uses CSS variables for easy theming, implements a glassmorphism design system (`.glass-panel`), and defines all the micro-animations (like the background pulse, emotion icon popping, progress bars, and the fidget orb spinning).

- **`script.js`**
  The logic powerhouse of the dashboard. It handles:
  1. **ESP32 Mock Stream**: Simulates receiving emotion payloads from a WebSocket. 
  2. **Webcam Integration**: Can access the user's local webcam for standalone interactive testing.
  3. **Image Uploading**: Allows the user to upload a static image to be "analyzed".
  4. **Manual Emotion Override**: Allows clicking buttons to force the UI to react to specific emotions.
  5. **Interactive Fidget Features**: Drives the floating, draggable fidget orb (which changes color based on the robot's mood) and the global particle click effect system.

## 🚀 Usage

You can launch this project simply by opening `index.html` in any modern web browser. No complex build tools or local servers are required to test the UI thanks to the built-in standalone mock modes!

### To Connect to a Real Backend:
Refer to the commented-out section at the bottom of `script.js` titled `--- HOW TO CONNECT TRUE BACKEND ---` for an example of how to link this frontend to a real WebSocket streaming from the ESP32.
