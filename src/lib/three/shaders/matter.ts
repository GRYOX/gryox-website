import { TEXTURE_WIDTH } from "@/lib/device/tier";
import { simplexNoise } from "./noise";

export const matterVertex = /* glsl */ `
precision highp float;
precision highp sampler2D;

uniform sampler2D uTargets;
uniform float uRows;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uDissolve;
uniform float uTime;
uniform float uVelocity;
uniform float uEnergy;
uniform float uReact;
uniform vec3 uPointer;
uniform float uPointerActive;
uniform float uWorldSize;
uniform float uPointScale;
uniform float uOpacity;
uniform vec3 uGreen;
uniform vec3 uPurple;
uniform vec3 uWhite;

attribute float aIndex;
attribute vec4 aRandom;

varying vec3 vColor;
varying float vAlpha;

${simplexNoise}

vec4 fetchTarget(float t){
  float x = mod(aIndex, ${TEXTURE_WIDTH}.0);
  float y = floor(aIndex / ${TEXTURE_WIDTH}.0) + t * uRows;
  return texelFetch(uTargets, ivec2(int(x), int(y)), 0);
}

void main(){
  vec4 a = fetchTarget(uFrom);
  vec4 b = fetchTarget(uTo);

  // Staggered morph: each particle leaves at its own moment.
  float st = aRandom.x * 0.4;
  float m = smoothstep(st, st + 0.6, uMix);
  vec3 p = mix(a.xyz, b.xyz, m);
  float tone = mix(a.w, b.w, m);
  float transit = sin(3.14159265 * m);

  float t = uTime * 0.12;
  vec3 q = p * 1.35 + aRandom.y * 3.0;
  vec3 n = vec3(
    snoise(q + vec3(t, 0.0, 0.0)),
    snoise(q + vec3(0.0, t + 17.3, 0.0)),
    snoise(q + vec3(0.0, 0.0, t + 41.7))
  );
  float vel = clamp(abs(uVelocity), 0.0, 1.0) * uReact;
  float amp = 0.008 + transit * 0.32 + uEnergy * 0.12 + vel * 0.05;
  p += n * amp;

  // Dissolve into a cloud; each particle crosses the threshold at its own moment.
  vec3 dir = normalize(aRandom.yzw * 2.0 - 1.0 + 1e-4);
  vec3 cloud = dir * (1.5 + aRandom.x * 3.0) * vec3(1.35, 0.7, 0.9) + n * 0.35;
  float d = smoothstep(aRandom.w * 0.55, aRandom.w * 0.55 + 0.45, uDissolve);
  p = mix(p, cloud, d);

  // Scroll velocity stretches the matter along the scroll axis, then settles.
  p.y += uVelocity * 0.09 * uReact * (aRandom.z - 0.5);

  // Pointer: a soft repulsion field that lifts particles towards the viewer.
  vec2 dp = p.xy - uPointer.xy;
  float f = exp(-dot(dp, dp) / 0.045) * uPointerActive * uReact;
  p.xy += normalize(dp + 1e-5) * f * 0.16;
  p.z += f * 0.22;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = uWorldSize * (0.45 + aRandom.z * 1.1) * (1.0 + f * 0.8 + transit * 0.25);
  gl_PointSize = clamp(size * uPointScale / -mv.z, 1.0, 14.0);

  vec3 col = tone < 0.5 ? mix(uGreen, uWhite, tone * 2.0) : mix(uWhite, uPurple, (tone - 0.5) * 2.0);
  float twinkle = 0.78 + 0.22 * sin(uTime * 1.7 + aRandom.x * 43.0);
  vColor = col * twinkle * (1.0 + f * 0.6);
  vAlpha = uOpacity * (0.3 + 0.7 * aRandom.z) * (1.0 - d * 0.55);
}
`;

export const matterFragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.05, r);
  a *= a;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uPointScale;
uniform float uOpacity;
attribute vec4 aRandom;
varying float vAlpha;
varying float vTone;

void main(){
  vec3 p = position;
  // Parallax: nearer dust travels faster with the scroll; wraps vertically.
  float depth = clamp((p.z + 14.0) / 16.0, 0.05, 1.0);
  p.y = mod(p.y + uScroll * (0.6 + depth * 2.2) + 7.0, 14.0) - 7.0;
  p.x += sin(uTime * 0.05 + aRandom.x * 6.28) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((0.02 + aRandom.y * 0.03) * uPointScale / -mv.z, 1.0, 6.0);
  vAlpha = uOpacity * (0.15 + 0.5 * aRandom.z) * (0.6 + 0.4 * sin(uTime * 0.8 + aRandom.w * 30.0));
  vTone = aRandom.w;
}
`;

export const dustFragment = /* glsl */ `
uniform vec3 uGreen;
uniform vec3 uPurple;
uniform vec3 uWhite;
varying float vAlpha;
varying float vTone;
void main(){
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  vec3 col = vTone < 0.12 ? uGreen : vTone > 0.9 ? uPurple : uWhite;
  gl_FragColor = vec4(col, smoothstep(0.5, 0.0, r) * vAlpha);
}
`;
