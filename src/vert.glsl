#version 300 es
 
in vec4 a_position;

uniform float u_time;

out highp vec2 v_texCoord;

void main() {
  v_texCoord = vec2((a_position.x+1.0)/2.0, (a_position.y+1.0)/2.0);
  gl_Position = a_position;
}