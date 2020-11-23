#version 300 es

in vec4 a_position;
uniform sampler2D u_texture;
out highp vec2 v_texCoord;

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

void main() {

  int width= 50;
  int height= 50;
  int yIndex= gl_InstanceID/width;
  int xIndex= gl_InstanceID-yIndex*width;
  float x= float(xIndex)/float(width);
  float y= float(yIndex)/float(height);

  vec4 velEncoded = texture(u_texture, vec2(x,y)); // rgba
  vec2 vel = vec2(decode(velEncoded.rg), decode(velEncoded.ba));

  gl_Position.y = a_position.y * (1.0/float(height))* 0.2;
  gl_Position.x = a_position.x * (1.0/float(width)*2.0 * length(vel));
  gl_Position.w = 1.0;

  vec2 normV = normalize(vel);
  gl_Position.xy = mat2(normV.x, -normV.y, normV.y, normV.x) * gl_Position.xy;

  gl_Position.x += (x-0.5)*2.0;
  gl_Position.y += (y-0.5)*2.0;

  v_texCoord = vec2((a_position.x+1.0)/2.0, (a_position.y+1.0)/2.0);
}