# Aura-Pal Frontend Architecture Guide

This manual simply breaks down the role and functions of the three core frontend files that make up the Aura-Pal Dashboard redesign. These files work together to generate the modern, responsive UI and hook into your physical robot backend.

## 1. `index.html` (Structure & Layout)
This is the root document that defines all of the visible building blocks and groups them into logical sections. 
- **The Container (`.container`)**: The app uses a full viewport layout containing absolutely positioned elements, moving away from standard scrolling document flow.
- **The Central Face (`#bigFace`)**: A group of simple `div` elements (eyes, mouth, decorations like tears and fumes) that rely entirely on CSS to dictate their shape. There are no images used for the face.
- **The Input Feeds (`.camera-area`)**: Contains the video placeholder, image uploading inputs, and mock ESP32 toggles overlayed compactly at the bottom left.
- **The Stats Panel (`.stats-area-wrapper`)**: A hidden slide-out drawer on the right edge. It houses the FER2013 percentage stat progress bars.
- **Quotation Box**: A simple box on the top right whose text node is targeted by Javascript to update dynamically.

## 2. `style.css` (Aesthetics & Animation)
This file is the engine behind the "modern cozy vibe" and all visual states.
- **CSS Variables `:root`**: At the very top, we define a pastel color palette and assign explicit colors for every single emotion (e.g. `--happy`, `--sad`) to maintain visual consistency everywhere.
- **Glassmorphism (`.glass-panel`)**: Uses semi-transparent background colors paired with `backdrop-filter: blur(16px)` to create the frosted glass effect on panels.
- **Face State Targeting**: The styling uses parent descendent selectors to dramatically alter the face layout based on what class is applied to the root face object. For example, applying `.face-sad` to the main container triggers CSS rules that shrink and tilt `.eye` and display `.tear`. 
- **Idle Animators (`@keyframes`)**: Manages continuous CSS loops like the gradient background pulse (`bg-pulse`), the face bobbing (`idle-float`), and the emotion-specific particle emitters like fumes rising (`rise`) and tears dropping (`flow`).  

## 3. `script.js` (Logic & Interactivity)
This script sits on top of the HTML and CSS to simulate hardware backend data and manage DOM updates.
- **Emotion Mapping (`EMOTIONS`)**: A constant dictionary mapping the standard FER2013 output string (e.g. `"Happy"`) to the specific CSS class name (`"face-happy"`), UI colors, and a list of thematic quotations.
- **`updateEmotion()` Function**: The core workhorse function. When given an emotion name and confidence dictionary, it:
  1. Removes the previous emotion class from the `#bigFace` container, forces a DOM reflow, and applies the new class. This tells the CSS to trigger the transition animations resizing the eyes and mouth.
  2. Updates all progress bar widths in the sidebar.
  3. Fades the quotation box out, randomly selects a new quote array string, applies it, and fades it back in.
- **The Blink Loop**: Uses `setTimeout` to recursively append a `.blink` class to the `.eye` DOM elements at randomized 2 to 6-second intervals to give the face lifelike sentience.
- **Mock Simulation Triggers**: Includes event listeners that attach to the UI buttons to spawn random mock emotion data payloads in intervals. *(See `integration_guide.md` on how to replace this with real WebSocket payloads.)*
