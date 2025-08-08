# Audio Reactive GPGPU Particles

Real-time audio-reactive particle system using WebGL and GPGPU techniques for high-performance visual effects.

## Features

- **GPGPU Particle System**: Utilizes GPU compute power for rendering thousands of particles
- **Audio Reactivity**: Particles respond dynamically to audio frequency data
- **Mouse Interaction**: Interactive particle manipulation with mouse controls
- **Real-time Effects**: Smooth 60fps rendering with WebGL shaders
- **Modular Architecture**: Clean separation of concerns with organized source structure

## Getting Started

### Prerequisites

- Modern web browser with WebGL support
- Local web server (required for loading shader files)

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd audioreactive-gpgpu-particles
```

2. Serve the files using your preferred method:

**Using Bun (recommended):**
```bash
bun install -g serve
serve
```

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx serve
```

3. Open your browser and navigate to the local server (typically `http://localhost:3000` or `http://localhost:8000`)

4. Upload an audio file and enjoy the visualization!

## Project Structure

```
├── index.html              # Main HTML entry point
├── src/
│   ├── css/
│   │   └── styles.css      # Application styles
│   ├── js/
│   │   ├── main.js         # Main application logic
│   │   ├── audio.js        # Audio processing utilities
│   │   └── webgl-utils.js  # WebGL helper functions
│   └── shaders/
│       ├── vertex.glsl     # Basic vertex shader
│       ├── fragment.glsl   # Initial position fragment shader
│       ├── point.vert      # Point rendering vertex shader
│       ├── point.frag      # Point rendering fragment shader
│       ├── velocity.vert   # Velocity update vertex shader
│       └── velocity.frag   # Velocity update fragment shader
└── README.md
```

## How It Works

The application uses a multi-pass rendering approach:

1. **Initialization Pass**: Sets up initial particle positions using a fragment shader
2. **Velocity Update Pass**: Updates particle velocities based on audio data and mouse interaction
3. **Render Pass**: Renders particles as points with audio-reactive sizing and coloring

The system leverages WebGL's `OES_texture_float` extension to store particle data in floating-point textures, enabling GPU-based particle simulation.

## Audio Integration

- Upload any audio file through the file input
- Particles respond to frequency data from the audio
- Particle size and movement speed scale with audio intensity
- Supports looping playback for continuous visualization

## Controls

- **Mouse Click + Drag**: Create an attractor point that draws particles
- **Audio Upload**: Load audio files to drive the particle animation
- **Automatic Mode**: When not interacting, particles follow a predetermined pattern

## Browser Compatibility

Requires a browser with support for:
- WebGL 1.0
- `OES_texture_float` extension
- Web Audio API
- ES6 modules

## Contributing

Feel free to submit issues and enhancement requests!