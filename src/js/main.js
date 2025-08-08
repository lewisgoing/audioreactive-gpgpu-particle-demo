import { createShader, createProgram, createVbo, setAttribute, createFramebuffer, hsva } from './webgl-utils.js';
import { AudioProcessor } from './audio.js';

let canvas, gl;
let prg, attLocation, attStride, uniLocation;
let pPrg, pAttLocation, pAttStride, pUniLocation;
let vPrg, vAttLocation, vAttStride, vUniLocation;
let position, vVBOList, planeVBOList;
let vertices, resolution, ambient;
let backBuffer, frontBuffer, flip;
let velocity = 0.0;
let mouseFlag = false;
let mousePositionX = 0.0;
let mousePositionY = 0.0;
let count = 0;

const audioProcessor = new AudioProcessor();
const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = 512;

async function init() {
    canvas = document.getElementById('webgl-canvas');
    const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.7, 800);
    canvas.width = size;
    canvas.height = size;

    gl = canvas.getContext('webgl');

    if (!gl) {
        console.error("WebGL not supported!");
        return;
    }

    const vtf = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    if (vtf <= 0) {
        console.error('Vertex Texture Fetch not supported');
        return;
    }

    const ext = gl.getExtension('OES_texture_float');
    if (!ext) {
        console.error('Float texture not supported');
        return;
    }

    try {
        const vertexShaderSource = await fetch('./src/shaders/vertex.glsl').then(r => r.text());
        const fragmentShaderSource = await fetch('./src/shaders/fragment.glsl').then(r => r.text());
        const pointVsSource = await fetch('./src/shaders/point.vert').then(r => r.text());
        const pointFsSource = await fetch('./src/shaders/point.frag').then(r => r.text());
        const velocityVsSource = await fetch('./src/shaders/velocity.vert').then(r => r.text());
        const velocityFsSource = await fetch('./src/shaders/velocity.frag').then(r => r.text());

        const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        prg = createProgram(gl, vShader, fShader);
        attLocation = [gl.getAttribLocation(prg, 'position')];
        attStride = [3];
        uniLocation = [gl.getUniformLocation(prg, 'resolution')];

        const vShader2 = createShader(gl, gl.VERTEX_SHADER, pointVsSource);
        const fShader2 = createShader(gl, gl.FRAGMENT_SHADER, pointFsSource);
        pPrg = createProgram(gl, vShader2, fShader2);
        pAttLocation = [gl.getAttribLocation(pPrg, 'index')];
        pAttStride = [1];
        pUniLocation = [
            gl.getUniformLocation(pPrg, 'resolution'),
            gl.getUniformLocation(pPrg, 'texture'),
            gl.getUniformLocation(pPrg, 'pointScale'),
            gl.getUniformLocation(pPrg, 'ambient'),
            gl.getUniformLocation(pPrg, 'audio')
        ];

        const vShader3 = createShader(gl, gl.VERTEX_SHADER, velocityVsSource);
        const fShader3 = createShader(gl, gl.FRAGMENT_SHADER, velocityFsSource);
        vPrg = createProgram(gl, vShader3, fShader3);
        vAttLocation = [gl.getAttribLocation(vPrg, 'position')];
        vAttStride = [3];
        vUniLocation = [
            gl.getUniformLocation(vPrg, 'resolution'),
            gl.getUniformLocation(vPrg, 'texture'),
            gl.getUniformLocation(vPrg, 'mouse'),
            gl.getUniformLocation(vPrg, 'mouseFlag'),
            gl.getUniformLocation(vPrg, 'velocity'),
            gl.getUniformLocation(vPrg, 'audio'),
            gl.getUniformLocation(vPrg, 'time')
        ];

        resolution = [TEXTURE_WIDTH, TEXTURE_HEIGHT];
        vertices = Array.from({ length: TEXTURE_WIDTH * TEXTURE_HEIGHT }, (_, i) => i);
        const vIndex = createVbo(gl, vertices);
        vVBOList = [vIndex];

        position = [-1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, 1.0, 0.0, 1.0, -1.0, 0.0];
        const vPlane = createVbo(gl, position);
        planeVBOList = [vPlane];

        backBuffer = createFramebuffer(gl, TEXTURE_WIDTH, TEXTURE_HEIGHT, gl.FLOAT);
        frontBuffer = createFramebuffer(gl, TEXTURE_WIDTH, TEXTURE_HEIGHT, gl.FLOAT);

        gl.disable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);

        gl.bindFramebuffer(gl.FRAMEBUFFER, backBuffer.f);
        gl.viewport(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(prg);
        setAttribute(gl, planeVBOList, attLocation, attStride);
        gl.uniform2fv(uniLocation[0], resolution);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, position.length / 3);

        ambient = [];

        setupEventListeners();
    } catch (error) {
        console.error('Failed to load shaders:', error);
    }
}

function setupEventListeners() {
    window.addEventListener('mousedown', mouseDown, true);
    window.addEventListener('mouseup', mouseUp, true);
    window.addEventListener('mousemove', mouseMove, true);
    
    document.getElementById('audio-upload').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        const success = await audioProcessor.setup(file);
        if (success) {
            document.getElementById('info-text').textContent = "Playing... you can manipulate particles with the mouse.";
        }
    });
}

function rendering() {
    count++;
    const audioValue = audioProcessor.getAudioValue();

    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frontBuffer.f);
    gl.viewport(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(vPrg);
    gl.bindTexture(gl.TEXTURE_2D, backBuffer.t);
    setAttribute(gl, planeVBOList, vAttLocation, vAttStride);
    gl.uniform2fv(vUniLocation[0], resolution);
    gl.uniform1i(vUniLocation[1], 0);
    gl.uniform2fv(vUniLocation[2], [mousePositionX, mousePositionY]);
    gl.uniform1i(vUniLocation[3], mouseFlag);
    gl.uniform1f(vUniLocation[4], velocity);
    gl.uniform1f(vUniLocation[5], audioValue);
    gl.uniform1f(vUniLocation[6], count * 0.01);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, position.length / 3);

    ambient = hsva(count % 360, 1.0, 0.8, 1.0);

    gl.enable(gl.BLEND);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.05, 0.05, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(pPrg);
    gl.bindTexture(gl.TEXTURE_2D, frontBuffer.t);
    setAttribute(gl, vVBOList, pAttLocation, pAttStride);
    gl.uniform2fv(pUniLocation[0], resolution);
    gl.uniform1i(pUniLocation[1], 0);
    gl.uniform1f(pUniLocation[2], velocity);
    gl.uniform4fv(pUniLocation[3], ambient);
    gl.uniform1f(pUniLocation[4], audioValue);
    gl.drawArrays(gl.POINTS, 0, vertices.length);

    gl.flush();

    if (mouseFlag) {
        velocity = 1.0;
    } else {
        velocity = Math.max(0.2, velocity * 0.95);
    }

    flip = backBuffer;
    backBuffer = frontBuffer;
    frontBuffer = flip;

    requestAnimationFrame(rendering);
}

function mouseDown(event) { mouseFlag = true; }
function mouseUp(event) { mouseFlag = false; }
function mouseMove(event) {
    if (mouseFlag) {
        const rect = canvas.getBoundingClientRect();
        mousePositionX = (event.clientX - rect.left - canvas.width / 2.0) / (canvas.width / 2.0);
        mousePositionY = -(event.clientY - rect.top - canvas.height / 2.0) / (canvas.height / 2.0);
    }
}

window.addEventListener('load', async () => {
    await init();
    rendering();
});