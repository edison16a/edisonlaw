/** The growth and imaging log in the lab notebook. */

export const COLUMNS = [
  { label: 'Date', width: 64 },
  { label: 'Sample', width: 62 },
  { label: 'Strain', width: 118 },
  { label: 'Condition', width: 104 },
  { label: 'OD600', width: 64, numeric: true },
  { label: 'CFU/mL', width: 78, numeric: true },
  { label: 'Stain', width: 80 },
  { label: 'Notes', width: 132 },
];

export const ROWS = [
  ['7/08', 'S01', 'E. coli K12', 'LB, 37 °C', '0.14', '2.1e7', 'none', 'lag phase'],
  ['7/08', 'S02', 'E. coli K12', 'LB + Amp', '0.09', '8.4e6', 'none', 'slower start'],
  ['7/09', 'S03', 'B. subtilis', 'LB, 37 °C', '0.46', '6.8e7', 'none', 'log phase'],
  ['7/09', 'S04', 'E. coli GFP', 'M9 glucose', '0.61', '9.2e7', 'GFP', 'imaged 40x'],
  ['7/10', 'S05', 'S. cerevisiae', 'YPD, 30 °C', '0.88', '1.4e7', 'DAPI', 'budding cells'],
  ['7/10', 'S06', 'E. coli GFP', 'M9 glucose', '1.12', '3.1e8', 'GFP', 'bright signal'],
  ['7/11', 'S07', 'B. subtilis', 'LB + Kan', '0.33', '4.0e7', 'none', 'repeat'],
  ['7/11', 'S08', 'HeLa', 'DMEM, 5% CO2', '', '', 'DAPI, GFP', 'fixed, 4% PFA'],
  ['7/12', 'S09', 'E. coli K12', 'LB, 37 °C', '1.36', '6.5e8', 'none', 'stationary'],
  ['7/12', 'S10', 'S. cerevisiae', 'YPD, 30 °C', '1.21', '3.3e7', 'DAPI', 'imaged 40x'],
  ['7/15', 'S11', 'HeLa', 'DMEM, 5% CO2', '', '', 'DAPI, GFP', 'img_0716 set'],
  ['7/15', 'S12', 'E. coli GFP', 'M9 + IPTG', '0.97', '2.4e8', 'GFP', 'induced 2 h'],
  ['7/16', 'S13', 'B. subtilis', 'LB, 37 °C', '0.72', '1.1e8', 'none', ''],
  ['7/16', 'S14', 'E. coli K12', 'LB + Amp', '0.58', '7.7e7', 'none', 'plasmid ok'],
];

/** Column of the cell the selection walks down while the screen animates. */
export const EDIT_COLUMN = 4;
