/**
 * Fragment stage of a spiral card: cover fits the picture, rounds the corners
 * with a smooth edge, and lets far cards sink a little into the dark. Every
 * card reads one sharp sample of its picture, so nothing is ever blurred.
 */
export const cardFragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uImageAspect;
  uniform float uFlipY;
  uniform float uCornerRadius;
  uniform float uBrightness;
  uniform float uOpacity;
  uniform vec2 uViewport;
  uniform vec3 uFog;

  varying vec2 vUv;
  varying float vDepth;

  float roundedBox(vec2 p, vec2 halfSize, float radius) {
    vec2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  // Like CSS object-fit: cover. The picture fills the card and is never stretched.
  // Height is trimmed from the bottom only, so a screenshot keeps the header along its top.
  vec2 coverUv(vec2 uv) {
    float planeAspect = uSize.x / uSize.y;
    vec2 scale = planeAspect > uImageAspect
      ? vec2(1.0, uImageAspect / planeAspect)
      : vec2(planeAspect / uImageAspect, 1.0);
    return vec2((uv.x - 0.5) * scale.x + 0.5, 1.0 - (1.0 - uv.y) * scale.y);
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = roundedBox(p, uSize * 0.5, uCornerRadius);
    // One screen pixel of antialiasing, centred on the edge, keeps the outline crisp at any angle.
    float edge = max(fwidth(d), 1e-5);
    float mask = clamp(0.5 - d / edge, 0.0, 1.0);
    if (mask < 0.002) discard;

    float backFace = gl_FrontFacing ? 0.0 : 1.0;
    // Seen from behind, flip the picture so it still reads the right way round.
    vec2 uv = vec2(mix(vUv.x, 1.0 - vUv.x, backFace), vUv.y);
    uv = coverUv(uv);
    uv.y = mix(uv.y, 1.0 - uv.y, uFlipY);
    vec3 color = texture2D(uMap, uv).rgb;

    color *= uBrightness * (1.0 - 0.12 * backFace);
    float fog = smoothstep(7.0, 10.5, vDepth);
    color = mix(color, uFog, fog * 0.28);

    // Cards sink softly into the dark at the top and bottom edges of the stage.
    float y = gl_FragCoord.y / uViewport.y;
    float haze = max(1.0 - smoothstep(0.0, 0.16, y), smoothstep(0.88, 1.0, y));
    color = mix(color, uFog, haze * 0.45);
    float fade = smoothstep(0.0, 0.05, y) * (1.0 - smoothstep(0.96, 1.0, y));

    gl_FragColor = vec4(color, mask * uOpacity * fade);
    #include <colorspace_fragment>
  }
`;
