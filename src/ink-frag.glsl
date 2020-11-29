#version 300 es
 
in highp vec2 v_texCoord;

uniform sampler2D u_texture; // inkWriteTex

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {  
  vec4 color = texture(u_texture, v_texCoord);
  outColor = color * 0.5;
  outColor.a = 1.0;
}