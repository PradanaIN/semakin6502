import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import months from "../../../utils/months";
import exportFileName from "../../../utils/exportFileName";

const EXCLUDED_NAMES = ["Admin Utama", "Yuda Agus Irianto"]; // konsisten dengan TabContent

function monthAbbr(i) {
  const m = months[i] || "";
  return m.slice(0, 3);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function headerWithLogo(doc, { title, subtitle }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  try {
    const logo = await loadImage("/logo.png");
    doc.addImage(logo, "PNG", 40, 30, 40, 40);
  } catch {
    // ignore logo errors
  }
  // Right header text (BPS)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BADAN PUSAT STATISTIK", 95, 45);
  doc.text("KABUPATEN BULUNGAN", 95, 63);

  // Center title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 95, { align: "center" });
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, pageWidth / 2, 112, { align: "center" });
  }
}

function currentDateStr() {
  // Format WITA
  const d = new Date();
  const date = d.toLocaleDateString("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Makassar",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} pukul ${time} WITA`;
}

async function resolveTeamName(teamId) {
  if (!teamId) return "Semua Tim";
  try {
    const res = await axios.get("/teams/all");
    const teams = Array.isArray(res.data) ? res.data : [];
    const t = teams.find((x) => x.id === teamId);
    return t?.namaTim || "Semua Tim";
  } catch {
    return "Semua Tim";
  }
}

export async function exportMonthlyCurrentPDF({ year, month, teamId }) {
  // Ambil data capaian bulan ini (per-user)
  const [res, teamsRes] = await Promise.all([
    axios.get("/monitoring/bulanan/all", { params: { year, bulan: String(month), teamId: teamId || undefined } }),
    axios.get("/teams/all").catch(() => ({ data: [] })),
  ]);
  const taskArr = Array.isArray(res.data) ? res.data : [];
  const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
  const members = [];
  teams.forEach((t) => {
    if (teamId && t.id !== teamId) return;
    const mem = Array.isArray(t.members) ? t.members : [];
    mem.forEach((m) => m?.user && members.push(m.user));
  });
  // Normalizer nama
  const norm = (s) => (typeof s === "string" ? s.toLowerCase().replace(/\s+/g, " ").trim() : "");
  // Peta userId/nama -> tim (dukung multi tim: gabungkan dengan " / ")
  const userTeamById = new Map();
  const userTeamByName = new Map();
  const addTeam = (map, key, teamLabel) => {
    if (!key) return;
    const prev = map.get(key);
    if (!prev) map.set(key, teamLabel || "-");
    else if (!String(prev).includes(teamLabel)) map.set(key, `${prev} / ${teamLabel}`);
  };
  teams.forEach((t) => {
    const label = t?.namaTim || "-";
    const mem = Array.isArray(t.members) ? t.members : [];
    mem.forEach((m) => {
      const idKey = m?.userId ? String(m.userId) : m?.user?.id ? String(m.user.id) : undefined;
      const nameKey = norm(m?.user?.nama);
      addTeam(userTeamById, idKey, label);
      addTeam(userTeamByName, nameKey, label);
    });
  });
  const seen = new Set();
  const baseline = members.reduce((arr, u) => {
    const id = u?.id;
    if (!id || seen.has(id) || EXCLUDED_NAMES.includes(u.nama)) return arr;
    seen.add(id);
    arr.push({
      userId: String(id),
      nama: u.nama,
      tim: userTeamById.get(String(id)) || userTeamByName.get(norm(u.nama)) || "-",
    });
    return arr;
  }, []);
  const byId = new Map(taskArr.map((x) => [String(x.userId), x]));
  const byName = new Map(taskArr.map((x) => [norm(x.nama), x]));

  const merged = baseline.map((u) => {
    const t = byId.get(String(u.userId)) || byName.get(norm(u.nama));
    const selesai = Number(t?.selesai) || 0;
    const total = Number(t?.total) || 0;
    const persen = total ? Math.round((selesai / total) * 100) : 0;
    return { userId: u.userId, nama: u.nama, tim: u.tim || "-", selesai, total, persen };
  });
  if (!teamId && taskArr.length) {
    const known = new Set(merged.map((m) => String(m.userId)));
    taskArr.forEach((x) => {
      const id = String(x.userId);
      if (!known.has(id) && !EXCLUDED_NAMES.includes(x.nama)) {
        known.add(id);
        merged.push({
          userId: id,
          nama: x.nama,
          tim: userTeamById.get(id) || userTeamByName.get(norm(x.nama)) || "-",
          selesai: Number(x.selesai) || 0,
          total: Number(x.total) || 0,
          persen: Number.isFinite(x.persen)
            ? Number(x.persen)
            : Number(x.total)
            ? Math.round(((Number(x.selesai) || 0) / Number(x.total)) * 100)
            : 0,
        });
      }
    });
  }
  merged.sort((a, b) => (a?.nama || "").localeCompare(b?.nama || "", "id", { sensitivity: "base" }));

  // Buat PDF (portrait)
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
  const monthName = months[month - 1];
  const teamName = await resolveTeamName(teamId);
  await headerWithLogo(doc, {
    title: `Capaian Kinerja Pegawai Bulan ${monthName} ${year}`,
    subtitle: `${teamName} • Dicetak: ${currentDateStr()}`,
  });

  const body = merged.map((u, i) => [i + 1, u.nama, u.tim, u.total, u.selesai, `${u.persen}%`]);
  autoTable(doc, {
    startY: 130,
    head: [["No", "Nama", "Tim", "Total Tugas", "Tugas Selesai", "Capaian Kinerja"]],
    body,
    styles: { fontSize: 9, cellPadding: { top: 4, bottom: 4, left: 6, right: 6 } },
    headStyles: { fillColor: [239, 246, 255], textColor: [17, 24, 39], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { halign: "center", cellWidth: 28 },
      2: { cellWidth: 140 },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
    },
    didParseCell: (data) => {
      // Warnai kolom capaian
      if (data.section === 'body' && data.column.index === 5) {
        const val = parseInt(String(data.cell.raw).replace(/[^0-9]/g, ''), 10) || 0;
        // lembut: hijau >=80, kuning 50-79, merah <50
        if (val >= 80) data.cell.styles.fillColor = [220, 252, 231];
        else if (val >= 50) data.cell.styles.fillColor = [254, 249, 195];
        else data.cell.styles.fillColor = [254, 226, 226];
      }
    },
  });

  // Footer nomor halaman + sumber
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(100);
    // Footer left note
    doc.text("Sumber: SEMAKIN 6502", 40, h - 16, { align: 'left' });
    doc.text(`Halaman ${i} dari ${pages}`, w / 2, h - 16, { align: 'center' });
  }

  const name = `${exportFileName("Capaian_Bulanan", month)}.pdf`;
  doc.save(name);
}

export async function exportMonthlyYearPDF({ year, teamId }) {
  // Ambil matrix capaian tahunan dan baseline anggota tim
  const [matrixRes, teamsRes] = await Promise.all([
    axios.get("/monitoring/bulanan/matrix", { params: { year, teamId: teamId || undefined } }),
    axios.get("/teams/all").catch(() => ({ data: [] })),
  ]);
  const arr = Array.isArray(matrixRes.data) ? matrixRes.data : [];

  const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
  const members = [];
  teams.forEach((t) => {
    if (teamId && t.id !== teamId) return;
    const mem = Array.isArray(t.members) ? t.members : [];
    mem.forEach((m) => m?.user && members.push(m.user));
  });
  const seen = new Set();
  const baseline = members.reduce((arr, u) => {
    const id = u?.id;
    if (!id || seen.has(id) || EXCLUDED_NAMES.includes(u.nama)) return arr;
    seen.add(id);
    arr.push({ userId: String(id), nama: u.nama });
    return arr;
  }, []);

  const byId = new Map(arr.map((x) => [String(x.userId), x]));
  const byName = new Map(arr.map((x) => [(x?.nama || "").toLowerCase().replace(/\s+/g, " ").trim(), x]));

  const filled = baseline.map((u) => {
    const r = byId.get(String(u.userId)) || byName.get((u.nama || "").toLowerCase().replace(/\s+/g, " ").trim());
    const monthsData = months.map((_, i) => {
      const persen = Number(r?.months?.[i]?.persen || 0);
      return { persen };
    });
    return { nama: u.nama, months: monthsData };
  });

  // Jika tidak filter tim, tambahkan baris dari matrix yang tidak ada di baseline (misal bukan anggota tim formal)
  if (!teamId) {
    arr.forEach((x) => {
      if (EXCLUDED_NAMES.includes(x.nama)) return;
      const exists = filled.find((f) => f.nama === x.nama);
      if (!exists) {
        filled.push({ nama: x.nama, months: months.map((_, i) => ({ persen: Number(x?.months?.[i]?.persen || 0) })) });
      }
    });
  }

  filled.sort((a, b) => (a?.nama || "").localeCompare(b?.nama || "", "id", { sensitivity: "base" }));

  // PDF (landscape)
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
  const teamName = await resolveTeamName(teamId);
  await headerWithLogo(doc, {
    title: `Capaian Kinerja Pegawai Tahun ${year}`,
    subtitle: `${teamName} • Dicetak: ${currentDateStr()}`,
  });

  const head = ["Nama", ...months.map((_, i) => monthAbbr(i))];
  const body = filled.map((u) => [
    u.nama,
    ...months.map((_, i) => `${Number(u?.months?.[i]?.persen || 0)}%`),
  ]);

  autoTable(doc, {
    startY: 130,
    head: [head],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [239, 246, 255], textColor: [17, 24, 39], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 0: { cellWidth: 120 } },
    didParseCell: (data) => {
      // Center all month columns
      if (data.section === 'body' && data.column.index > 0) data.cell.styles.halign = 'center';
      if (data.section === 'head' && data.column.index > 0) data.cell.styles.halign = 'center';
      // Color code month cells ringan
      if (data.section === 'body' && data.column.index > 0) {
        const val = parseInt(String(data.cell.raw).replace(/[^0-9]/g, ''), 10) || 0;
        if (val >= 80) data.cell.styles.fillColor = [220, 252, 231];
        else if (val >= 50) data.cell.styles.fillColor = [254, 249, 195];
        else data.cell.styles.fillColor = [254, 226, 226];
      }
    },
  });

  // Footer nomor halaman + sumber
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Sumber: SEMAKIN 6502", 40, h - 16, { align: 'left' });
    doc.text(`Halaman ${i} dari ${pages}`, w / 2, h - 16, { align: 'center' });
  }

  const name = `${exportFileName("Capaian_Tahunan", new Date().getMonth() + 1)}.pdf`;
  doc.save(name);
}
