#version 300 es
 
in highp vec2 v_texCoord;

uniform sampler2D u_quantity;//velReadTex
uniform sampler2D u_vel;//velReadTex


// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
vec2 encode(float value) {
  // value is between -1 and 1
  // shift it to be between 0 and 1:
  float v = ((value + 1.0) * 0.5) * 65535.0;
  float hi = floor(v/256.0);
  float lo = v - (hi*256.0);
  return vec2(hi, lo)/255.0;
}

float decode(vec2 channels) {
  vec2 hilo = channels*255.0;
  float hi = hilo.x * 256.0;
  float lo = hilo.y;
  float res = (hi + lo)/65535.0;
  return (res - 0.5)*2.0;
}


  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;

      vec2 iuv = floor(st);
      vec2 fuv = fract(st);

      vec4 aEnc = texture(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec2 a = vec2(decode(aEnc.rg), decode(aEnc.ba));
      vec4 bEnc = texture(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec2 b = vec2(decode(bEnc.rg), decode(bEnc.ba));
      vec4 cEnc = texture(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec2 c = vec2(decode(cEnc.rg), decode(cEnc.ba));
      vec4 dEnc = texture(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      vec2 d = vec2(decode(dEnc.rg), decode(dEnc.ba));

      // vec4 res =  mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      vec2 res =  mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      return vec4(encode(res.x), encode(res.y));
  }

void main() {
  // vec4 velEncoded = texture(u_vel, v_texCoord);
  // vec2 vel = vec2(decode(velEncoded.rg), decode(velEncoded.ba));
  // float dt = 0.1;//0.1;//0.01666666667;
  // float width = 255.0;
  // float height = 255.0;
  // vec2 texelSize = 1.0/vec2(width,height);
  // outColor = bilerp(u_quantity, (v_texCoord-dt*vel*texelSize), texelSize);
  
  outColor = texture(u_vel, v_texCoord);
}