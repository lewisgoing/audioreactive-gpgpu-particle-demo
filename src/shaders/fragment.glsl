precision mediump float;
uniform vec2 resolution;
void main(void){
    vec2 p = (gl_FragCoord.xy / resolution) * 2.0 - 1.0;
    // Add a little randomness to the initial position
    float random = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    gl_FragColor = vec4(p * (0.9 + random * 0.1), 0.0, 1.0);
}