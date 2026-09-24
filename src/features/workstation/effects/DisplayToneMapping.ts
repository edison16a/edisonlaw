import { wrapEffect } from '@react-three/postprocessing';
import { BlendFunction, Effect } from 'postprocessing';
import { DISPLAY_ALPHA } from '../screens/displayShader';

/**
 * AgX tone mapping for the room, while the monitor faces keep their exact colours.
 *
 * The faces write DISPLAY_ALPHA (see screens/displayShader) and every other surface writes 1.
 * Tone mapping would lift the screens' blacks, dim their whites and pull the colour out of
 * syntax highlighting, so display pixels pass through as painted, with only the bloom that
 * other lights throw over them.
 */
const fragmentShader = /* glsl */ `
#include <tonemapping_pars_fragment>

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float display = 1.0 - clamp(abs(texture2D(inputBuffer, uv).a - ${DISPLAY_ALPHA.toFixed(1)}), 0.0, 1.0);
  vec3 room = AgXToneMapping(inputColor.rgb);
  outputColor = vec4(mix(room, clamp(inputColor.rgb, 0.0, 1.0), display), 1.0);
}
`;

class DisplayToneMappingEffect extends Effect {
  constructor() {
    super('DisplayToneMappingEffect', fragmentShader, { blendFunction: BlendFunction.SRC });
  }
}

export const DisplayToneMapping = wrapEffect(DisplayToneMappingEffect);
