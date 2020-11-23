#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
in highp vec2 v_texCoord;

in highp vec2 v_vel;

// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // vec2 tx = (v_texCoord-vec2(0.5,0.5))*2.0;
  // float tl = length(tx);
  // outColor = vec4(1,0,1,1)*tl*0.5;

  /* TODO: Figure out what this means! */
  float t = (dot(vec3(v_vel.x,v_vel.y,0), vec3(1,1,1))+1.0)*0.5;

  outColor = mix(vec4(1,0,1,1),vec4(0,1,1,1), t);
}