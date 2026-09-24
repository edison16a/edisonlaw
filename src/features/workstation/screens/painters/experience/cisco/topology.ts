/** The campus network on the slide: devices, links and the routes packets take. */

export type DeviceKind = 'cloud' | 'firewall' | 'router' | 'core' | 'switch' | 'laptop' | 'phone' | 'ap';

export interface Device {
  id: string;
  kind: DeviceKind;
  /** Position inside the slide, in slide pixels. */
  x: number;
  y: number;
  label?: string;
}

export const DEVICES: Device[] = [
  { id: 'internet', kind: 'cloud', x: 482, y: 150, label: 'Internet' },
  { id: 'fw', kind: 'firewall', x: 482, y: 212, label: 'Firewall' },
  { id: 'core1', kind: 'router', x: 392, y: 276, label: 'Core 1' },
  { id: 'core2', kind: 'router', x: 572, y: 276, label: 'Core 2' },
  { id: 'dist1', kind: 'core', x: 322, y: 356, label: 'Dist 1' },
  { id: 'dist2', kind: 'core', x: 642, y: 356, label: 'Dist 2' },
  { id: 'acc1', kind: 'switch', x: 176, y: 428 },
  { id: 'acc2', kind: 'switch', x: 382, y: 428 },
  { id: 'acc3', kind: 'switch', x: 582, y: 428 },
  { id: 'acc4', kind: 'switch', x: 788, y: 428 },
  { id: 'pc1', kind: 'laptop', x: 146, y: 484 },
  { id: 'ap1', kind: 'ap', x: 206, y: 484 },
  { id: 'pc2', kind: 'laptop', x: 352, y: 484 },
  { id: 'ph2', kind: 'phone', x: 412, y: 484 },
  { id: 'ap3', kind: 'ap', x: 552, y: 484 },
  { id: 'pc3', kind: 'laptop', x: 612, y: 484 },
  { id: 'ph4', kind: 'phone', x: 758, y: 484 },
  { id: 'pc4', kind: 'laptop', x: 818, y: 484 },
];

export interface Link {
  from: string;
  to: string;
  /** Spanning tree blocks the redundant uplinks until they are needed. */
  standby?: boolean;
  weight?: number;
}

const access = ['acc1', 'acc2', 'acc3', 'acc4'];

export const LINKS: Link[] = [
  { from: 'internet', to: 'fw', weight: 2 },
  { from: 'fw', to: 'core1', weight: 2 },
  { from: 'fw', to: 'core2', weight: 2 },
  { from: 'core1', to: 'core2', weight: 3 },
  { from: 'core1', to: 'dist1', weight: 2 },
  { from: 'core1', to: 'dist2', weight: 2 },
  { from: 'core2', to: 'dist1', weight: 2 },
  { from: 'core2', to: 'dist2', weight: 2 },
  ...access.flatMap((id, index) => [
    { from: id, to: index < 2 ? 'dist1' : 'dist2' },
    { from: id, to: index < 2 ? 'dist2' : 'dist1', standby: true },
  ]),
  { from: 'acc1', to: 'pc1' },
  { from: 'acc1', to: 'ap1' },
  { from: 'acc2', to: 'pc2' },
  { from: 'acc2', to: 'ph2' },
  { from: 'acc3', to: 'ap3' },
  { from: 'acc3', to: 'pc3' },
  { from: 'acc4', to: 'ph4' },
  { from: 'acc4', to: 'pc4' },
];

/** Routes packets travel, device ids in order. */
export const ROUTES = [
  ['pc1', 'acc1', 'dist1', 'core1', 'fw', 'internet'],
  ['internet', 'fw', 'core2', 'dist2', 'acc3', 'pc3'],
  ['ph2', 'acc2', 'dist1', 'core2', 'dist2', 'acc4', 'ph4'],
  ['pc4', 'acc4', 'dist2', 'core1', 'fw', 'internet'],
  ['internet', 'fw', 'core1', 'dist1', 'acc2', 'pc2'],
];

export const deviceById = (id: string) => DEVICES.find((device) => device.id === id) as Device;
