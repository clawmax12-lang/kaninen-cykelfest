import * as XLSX from "xlsx";

// Column definitions
const columns = [
  { key: "namn", label: "namn", width: 28 },
  { key: "telefon", label: "telefon", width: 18 },
  { key: "roll", label: "roll", width: 12 },
  { key: "lag", label: "lag", width: 18 },
  { key: "allergier", label: "allergier", width: 30 },
  { key: "bekraftad", label: "bekraftad", width: 14 },
  { key: "forratt_vard", label: "forratt_vard", width: 24 },
  { key: "varmratt_vard", label: "varmratt_vard", width: 24 },
  { key: "efterratt_vard", label: "efterratt_vard", width: 24 },
  { key: "uppdrag", label: "uppdrag", width: 34 },
];

// Example rows with realistic Swedish data
const exampleRows = [
  {
    namn: "Anna Lindström",
    telefon: "070-123 45 67",
    roll: "host",
    lag: "Safari",
    allergier: "Glutenintolerans",
    bekraftad: "ja",
    forratt_vard: "Erik Johansson",
    varmratt_vard: "Anna Lindström",
    efterratt_vard: "Maria Svensson",
    uppdrag: "Ansvarig för musik",
  },
  {
    namn: "Erik Johansson",
    telefon: "073-987 65 43",
    roll: "guest",
    lag: "Backpacking",
    allergier: "Nötallergi",
    bekraftad: "ja",
    forratt_vard: "Anna Lindström",
    varmratt_vard: "Erik Johansson",
    efterratt_vard: "Erik Johansson",
    uppdrag: "",
  },
  {
    namn: "Maria Svensson",
    telefon: "076-555 44 33",
    roll: "guest",
    lag: "Kryssning",
    allergier: "",
    bekraftad: "nej",
    forratt_vard: "Maria Svensson",
    varmratt_vard: "Maria Svensson",
    efterratt_vard: "Anna Lindström",
    uppdrag: "Fotografering",
  },
];

// Colors
const TEAL = "1C4F4A";
const WHITE = "FFFFFF";
const CREAM = "F5EFE0";
const LIGHT_TEAL = "D4E8E6";

// Create workbook and worksheet
const wb = XLSX.utils.book_new();

// Build the sheet data array (row by row)
// Row 1: Title (will be merged)
// Row 2: Column headers
// Rows 3-5: Example data

const titleRow = ["Kaninens Cykelfest 2026 — Deltagarimport"];
const headerRow = columns.map((c) => c.label);

const sheetData: (string | number)[][] = [
  titleRow,
  headerRow,
  ...exampleRows.map((row) =>
    columns.map((c) => (row as Record<string, string>)[c.key] ?? "")
  ),
];

const ws = XLSX.utils.aoa_to_sheet(sheetData);

// Set column widths
ws["!cols"] = columns.map((c) => ({ wch: c.width }));

// Merge title row across all columns
const lastColLetter = XLSX.utils.encode_col(columns.length - 1);
ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }];

// Helper to set cell style
function setCellStyle(
  ws: XLSX.WorkSheet,
  cellAddr: string,
  style: Record<string, unknown>
) {
  if (!ws[cellAddr]) ws[cellAddr] = { t: "s", v: "" };
  ws[cellAddr].s = style;
}

// Title row style (row 1, index 0)
const titleStyle = {
  font: { bold: true, sz: 16, color: { rgb: WHITE }, name: "Calibri" },
  fill: { patternType: "solid", fgColor: { rgb: TEAL } },
  alignment: { horizontal: "center", vertical: "center", wrapText: false },
  border: {
    bottom: { style: "medium", color: { rgb: LIGHT_TEAL } },
  },
};

// Apply title style to A1 (the merged cell)
setCellStyle(ws, "A1", titleStyle);

// Set row height for title row
ws["!rows"] = [{ hpt: 36 }, { hpt: 22 }];

// Header row style (row 2, index 1)
const headerStyle = {
  font: { bold: true, sz: 11, color: { rgb: WHITE }, name: "Calibri" },
  fill: { patternType: "solid", fgColor: { rgb: TEAL } },
  alignment: { horizontal: "center", vertical: "center", wrapText: false },
  border: {
    top: { style: "thin", color: { rgb: LIGHT_TEAL } },
    bottom: { style: "medium", color: { rgb: LIGHT_TEAL } },
    left: { style: "thin", color: { rgb: LIGHT_TEAL } },
    right: { style: "thin", color: { rgb: LIGHT_TEAL } },
  },
};

columns.forEach((_, colIdx) => {
  const cellAddr = XLSX.utils.encode_cell({ r: 1, c: colIdx });
  setCellStyle(ws, cellAddr, headerStyle);
});

// Data row styles (rows 3-5, indices 2-4)
exampleRows.forEach((_, rowIdx) => {
  const isEven = rowIdx % 2 === 0;
  const bgColor = isEven ? WHITE : CREAM;

  const dataStyle = {
    font: { sz: 10, name: "Calibri", color: { rgb: "2D2D2D" } },
    fill: { patternType: "solid", fgColor: { rgb: bgColor } },
    alignment: { horizontal: "left", vertical: "center", wrapText: false },
    border: {
      top: { style: "thin", color: { rgb: "E0D8C8" } },
      bottom: { style: "thin", color: { rgb: "E0D8C8" } },
      left: { style: "thin", color: { rgb: "E0D8C8" } },
      right: { style: "thin", color: { rgb: "E0D8C8" } },
    },
  };

  columns.forEach((_, colIdx) => {
    const cellAddr = XLSX.utils.encode_cell({ r: rowIdx + 2, c: colIdx });
    setCellStyle(ws, cellAddr, dataStyle);
  });

  // Extra height for data rows
  if (!ws["!rows"]) ws["!rows"] = [];
  ws["!rows"][rowIdx + 2] = { hpt: 20 };
});

// Add the worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, "Deltagare");

// Write file
const outputPath = "/home/user/workspace/backend/participant-template.xlsx";
XLSX.writeFile(wb, outputPath, { bookType: "xlsx", type: "buffer" });

console.log(`Template created successfully: ${outputPath}`);
