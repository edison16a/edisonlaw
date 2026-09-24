/**
 * Vertex stage of a spiral card: wraps the flat plane around the spiral's
 * cylinder, bows it with speed, and sweeps the whole strand into a vortex.
 * The card in focus moves with the sweep but keeps its own shape, so it
 * reads as a plain flat rectangle. cardHit.ts and anchor.ts mirror this.
 */
export const cardVertexShader = /* glsl */ `
  uniform float uCurvature;
  uniform float uBow;
  uniform float uSweep;
  uniform float uFlat;

  varying vec2 vUv;
  varying float vDepth;

  #define PI 3.141592653589793

  void main() {
    vUv = uv;
    vec3 p = position;

    // Wrap around the cylinder so both side edges fall back toward the axis.
    if (abs(uCurvature) > 0.0001) {
      float angle = p.x * uCurvature;
      p.z = (cos(angle) - 1.0) / uCurvature;
      p.x = sin(angle) / uCurvature;
    }

    // Speed bows the middle of the card along the strand, like a sheet in a draft.
    p.x += sin(uv.y * PI) * uBow;

    vec4 world = modelMatrix * vec4(p, 1.0);
    vec4 view = viewMatrix * world;

    // The strand drifts right above and below the camera, which turns the spiral into a sweep.
    // A flat card takes the sweep of its centre everywhere, so its sides stay straight.
    float centreY = modelMatrix[3].y;
    view.x += uSweep * mix(world.y * world.y, centreY * centreY, uFlat);

    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
  }
`;
