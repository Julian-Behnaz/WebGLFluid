import vertSrc from './vert.glsl';
import fragSrc from './frag.glsl';
import particleFragSrc from './particle-frag.glsl';
import particleVertSrc from './particle-vert.glsl';

// import * as Stats from "stats.js"
// let stats = new Stats();
// stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// stats.dom.style.left = "auto";
// stats.dom.style.right = "0";
// stats.dom.style.top = "50px";
// document.body.appendChild(stats.dom);

const canvas = document.querySelector("#main") as HTMLCanvasElement;

const gl = canvas.getContext("webgl2");
if(!gl){
    // No webgl support in this browser session
    // TODO: explain.
}

enum ShaderType {
    Vertex = gl.VERTEX_SHADER,
    Fragment = gl.FRAGMENT_SHADER
}

const vertexShader = createShader(gl, ShaderType.Vertex, vertSrc);
const particleVertexShader = createShader(gl, ShaderType.Vertex, particleVertSrc);
const fragmentShader = createShader(gl, ShaderType.Fragment, fragSrc);
const particleFragmentShader = createShader(gl, ShaderType.Fragment, particleFragSrc);
const program = createProgram(gl, vertexShader, fragmentShader);
const particleProgram = createProgram(gl, particleVertexShader, particleFragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const particlePositionLoc = gl.getAttribLocation(particleProgram, "a_position");
// const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
// const translationAttributeLocation= gl.getAttribLocation(program,"a_translation");
const timeUniformLocation= gl.getUniformLocation(program, "u_time");
const textureUniformLocation = gl.getUniformLocation(program, "u_texture");

const particleTimeUniformLocation= gl.getUniformLocation(particleProgram, "u_time");
const particleTextureUniformLoc = gl.getUniformLocation(particleProgram, "u_texture");



const particleTexture1 = gl.createTexture();
const particleTexture2 = gl.createTexture();

// Texture unit 0
gl.activeTexture(gl.TEXTURE0 + 0);


const TEX_WIDTH = 255;
const TEX_HEIGHT = 255;
gl.bindTexture(gl.TEXTURE_2D, particleTexture1);
{
    const bytesPerPixel = 4;
   // creating the data that we will use to represnet particle positions: r & b will be used to represnet x cordinate of the particle and g&A represnet y cordinate
    const data = new Uint8Array(TEX_WIDTH * TEX_HEIGHT * bytesPerPixel);
    for (let y = 0; y < TEX_HEIGHT; y++) {
        for (let x = 0; x < TEX_WIDTH; x++) {
            data[y * TEX_WIDTH * bytesPerPixel + x * bytesPerPixel + 0] = (Math.random()*255)|0; // r
            data[y * TEX_WIDTH * bytesPerPixel + x * bytesPerPixel + 2] = (Math.random()*255)|0; // b
            data[y * TEX_WIDTH * bytesPerPixel + x * bytesPerPixel + 1] = (Math.random()*255)|0; // g
            data[y * TEX_WIDTH * bytesPerPixel + x * bytesPerPixel + 3] = (Math.random()*255)|0; // A
        }
    }
    console.log(data);
    const alignment = 1;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
    //upload data to the GPU in a form of 2D texture width*height pixels
    gl.texImage2D(gl.TEXTURE_2D,
        /* level */0,
        /* internal format */gl.RGBA,
        TEX_WIDTH,
        TEX_HEIGHT,
        /* border */ 0,
        /* format */gl.RGBA,
        /* type */gl.UNSIGNED_BYTE,
        data);
    // set the filtering so we don't need mips and it's not filtered
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
gl.bindTexture(gl.TEXTURE_2D, particleTexture2);
{
    const alignment = 1;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
    //upload data to the GPU in a form of 2D texture width*height pixels
    gl.texImage2D(gl.TEXTURE_2D,
        /* level */0,
        /* internal format */gl.RGBA,
        TEX_WIDTH,
        TEX_HEIGHT,
        /* border */ 0,
        /* format */gl.RGBA,
        /* type */gl.UNSIGNED_BYTE,
        null);
    // set the filtering so we don't need mips and it's not filtered
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}


const particlePosition = gl.createBuffer();
{
  gl.bindBuffer(gl.ARRAY_BUFFER, particlePosition);

  const positions = [ //xy...
        /* pos */0,1,
        /* pos */0,-1,
        /* pos */1,0
 
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

const particleVao = gl.createVertexArray();
{
    gl.bindVertexArray(particleVao);

    gl.enableVertexAttribArray(particlePositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, particlePosition);
    {
        const size = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            particlePositionLoc, size, type, normalize, stride, offset);
        // Automatically binds whatever gl.ARRAY_BUFFER is (positionBuffer in this case) to the positionAttributeLocation
        gl.vertexAttribDivisor(particlePositionLoc, 0);
    }
}

const particleIndexBuffer = gl.createBuffer();
{
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, particleIndexBuffer);

  const indexes = [ // indices
    0, 1, 2, 2, 3, 1

/* 
index: 0            index: 2
 (-1,1)------------(1,1)
       |          / |
       |       /    |
       |    /       |
       | /          |
 (-1,-1)-----------(1,-1)
index: 1            index: 3
*/

  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
}

const positionBuffer = gl.createBuffer();
{
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // // WebGL Context:
    // {
    //     ARRAY_BUFFER = positionBuffer
    // }
    
/* 
 (-1,1)------------(1,1)
       |          / |
       |         /  |
       |  (0,0)     |
       |/           |
 (-1,-1)-----------(1,-1)

*/

    // three 2d points
    const positions = [ //xy...
        /* pos */-1, 1,
        /* pos */-1, -1,
        /* pos */1, 1,
        /* pos */1, 1,
        /* pos */-1, -1,
        /* pos */1, -1,
      ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

const vao = gl.createVertexArray();
{
    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    {
        const size = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
        // Automatically binds whatever gl.ARRAY_BUFFER is (positionBuffer in this case) to the positionAttributeLocation
    }
}

let readingFromTexture = particleTexture1;
let writingToTexture = particleTexture2;

const particleFrameBuffer= gl.createFramebuffer();

function drawNow(time: number) {
    // stats.begin();

    resize(canvas);
    


    gl.bindFramebuffer(gl.FRAMEBUFFER, particleFrameBuffer);
    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, writingToTexture, /* level */0);
        
    gl.bindTexture(gl.TEXTURE_2D, readingFromTexture);
        
    /* Set viewport to match texture size */
    gl.viewport(0, 0, 255, 255);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //texture:
    gl.useProgram(program);
    {
        gl.uniform1f(timeUniformLocation, time);
        // console.log(time);
        gl.uniform1i(textureUniformLocation, 0); // texture unit 0
        
        gl.bindVertexArray(vao);
        {
            const primitiveType = gl.TRIANGLES;
            const offset = 0;
            const count = 3*2; // How often to execute the vertex shader
            gl.drawArrays(primitiveType, offset, count);
        }
    }



    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, writingToTexture);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //particle: 
    gl.useProgram(particleProgram);
    {
        gl.uniform1i(particleTextureUniformLoc, 0); // texture unit 0
        gl.uniform1f(particleTimeUniformLocation, time);
        gl.bindVertexArray(particleVao);
        {
            const primitiveType = gl.TRIANGLES;
            const offset = 0;
            const count = 3; // How often to execute the vertex shader
            // gl.drawArrays(primitiveType, offset, count);
            // const indexType = gl.UNSIGNED_SHORT;
            // gl.drawElements(primitiveType, count, indexType, offset);
            // gl.drawArraysInstanced(gl.TRIANGLES,/* offset */0, /* verts per instance */3, /* instances */numTriangles);
            // gl.drawElementsInstanced(gl.TRIANGLES, count, indexType, 0, 255*255);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, count, 50*50);

            // gl.drawArraysInstanced(gl.TRIANGLES,
            //     /* offset */0,
            //     /* verts per instance */count,
            //     /* instances */255 * 255);
        }
    }


    const temp = readingFromTexture;
    readingFromTexture = writingToTexture;
    writingToTexture = temp;

    // stats.end();

    window.requestAnimationFrame(drawNow);
}

window.requestAnimationFrame(drawNow);







function createShader(
        gl: WebGL2RenderingContext,
        type: ShaderType,
        source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.error(`Shader compile failed ${ShaderType[type]}:`,gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
}

function createProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
   
    console.error("Program compile failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  /* from https://webgl2fundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html */
function resize(canvas: HTMLCanvasElement) {
    var cssToRealPixels = window.devicePixelRatio || 1;
  
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    var displayWidth  = Math.floor(canvas.clientWidth  * cssToRealPixels);
    var displayHeight = Math.floor(canvas.clientHeight * cssToRealPixels);
  
    // Check if the canvas is not the same size.
    if (canvas.width  !== displayWidth ||
        canvas.height !== displayHeight) {
  
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
}