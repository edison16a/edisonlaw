import { Color, Float32BufferAttribute, SphereGeometry, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PALETTE } from '../materials';
import { coveredLineAt } from './hairShape';
import { anglesOf, headRadius } from './headShape';

const skin = new Color(PALETTE.skin);
const shade = new Color(PALETTE.skinShade);
const blush = new Color(PALETTE.blush);

/** Cheek centres, just under and outside the eyes. */
const CHEEKS = [new Vector3(0.5, -0.31, 0.81).normalize(), new Vector3(-0.5, -0.31, 0.81).normalize()];

const direction = new Vector3();
const color = new Color();

/** Blush on the cheeks, a soft contact shadow under the hairline and a little shade under the jaw. */
export function paintSkin(point: Vector3, out: Color) {
  direction.copy(point).normalize();
  out.copy(skin);

  let cheek = 0;
  for (const center of CHEEKS) cheek += Math.exp((direction.dot(center) - 1) / 0.0075);
  out.lerp(blush, Math.min(1, cheek) * 0.55);

  const [theta, phi] = anglesOf(point);
  const hairShadow = 0.45 * Math.exp(-Math.max(0, theta - coveredLineAt(phi)) / 5);
  const underJaw = Math.max(0, -direction.y - 0.55) * 1.6;
  out.lerp(shade, Math.min(1, hairShadow + underJaw));
  return out;
}

/** The skull surface as a smooth closed mesh with painted vertex colours, centred on the head centre. */
export function headGeometry(widthSegments = 80, heightSegments = 56) {
  const sphere = new SphereGeometry(1, widthSegments, heightSegments);
  sphere.deleteAttribute('normal');
  sphere.deleteAttribute('uv');
  const geometry = mergeVertices(sphere, 1e-6);
  sphere.dispose();

  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const point = new Vector3();
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i).normalize();
    point.multiplyScalar(headRadius(point.x, point.y, point.z));
    positions.setXYZ(i, point.x, point.y, point.z);
    paintSkin(point, color);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}
