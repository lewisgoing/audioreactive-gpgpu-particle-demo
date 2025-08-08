export function createShader(gl, shaderType, shaderText) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

export function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    gl.useProgram(program);
    return program;
}

export function createVbo(gl, data) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

export function setAttribute(gl, vbo, attL, attS) {
    for (let i in vbo) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        gl.enableVertexAttribArray(attL[i]);
        gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
    }
}

export function createFramebuffer(gl, width, height, format) {
    const textureFormat = format || gl.UNSIGNED_BYTE;
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const fTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, textureFormat, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { f: frameBuffer, t: fTexture };
}

export function hsva(h, s, v, a) {
    if (s > 1 || v > 1 || a > 1) { return; }
    let th = h % 360;
    let i = Math.floor(th / 60);
    let f = th / 60 - i;
    let m = v * (1 - s);
    let n = v * (1 - s * f);
    let k = v * (1 - s * (1 - f));
    let color = new Array();
    if (!s > 0 && !s < 0) {
        color.push(v, v, v, a);
    } else {
        let r = new Array(v, n, m, m, k, v);
        let g = new Array(k, v, v, n, m, m);
        let b = new Array(m, m, k, v, v, n);
        color.push(r[i], g[i], b[i], a);
    }
    return color;
}