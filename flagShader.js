const canvas = document.getElementById('flagCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL no está disponible en tu navegador.');
}

// Vertex Shader
const vertexShaderSource = `
    attribute vec4 a_position;
    uniform float u_time;
    void main() {
        // Aplicar un efecto de onda a la coordenada Y
        float wave = sin(u_time + a_position.x * 5.0) * 0.1;
        gl_Position = vec4(a_position.x, a_position.y + wave, a_position.z, 1.0);
    }
`;

// Fragment Shader
const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Color rojo
    }
`;

// Función para compilar shaders
function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error al compilar el shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Compilar Shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

if (!vertexShader || !fragmentShader) {
    console.error('Error al compilar los shaders.');
}

// Crear y enlazar el programa
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error al enlazar el programa:', gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// Configurar el buffer de vértices
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Crear una malla de vértices para la bandera
const segments = 50; // Número de subdivisiones a lo largo del eje X
const positions = [];
for (let i = 0; i <= segments; i++) {
    const x = -0.5 + (i / segments) * 1.0; // Coordenada X entre -0.5 y 0.5
    positions.push(x, -0.5); // Vértice inferior
    positions.push(x, 0.5);  // Vértice superior
}
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Obtener la ubicación de la variable uniforme de tiempo
const timeUniformLocation = gl.getUniformLocation(program, 'u_time');

// Función de renderizado
let time = 0;
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(timeUniformLocation, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);

    time += 0.06; // Incrementar el tiempo para animar la bandera

    requestAnimationFrame(render);
}

// Iniciar la animación
render();