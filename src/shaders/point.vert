attribute float index;
uniform vec2 resolution;
uniform sampler2D texture;
uniform float pointScale;
uniform float audio; // uniform for audio data
void main(void){
    vec2 p = vec2(mod(index, resolution.x) / resolution.x, floor(index / resolution.x) / resolution.y);
    vec4 t = texture2D(texture, p);
    // Change point size according to audio data
    gl_PointSize = (0.1 + pointScale) * (1.0 + audio * 5.0);
    gl_Position = vec4(t.xy, 0.0, 1.0);
}