#version 300 es
 
in highp vec2 v_texCoord;

uniform sampler2D u_quantity;//inkreadtexture
uniform sampler2D u_vel;//VelWriteText

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
uniform float u_time;
 
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

      vec4 a = texture(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture(sam, (iuv + vec2(1.5, 1.5)) * tsize);

      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }

void main() {
  vec4 velEncoded = texture(u_vel, v_texCoord);
  vec2 vel = vec2(decode(velEncoded.rg), decode(velEncoded.ba));

  // vec2 vel = vec2(0.5, 0.0);
  float dt = 3.8;//0.01666666667;
  float width = 255.0;
  float height = 255.0;
  vec2 texelSize = 1.0/vec2(width,height);
  // vec4 c = bilerp(u_quantity, v_texCoord-dt*vel*texelSize, texelSize);
  vec4 c = texture(u_quantity, v_texCoord-dt*vel*texelSize);

  float dissipation = 0.001;
  float decay = 1.0 + dissipation * dt;
  c = c / decay;

      // vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      // vec4 result = texture2D(uSource, coord);
  // vec4 prevColor = texture(u_quantity, v_texCoord);


  vec2 swirlVec = vec2(sin(2.0*3.14159* v_texCoord.y+5.3), sin(2.0*3.14159* v_texCoord.x));
  swirlVec = normalize(swirlVec) * (length(vec2(1.0)) - length(swirlVec));

  // vec4 circCol = vec4((sin(u_time*0.003)+1.0)*0.3,(sin(u_time*0.003)+1.0)*0.3,0.0,1.0);
  vec4 circCol = mix(vec4(1,0,1,1),vec4(0,0,1,1),(sin(u_time*0.003)+1.0)*0.5);

  // outColor = length((v_texCoord-0.5)*2.0) > 0.3? c : circCol;
//   outColor = length(swirlVec) > ((sin(u_time)+1.0)*0.5)*1.5? circCol : c;
//   outColor = length((v_texCoord-0.5)*2.0) > 0.3? vec4(0,1,0,1) : circCol;

  // outColor = length((v_texCoord-0.9)*2.0) > 0.3? c : circCol;
  float theta = u_time * 0.0003;
  vec2 origin = mat2(cos(theta), sin(theta), -sin(theta), cos(theta)) * (vec2(0.5,0.5));
  vec2 p = (v_texCoord-0.5)*2.0;// + vec2(sin(u_time*0.0003), sin(u_time*0.0003));
  // vec2 period = vec2(0.6);
  // vec2 q = mod(p+0.5*period,period)-0.5*period;
  vec2 q = p;
  // outColor = mix(c,circCol, smoothstep(length(q), 0.1, 1.0));
  float rad = 0.2;
  float innerRad = 0.05;
  float thickness = 0.5;
  float innerThickness = 0.01;
  float alpha = smoothstep(rad-thickness, rad, length(q-origin));
  // smoothstep(innerRad-innerThickness, innerRad, length(q-origin))
  outColor = mix(circCol, c, alpha);


  // outColor = c;
  // outColor = circCol;
}