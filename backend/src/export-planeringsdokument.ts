/**
 * Generates the full "Cykelfest Planeringsdokument" Excel workbook
 * with 6 sheets: Deltagare 2026, Lagindelning, Förrätt, Varmrätt, Efterrätt, Uppdrag
 *
 * Mirrors the format of the manually maintained Excel file (v3, April 2026).
 */
import ExcelJS from "exceljs";
import { prisma } from "./prisma.js";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Participant {
  name: string;
  team: string;
  phone: string;
  address: string;
  email: string;
  dietary: string;
  confirmed: boolean;
  forratHost: string;
  varmrattHost: string;
  efterrattHost: string;
  mission: string;
  familyId: string;
  efternamn: string;
  fornamn: string;
  gender: string;
}

// ─── REFERENCE DATA ──────────────────────────────────────────────────────────
// Gender map (from original planning doc — names that aren't obviously gendered)
const GENDER_MAP: Record<string, string> = {};

function inferGender(name: string): string {
  if (GENDER_MAP[name]) return GENDER_MAP[name];
  const fn: string = name.split(" ")[0] ?? "";
  // Swedish female names typically end in -a, -e (not always)
  const femaleNames = new Set([
    "Linda", "Ann-Carine", "Jenny", "Carolina", "Sara", "Stina", "Katarina",
    "Karin", "Marie", "Jennie", "Victoria", "Ulrika", "Cecilia", "Maria",
    "Anette", "Charlotte", "Annika", "Ingela", "Hanna", "Helena", "Anna",
    "Malin", "Ellen", "Emma", "Erika", "Eva", "Johanna", "Lena", "Nina",
    "Deborah", "Kajsa", "Milla", "Monica", "Sabine", "Sofia", "Åsa",
    "Ulrica", "Christina", "Marie-Louise",
  ]);
  const maleNames = new Set([
    "Daniel", "Tobias", "Sigge", "Marcus", "Gustaf", "Magnus", "Peter",
    "Per", "Sven-Åke", "Christofer", "Tommy", "Juppe", "Mikael", "Mats",
    "Johan", "Håkan", "Mattias", "Niclas", "Hans", "LG", "Michell",
    "Andreas", "Fredrik", "Calle", "Christopher", "David", "Matthias",
    "Markus", "Jörgen", "Oscar", "PO", "Robert", "Ronny", "Svante",
    "Tomas", "Olov",
  ]);
  if (femaleNames.has(fn)) return "Kvinna";
  if (maleNames.has(fn)) return "Man";
  return "";
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const HDR_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
const DATA_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F6F2" } };
const GRN_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9EAD3" } };
const BLU_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCFE2F3" } };
const YEL_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD966" } };
const RED_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEA9999" } };
const DGN_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6AA84F" } };

const TITLE_FONT: Partial<ExcelJS.Font> = { bold: true, size: 16 };
const SUBTITLE_FONT: Partial<ExcelJS.Font> = { size: 10 };
const VERSION_FONT: Partial<ExcelJS.Font> = { size: 10, color: { argb: "FFFF0000" } };
const HDR_FONT: Partial<ExcelJS.Font> = { bold: true };
const SECTION_FONT: Partial<ExcelJS.Font> = { bold: true, size: 11 };
const TEAM_HDR_FONT: Partial<ExcelJS.Font> = { bold: true, size: 12 };
const SMALL_FONT: Partial<ExcelJS.Font> = { size: 9 };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function splitName(fullName: string): { fornamn: string; efternamn: string } {
  // Known multi-word last names
  const multiWord: Record<string, [string, string]> = {
    "Jenny Andersson Collby": ["Jenny", "Andersson Collby"],
    "Daniel Andersson Collby": ["Daniel", "Andersson Collby"],
    "Charlotte Gelin Bornudd": ["Charlotte", "Gelin Bornudd"],
    "Sabine Gebert Persson": ["Sabine", "Gebert Persson"],
    "Eva Hartman-Juhlin": ["Eva", "Hartman-Juhlin"],
    "Kajsa Lindner Bennbom": ["Kajsa", "Lindner Bennbom"],
    "Åsa Wallander Wetterqvist": ["Åsa", "Wallander Wetterqvist"],
    "Maria Öfverberg Eriksson": ["Maria", "Öfverberg Eriksson"],
    "Johanna Viring Till": ["Johanna", "Viring Till"],
    "Marie-Louise Mattsson": ["Marie-Louise", "Mattsson"],
    "Ann-Carine Alm": ["Ann-Carine", "Alm"],
  };
  const mw = multiWord[fullName];
  if (mw) {
    return { fornamn: mw[0], efternamn: mw[1] };
  }
  const parts = fullName.split(" ");
  return { fornamn: parts[0] ?? "", efternamn: parts.slice(1).join(" ") };
}

const MONTHS_SV = [
  "", "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

function hostAddress(hostPair: string, lookup: Map<string, Participant>): string {
  const names = hostPair.split(";").map((n) => n.trim());
  for (const n of names) {
    const p = lookup.get(n);
    if (p?.address) return p.address;
  }
  return "";
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export async function generatePlaneringsdokument(): Promise<Buffer> {
  // Fetch data
  const [dbParticipants, dbTeams, dbAssignments] = await Promise.all([
    prisma.participant.findMany({ include: { team: true } }),
    prisma.team.findMany(),
    prisma.hostAssignment.findMany(),
  ]);

  // Build PIN lookup: hostNames → pin, and per-person PIN map
  const pinByHostPair = new Map<string, string>();
  const mealByHostPair = new Map<string, string>();
  const pinByPerson = new Map<string, string>();
  for (const a of dbAssignments) {
    pinByHostPair.set(a.hostNames, a.pin);
    mealByHostPair.set(a.hostNames, a.meal ?? "");
    const names = a.hostNames.split(/[;&]/).map((n: string) => n.trim());
    for (const n of names) {
      pinByPerson.set(n, a.pin);
    }
  }

  const teamMap = new Map<string, string>(dbTeams.map((t) => [t.id, t.name]));

  const participants: Participant[] = dbParticipants.map((p) => {
    const { fornamn, efternamn } = splitName(p.name);
    return {
      name: p.name,
      team: teamMap.get(p.teamId ?? "") ?? "",
      phone: p.phone ?? "",
      address: p.address ?? "",
      email: "",
      dietary: p.dietary ?? "",
      confirmed: p.confirmed,
      forratHost: p.forratHost ?? "",
      varmrattHost: p.varmrattHost ?? "",
      efterrattHost: p.efterrattHost ?? "",
      mission: p.mission ?? "",
      familyId: "",
      efternamn,
      fornamn,
      gender: inferGender(p.name),
    };
  });

  // Sort by efternamn
  participants.sort((a, b) => a.efternamn.localeCompare(b.efternamn, "sv"));

  const byName = new Map(participants.map((p) => [p.name, p]));

  // Assign familyIds by address
  const familyByAddr = new Map<string, string>();
  let familyCounter = 1;
  for (const p of participants) {
    if (!p.address) continue;
    if (!familyByAddr.has(p.address)) {
      familyByAddr.set(p.address, `F${String(familyCounter++).padStart(3, "0")}`);
    }
    p.familyId = familyByAddr.get(p.address) ?? "";
  }

  const now = new Date();
  const dateStr = `${now.getDate()} ${MONTHS_SV[now.getMonth() + 1]} ${now.getFullYear()}`;

  const wb = new ExcelJS.Workbook();

  // ═══════════════════════════════════════════════════════════════
  // SHEET 1: Deltagare 2026
  // ═══════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet("Deltagare 2026");

  ws1.getCell("A2").value = "Cykelfesten 2026";
  ws1.getCell("A2").font = TITLE_FONT;
  ws1.getCell("A3").value = "Planeringsdokument för Kaninens cyklefest den 30 maj 2026";
  ws1.getCell("A3").font = SUBTITLE_FONT;
  ws1.getCell("A4").value = `Version ${dateStr}`;
  ws1.getCell("A4").font = VERSION_FONT;

  // Section headers row 6
  ws1.getCell("A6").value = "ALLMÄNT"; ws1.getCell("A6").font = SECTION_FONT;
  ws1.getCell("L6").value = "HISTORIK"; ws1.getCell("L6").font = SECTION_FONT;
  ws1.getCell("T6").value = "PLAN 2026"; ws1.getCell("T6").font = SECTION_FONT;
  ws1.getCell("AD6").value = "De som inte har någon måltid eller annan restriktion";
  ws1.getCell("AD6").font = SMALL_FONT;

  // Column headers row 7
  const h7: Array<[string, string, ExcelJS.Fill]> = [
    ["A7", "Nr", HDR_FILL], ["B7", "Familje-ID", HDR_FILL], ["C7", "Efternamn", HDR_FILL],
    ["D7", "Förnamn", HDR_FILL], ["E7", "Telefon", HDR_FILL], ["F7", "Adress", HDR_FILL],
    ["G7", "E-post", HDR_FILL], ["H7", "Allergier / notering", HDR_FILL],
    ["I7", "Intressanmälan", HDR_FILL], ["J7", "Bekräftat anmälan", HDR_FILL],
    ["L7", "Med sedan (år)", HDR_FILL], ["M7", "Ny/Erfaren", HDR_FILL],
    ["N7", "År med uppdrag", HDR_FILL], ["O7", "Uppdrag 2025", HDR_FILL],
    ["P7", "Arrangör 2025", HDR_FILL], ["Q7", "Arrangör 2026", HDR_FILL],
    ["R7", "Övrigt", HDR_FILL],
    ["T7", "AI föreslår Lag...", GRN_FILL],
    ["U7", "Förrätt hos...", BLU_FILL], ["V7", "Adress Förrätt", BLU_FILL],
    ["W7", "Värdskap Förrätt", BLU_FILL],
    ["X7", "Varmrätt hos...", YEL_FILL], ["Y7", "Adress Varmrätt", YEL_FILL],
    ["Z7", "Värdskap Varmrätt", YEL_FILL],
    ["AA7", "Efterrätt hos...", RED_FILL], ["AB7", "Adress Efterrätt", RED_FILL],
    ["AC7", "Värdskap Efterrätt", RED_FILL],
    ["AD7", "Uppdrag", DGN_FILL], ["AE7", "Typ av uppdrag", DGN_FILL],
    ["AF7", "PIN värdskap", DGN_FILL],
  ];
  for (const [cell, text, fill] of h7) {
    ws1.getCell(cell).value = text;
    ws1.getCell(cell).font = HDR_FONT;
    ws1.getCell(cell).fill = fill;
  }
  ws1.getCell("A8").value = "#";

  // Data rows
  for (let i = 0; i < participants.length; i++) {
    const pi = participants[i]!;
    const row = ws1.getRow(9 + i);

    // ALLMÄNT (cols A-J) with data fill
    for (let c = 1; c <= 10; c++) row.getCell(c).fill = DATA_FILL;

    row.getCell(1).value = i + 1;
    row.getCell(2).value = pi.familyId;
    row.getCell(3).value = pi.efternamn;
    row.getCell(4).value = pi.fornamn;
    row.getCell(5).value = pi.phone || null;
    row.getCell(6).value = pi.address || null;
    row.getCell(7).value = pi.email || null;
    row.getCell(8).value = pi.dietary || null;
    row.getCell(9).value = "Ja";
    row.getCell(10).value = null; // Bekräftat — can be filled later

    // PLAN 2026
    row.getCell(20).value = pi.team; // Lag

    // Förrätt
    row.getCell(21).value = pi.forratHost;
    row.getCell(22).value = hostAddress(pi.forratHost, byName);
    const fhNames = pi.forratHost.split(";").map((n) => n.trim());
    row.getCell(23).value = fhNames.includes(pi.name) ? "VÄRD" : null;

    // Varmrätt
    row.getCell(24).value = pi.varmrattHost;
    row.getCell(25).value = hostAddress(pi.varmrattHost, byName);
    const vhNames = pi.varmrattHost.split(";").map((n) => n.trim());
    row.getCell(26).value = vhNames.includes(pi.name) ? "VÄRD" : null;

    // Efterrätt
    row.getCell(27).value = pi.efterrattHost;
    row.getCell(28).value = hostAddress(pi.efterrattHost, byName);
    const ehNames = pi.efterrattHost.split(";").map((n) => n.trim());
    row.getCell(29).value = ehNames.includes(pi.name) ? "VÄRD" : null;

    // Uppdrag
    row.getCell(30).value = pi.mission ? "JA" : null;
    row.getCell(31).value = pi.mission && pi.mission !== "Uppdrag kommer" ? pi.mission : null;

    // PIN — show if this person is a host for any meal
    const personPin = pinByPerson.get(pi.name);
    row.getCell(32).value = personPin ?? null;
  }

  // Column widths
  const widths1: Record<string, number> = {
    A: 7.16, B: 11.33, C: 16.66, D: 19.33, E: 16.5, F: 24.33,
    G: 36.0, H: 22.0, I: 13.5, J: 16.5, K: 5.16,
    L: 15.16, M: 14.83, N: 15.16, O: 17.33, P: 15.66, R: 17.5, S: 5.16,
    T: 21.33, U: 40.0, V: 27.66, W: 15.66,
    X: 39.83, Y: 27.66, Z: 18.16,
    AA: 32.66, AB: 27.66, AC: 18.0, AD: 16.16, AE: 36.66, AF: 14.0,
  };
  for (const [col, w] of Object.entries(widths1)) {
    ws1.getColumn(col).width = w;
  }

  // ═══════════════════════════════════════════════════════════════
  // SHEET 2: Lagindelning
  // ═══════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet("Lagindelning");
  ws2.getCell("A2").value = "Cykelfesten 2026"; ws2.getCell("A2").font = TITLE_FONT;
  ws2.getCell("A3").value = "Planeringsdokument för Kaninens cyklefest den 30 maj 2026";
  ws2.getCell("A3").font = SUBTITLE_FONT;
  ws2.getCell("A4").value = "Lagindelning — Kaninens Cykelfest 30 maj 2026";
  ws2.getCell("A4").font = SUBTITLE_FONT;

  const byTeam = new Map<string, Participant[]>();
  for (const p of participants) {
    if (!byTeam.has(p.team)) byTeam.set(p.team, []);
    byTeam.get(p.team)!.push(p);
  }

  let r2 = 7;
  for (const tn of [...byTeam.keys()].sort()) {
    const members = byTeam.get(tn)!;
    const teamRow = ws2.getRow(r2);
    teamRow.getCell(1).value = tn;
    teamRow.getCell(1).font = TEAM_HDR_FONT;
    teamRow.getCell(1).fill = HDR_FILL;
    r2++;

    const hdrRow = ws2.getRow(r2);
    hdrRow.getCell(2).value = "Efternamn"; hdrRow.getCell(2).font = HDR_FONT;
    hdrRow.getCell(3).value = "Förnamn"; hdrRow.getCell(3).font = HDR_FONT;
    hdrRow.getCell(4).value = "Kön"; hdrRow.getCell(4).font = HDR_FONT;
    r2++;

    let k = 0, m = 0;
    const sorted = [...members].sort((a, b) => a.efternamn.localeCompare(b.efternamn, "sv"));
    for (const mb of sorted) {
      const row = ws2.getRow(r2);
      row.getCell(2).value = mb.efternamn;
      row.getCell(3).value = mb.fornamn;
      row.getCell(4).value = mb.gender;
      if (mb.gender === "Kvinna") k++;
      else if (mb.gender === "Man") m++;
      r2++;
    }
    ws2.getRow(r2).getCell(2).value = `Totalt: ${members.length} (${k}K/${m}M)`;
    r2 += 2;
  }

  ws2.getColumn("A").width = 7.16;
  ws2.getColumn("B").width = 16.66;
  ws2.getColumn("C").width = 19.33;
  ws2.getColumn("D").width = 10.0;
  ws2.getColumn("E").width = 12.0;
  ws2.getColumn("F").width = 8.83;

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Meal sheet
  // ═══════════════════════════════════════════════════════════════
  function buildMealSheet(title: string, field: "forratHost" | "varmrattHost" | "efterrattHost") {
    const ws = wb.addWorksheet(title);
    ws.getCell("A2").value = "Cykelfesten 2026"; ws.getCell("A2").font = TITLE_FONT;
    ws.getCell("A3").value = "Planeringsdokument för Kaninens cyklefest den 30 maj 2026";
    ws.getCell("A3").font = SUBTITLE_FONT;
    ws.getCell("A4").value = `${title} — Kaninens Cykelfest 30 maj 2026`;
    ws.getCell("A4").font = SUBTITLE_FONT;

    // Group by host pair
    const byHost = new Map<string, Participant[]>();
    for (const p of participants) {
      const hp = p[field];
      if (!hp) continue;
      if (!byHost.has(hp)) byHost.set(hp, []);
      byHost.get(hp)!.push(p);
    }

    let row = 7;
    for (const hp of [...byHost.keys()].sort()) {
      const guests = byHost.get(hp)!;
      const hnames = hp.split(";").map((n) => n.trim());
      const addr = hostAddress(hp, byName);
      const k = guests.filter((g) => g.gender === "Kvinna").length;
      const m = guests.filter((g) => g.gender === "Man").length;

      const hostRow = ws.getRow(row);
      const pin = pinByHostPair.get(hp) ?? "";
      hostRow.getCell(1).value = `Värd: ${hp}    [${k}K / ${m}M  —  Tot: ${guests.length}]  PIN: ${pin}`;
      hostRow.getCell(1).font = { bold: true };
      hostRow.getCell(1).fill = HDR_FILL;
      row++;

      ws.getRow(row).getCell(2).value = "Adress";
      ws.getRow(row).getCell(3).value = addr;
      row++;

      const hdr = ws.getRow(row);
      hdr.getCell(2).value = "Efternamn"; hdr.getCell(2).font = HDR_FONT;
      hdr.getCell(3).value = "Förnamn"; hdr.getCell(3).font = HDR_FONT;
      hdr.getCell(4).value = "Kön"; hdr.getCell(4).font = HDR_FONT;
      hdr.getCell(5).value = "Lag"; hdr.getCell(5).font = HDR_FONT;
      hdr.getCell(6).value = "Roll"; hdr.getCell(6).font = HDR_FONT;
      row++;

      // Hosts first, then others sorted by efternamn
      const sorted = [...guests].sort((a, b) => {
        const aHost = hnames.includes(a.name) ? 0 : 1;
        const bHost = hnames.includes(b.name) ? 0 : 1;
        if (aHost !== bHost) return aHost - bHost;
        return a.efternamn.localeCompare(b.efternamn, "sv");
      });

      for (const g of sorted) {
        const r = ws.getRow(row);
        r.getCell(2).value = g.efternamn;
        r.getCell(3).value = g.fornamn;
        r.getCell(4).value = g.gender;
        r.getCell(5).value = g.team;
        if (hnames.includes(g.name)) r.getCell(6).value = "VÄRD";
        row++;
      }
      row++; // blank row between groups
    }

    ws.getColumn("A").width = 7.16;
    ws.getColumn("B").width = 16.66;
    ws.getColumn("C").width = 19.33;
    ws.getColumn("D").width = 10.0;
    ws.getColumn("E").width = 22.0;
    ws.getColumn("F").width = 8.0;
    ws.getColumn("G").width = 5.0;
    ws.getColumn("I").width = 8.83;
  }

  buildMealSheet("Förrätt", "forratHost");
  buildMealSheet("Varmrätt", "varmrattHost");
  buildMealSheet("Efterrätt", "efterrattHost");

  // ═══════════════════════════════════════════════════════════════
  // SHEET 6: Uppdrag
  // ═══════════════════════════════════════════════════════════════
  const ws6 = wb.addWorksheet("Uppdrag");
  ws6.getCell("A2").value = "Cykelfesten 2026"; ws6.getCell("A2").font = TITLE_FONT;
  ws6.getCell("A3").value = "Planeringsdokument för Kaninens cyklefest den 30 maj 2026";
  ws6.getCell("A3").font = SUBTITLE_FONT;
  ws6.getCell("A4").value = "Uppdrag — Kaninens Cykelfest 30 maj 2026";
  ws6.getCell("A4").font = SUBTITLE_FONT;

  const hdr6 = ws6.getRow(6);
  hdr6.getCell(2).value = "Efternamn"; hdr6.getCell(2).font = HDR_FONT;
  hdr6.getCell(3).value = "Förnamn"; hdr6.getCell(3).font = HDR_FONT;
  hdr6.getCell(4).value = "Lag"; hdr6.getCell(4).font = HDR_FONT;
  hdr6.getCell(5).value = "Uppdrag"; hdr6.getCell(5).font = HDR_FONT;
  hdr6.getCell(6).value = "PIN"; hdr6.getCell(6).font = HDR_FONT;

  // Group mission people by team
  const missionByTeam = new Map<string, Participant[]>();
  for (const p of participants) {
    if (!p.mission) continue;
    if (!missionByTeam.has(p.team)) missionByTeam.set(p.team, []);
    missionByTeam.get(p.team)!.push(p);
  }

  let r6 = 7;
  for (const tn of [...missionByTeam.keys()].sort()) {
    ws6.getRow(r6).getCell(2).value = tn;
    ws6.getRow(r6).getCell(2).font = HDR_FONT;
    r6++;
    const members = missionByTeam.get(tn)!;
    for (const p of members.sort((a, b) => a.efternamn.localeCompare(b.efternamn, "sv"))) {
      const row = ws6.getRow(r6);
      row.getCell(2).value = p.efternamn;
      row.getCell(3).value = p.fornamn;
      row.getCell(4).value = p.team;
      row.getCell(5).value = p.mission !== "Uppdrag kommer" ? p.mission : null;
      row.getCell(6).value = pinByPerson.get(p.name) ?? null;
      r6++;
    }
  }

  ws6.getColumn("A").width = 7.16;
  ws6.getColumn("B").width = 20.0;
  ws6.getColumn("C").width = 16.0;
  ws6.getColumn("D").width = 20.0;
  ws6.getColumn("E").width = 40.0;
  ws6.getColumn("F").width = 10.0;

  // ─── WRITE ─────────────────────────────────────────────────────
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
