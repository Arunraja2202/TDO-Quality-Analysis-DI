/**
 * src/excel.js
 *
 * Generates the DI-Error-Report Excel file using the `xlsx` (SheetJS) library.
 * Mirrors the Python create_excel() + add_hyperlinks_to_summary() functions.
 *
 * Note: SheetJS CE (the open-source edition) does not support hyperlink
 * formulas in cells.  The summary sheet therefore includes a plain "Go to →"
 * text reference instead of a clickable HYPERLINK() formula.  If you need
 * real hyperlinks you can swap to the commercial SheetJS Pro or use the
 * `exceljs` package.
 */

'use strict';

const XLSX = require('xlsx');
const path = require('path');

/**
 * @param {Object} resultDict - key → array-of-row-objects
 * @param {string} outputDir  - folder to write the file into
 * @returns {Promise<string>} - absolute path of the generated xlsx
 */
async function createExcel(resultDict, outputDir) {
  const timestamp = new Date()
    .toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '')
    .slice(0, 17);           // e.g. 2024-05-01_143022
  const filename  = `DI-Error-Report-${timestamp}.xlsx`;
  const filepath  = path.join(outputDir, filename);

  const wb = XLSX.utils.book_new();

  // ── 1. Write each error-category sheet ──────────────────────────────────────
  for (const [sheetName, data] of Object.entries(resultDict)) {
    if (sheetName === 'Error Summary') continue; // written last
    if (!Array.isArray(data) || data.length === 0) {
      // Write an empty sheet so the file is complete
      const ws = XLSX.utils.aoa_to_sheet([['No errors found']]);
      XLSX.utils.book_append_sheet(wb, ws, safeName(sheetName));
      continue;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    applyHeaderStyle(ws);
    XLSX.utils.book_append_sheet(wb, ws, safeName(sheetName));
  }

  // ── 2. Build the Error Summary sheet ────────────────────────────────────────
  const summaryRows = [['Sheet Name', 'Error Count', 'Navigation']];
  for (const [sheetName, data] of Object.entries(resultDict)) {
    if (sheetName === 'Error Summary') continue;
    const count = Array.isArray(data) ? data.length : 0;
    summaryRows.push([sheetName, count, `→ ${safeName(sheetName)}`]);
  }
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  applyHeaderStyle(summaryWs);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Error Summary');

  // ── 3. Write file ────────────────────────────────────────────────────────────
  XLSX.writeFile(wb, filepath);
  return filepath;
}

/** Truncate sheet names to 31 chars and strip illegal characters */
function safeName(name) {
  return name.replace(/[\\/?:*"<>|]/g, '_').slice(0, 31);
}

/**
 * Apply a basic header style (bold + coloured fill) to row 1.
 * SheetJS CE supports limited cell-level formatting via !cols / !rows.
 */
function applyHeaderStyle(ws) {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = {
      font:    { bold: true, color: { rgb: 'FF0000' } },
      fill:    { fgColor: { rgb: 'FFCCCC' } },
      alignment: { horizontal: 'center' },
    };
  }
}

module.exports = { createExcel };
