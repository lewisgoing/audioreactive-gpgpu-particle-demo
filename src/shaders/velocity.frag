precision mediump float;
uniform vec2 resolution;
uniform sampler2D texture;
uniform vec2 mouse;
uniform bool mouseFlag;
uniform float velocity;
uniform float audio; // uniform for audio data
uniform float time;  // uniform for time

const float SPEED = 0.01;

void main(void){
    vec2 p = gl_FragCoord.xy / resolution;
    vec4 t = texture2D(texture, p);

    // Determine the position of the attractor (the point that pulls)
    vec2 attractor;
    if(mouseFlag){
        // When the mouse is pressed, use the mouse cursor as the attractor
        attractor = mouse;
    } else {
        // When the mouse is not pressed, use a point moving over time as the attractor
        attractor.x = sin(time * 0.3) * 0.8;
        attractor.y = cos(time * 0.2) * 0.8;
    }

    // Vector towards the attractor
    vec2 v = normalize(attractor - t.xy) * 0.1;

    // Correct the direction
    vec2 w = normalize(v + t.zw);

    // Change speed according to audio data and velocity
    float currentSpeed = SPEED * (velocity + audio * 2.0);
    
    // Prevent going off-screen
    vec2 nextPos = t.xy + w * currentSpeed;
    nextPos = clamp(nextPos, -1.0, 1.0);

    vec4 destColor = vec4(nextPos, w);

    gl_FragColor = destColor;
}