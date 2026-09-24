/** Silver nanoparticle hydrogel results behind the figure and the summary table. */

export interface Gel {
  label: string;
  /** J shaped curve: stress = scale * (exp(strain / stiffening) - 1), in kPa. */
  scale: number;
  stiffening: number;
  /** Strain at failure, percent. */
  failure: number;
}

export const GELS: Gel[] = [
  { label: '0 wt% AgNP', scale: 3.2, stiffening: 175, failure: 470 },
  { label: '0.5 wt% AgNP', scale: 3.8, stiffening: 170, failure: 440 },
  { label: '1.0 wt% AgNP', scale: 4.6, stiffening: 165, failure: 410 },
  { label: '2.0 wt% AgNP', scale: 5.8, stiffening: 160, failure: 330 },
];

export const stressAt = (gel: Gel, strain: number) => gel.scale * (Math.exp(strain / gel.stiffening) - 1);

/** Zone of inhibition diameters in mm, including the 6 mm disc, with standard deviations. */
export const ZONES = {
  concentrations: ['0', '0.5', '1.0', '2.0'],
  coli: [6, 9.8, 13.1, 16.4],
  coliError: [0.2, 0.6, 0.5, 0.8],
  aureus: [6, 8.9, 11.7, 14.2],
  aureusError: [0.2, 0.5, 0.7, 0.6],
};

export const SUMMARY = {
  columns: ['sample', 'AgNP wt%', 'max strain %', 'modulus kPa', 'E. coli mm', 'S. aureus mm', 'viability %'],
  rows: [
    ['G0', '0.0', '470', '18.3', '6.0', '6.0', '98.1'],
    ['G1', '0.5', '440', '22.4', '9.8', '8.9', '96.4'],
    ['G2', '1.0', '410', '27.9', '13.1', '11.7', '94.2'],
    ['G3', '2.0', '330', '36.2', '16.4', '14.2', '81.7'],
  ],
};
