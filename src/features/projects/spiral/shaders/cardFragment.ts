/**
 * Fragment stage of a spiral card: cover fits the picture, rounds the corners,
 * blurs by distance and speed, and lets far cards sink into the dark.
 */
export const cardFragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uImageAspect;
  uniform float uFlipY;
  uniform float uCornerRadius;
  uniform float uBlur;
  uniform float uStreak;
  uniform float uBrightness;
  uniform float uOpacity;
  uniform float uHover;
  uniform vec2 uViewport;
  uniform vec3 uFog;

  varying vec2 vUv;
  varying float vDepth;

  float roundedBox(vec2 p, vec2 halfSize, float radius) {
    vec2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  // Like CSS object-fit: cover. The picture fills the card and is never stretched.
  vec2 coverUv(vec2 uv) {
    float planeAspect = uSize.x / uSize.y;
    vec2 scale = planeAspect > uImageAspect
      ? vec2(1.0, uImageAspect / planeAspect)
      : vec2(planeAspect / uImageAspect, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  vec2 textureUv(vec2 uv) {
    return vec2(uv.x, mix(uv.y, 1.0 - uv.y, uFlipY));
  }

  // Binomial weights for a five by three kernel, wide along the strand.
  const float WEIGHTS_X[5] = float[5](1.0, 4.0, 6.0, 4.0, 1.0);
  const float WEIGHTS_Y[3] = float[3](1.0, 2.0, 1.0);

  // Out of focus pictures smear into a few soft ghosts, the look of a long exposure.
  // Speed stretches the ghosts along the strand into a motion streak.
  vec3 samplePicture(vec2 uv, float blur, float streak) {
    if (blur < 0.004 && abs(streak) < 0.002) return texture2D(uMap, textureUv(uv)).rgb;

    vec2 spacing = vec2(0.03 * blur + abs(streak) * 0.5, 0.018 * blur);
    float bias = blur * 0.9 + abs(streak) * 8.0;
    vec3 sum = vec3(0.0);
    for (int x = 0; x < 5; x++) {
      for (int y = 0; y < 3; y++) {
        vec2 tap = uv + vec2(float(x - 2), float(y - 1)) * spacing;
        sum += texture2D(uMap, textureUv(clamp(tap, 0.0, 1.0)), bias).rgb * WEIGHTS_X[x] * WEIGHTS_Y[y];
      }
    }
    return sum / 64.0;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = roundedBox(p, uSize * 0.5, uCornerRadius);
    float edge = fwidth(d);
    float mask = 1.0 - smoothstep(-edge, edge * 0.5, d);
    if (mask < 0.002) discard;

    float backFace = gl_FrontFacing ? 0.0 : 1.0;
    // Seen from behind, flip the picture so it still reads the right way round.
    vec2 uv = vec2(mix(vUv.x, 1.0 - vUv.x, backFace), vUv.y);
    uv = coverUv(uv);
    uv = (uv - 0.5) / (1.0 + 0.04 * uHover) + 0.5;

    float blur = clamp(uBlur + backFace * 0.25, 0.0, 1.0);
    vec3 color = samplePicture(uv, blur, uStreak);

    color *= uBrightness * (1.0 - 0.1 * backFace) * (1.0 + 0.1 * uHover);
    float fog = smoothstep(6.5, 10.5, vDepth);
    color = mix(color, uFog, fog * 0.3);

    // Cards sink into the dark at the top and bottom edges of the stage.
    float y = gl_FragCoord.y / uViewport.y;
    float haze = max(1.0 - smoothstep(0.0, 0.2, y), smoothstep(0.84, 1.0, y));
    color = mix(color, uFog, haze * 0.55);
    float fade = smoothstep(0.0, 0.07, y) * (1.0 - smoothstep(0.95, 1.0, y));

    gl_FragColor = vec4(color, mask * uOpacity * fade);
    #include <colorspace_fragment>
  }
`;
