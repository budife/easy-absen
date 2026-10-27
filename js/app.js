// Lemboor — Shared App Logic
// Data stored in localStorage

const STORAGE_KEYS = {
  overtime: 'ea_overtime',
  settings: 'ea_settings'
};

// Default settings
const DEFAULT_SETTINGS = {
  managerName: '',
  baseSalary: 0,
  workHours: 8
};

// --- Storage helpers ---
function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getOvertime() { return loadData(STORAGE_KEYS.overtime); }
function saveOvertime(data) { saveData(STORAGE_KEYS.overtime, data); }

function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}
function saveSettings(data) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data));
}

// --- ID generator ---
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// --- Date helpers ---
function formatDateYYYYMMDD(dateStr) {
  // Convert various formats to YYYYMMDD
  if (!dateStr) return '';
  // Already YYYYMMDD
  if (/^\d{8}$/.test(dateStr)) return dateStr;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr.replace(/-/g, '');
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return y + m + d;
  }
  return dateStr;
}

function formatDateDisplay(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return yyyymmdd.slice(0,4) + '-' + yyyymmdd.slice(4,6) + '-' + yyyymmdd.slice(6,8);
}

// --- Time helpers ---
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

function calcTotalHours(start, end) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  if (endMin <= startMin) return 0;
  return (endMin - startMin) / 60;
}

// --- Pay calculation (Indonesian overtime formula) ---
function calcOvertimePay(totalHours, category, baseSalary) {
  if (!baseSalary || totalHours <= 0) return 0;
  const hourlyRate = baseSalary / 173;
  let pay = 0;

  if (category === 'weekday') {
    if (totalHours >= 1) pay += 1.5 * hourlyRate;
    if (totalHours > 1) pay += (totalHours - 1) * 2 * hourlyRate;
  } else {
    // weekend or holiday
    const hours = Math.min(totalHours, 7);
    pay += hours * 2 * hourlyRate;
    if (totalHours > 7) pay += 1 * 3 * hourlyRate; // 8th hour
    if (totalHours > 8) pay += (totalHours - 8) * 4 * hourlyRate;
  }
  return Math.round(pay);
}

// --- Toast ---
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// --- Navigation ---
function initNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// --- Modal helpers ---
function showModal(html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = '<div class="modal">' + html + '</div>';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  return overlay;
}

function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
}

// --- Export to XLSX ---
function exportToXlsx(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data, { header: [
    'Nama', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Total Jam', 'Aktivitas', 'Project', 'Kategori', 'Gaji Pokok', 'Uang Lemboor'
  ]});
  // Set column widths
  ws['!cols'] = [
    {wch: 20}, {wch: 12}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 40}, {wch: 20}, {wch: 12}, {wch: 12}, {wch: 12}
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lemboor');
  XLSX.writeFile(wb, filename || 'lembur-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.xlsx');
}

// --- Import from XLSX ---
function importFromXlsx(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Skip header row
      const data = rows.slice(1).filter(r => r.length > 0 && r[0]);
      const parsed = data.map(row => ({
        date: formatDateYYYYMMDD(String(row[0] || '')),
        startTime: String(row[1] || '').trim(),
        endTime: String(row[2] || '').trim(),
        totalHours: parseFloat(row[3]) || calcTotalHours(String(row[1]||''), String(row[2]||'')),
        activity: String(row[4] || '').trim(),
        project: String(row[5] || '').trim(),
        category: String(row[6] || 'weekday').trim().toLowerCase(),
        baseSalary: parseFloat(row[7]) || 0,
        pay: parseFloat(row[8]) || 0
      }));
      callback(null, parsed);
    } catch (err) {
      callback(err, null);
    }
  };
  reader.readAsArrayBuffer(file);
}

// --- Export data for xlsx (simple, no employees) ---
function prepareExportDataSimple(overtimeList) {
  return overtimeList.map(o => ({
    'Tanggal': o.date,
    'Jam Mulai': o.startTime,
    'Jam Selesai': o.endTime,
    'Total Jam': o.totalHours,
    'Aktivitas': o.activity,
    'Project': o.project,
    'Kategori': o.category,
    'Gaji Pokok': o.baseSalary || 0,
    'Uang Lemboor': o.pay || 0
  }));
}

// Init nav on load
// Navigation handled by SPA router
// document.addEventListener('DOMContentLoaded', initNav);