# Easy Absen — Design Spec

**Date:** 2026-10-26
**Topic:** Overtime (lemburan) tracking web app with xlsx import/export
**Status:** Draft for approval

---

## 1. Intent & Why

Membuat aplikasi web sederhana untuk tracking lemburan karyawan. Line manager yang input dan approve data lembur. Output utama: arsip + export ke xlsx untuk keperluan tracking/payroll.

Pain point yang diselesaikan:
- Input manual jam mulai/selesai + aktivitas + total jam yang ribet
- Hitung-hitungan manual total lembur
- Tidak ada tempat terpusat untuk arsip lembur

## 2. Goals

- Input lembur per karyawan (tanggal, jam mulai, jam selesai, aktivitas, project, kategori)
- Auto hitung total jam lembur
- List/filter/sort riwayat lembur
- Import data lembur dari file xlsx (template)
- Export riwayat lembur ke file xlsx
- Dashboard ringkasan (total jam per bulan, per karyawan, per project)
- Responsive (mobile-friendly, line manager bisa input dari HP)

## 3. Non-Goals

- Payroll calculation (gaji lembur) — out of scope
- Approval workflow multi-level (hanya line manager approve, tanpa chain)
- Integrasi dengan sistem HR existing
- Auth multi-role complex (single user/line manager per instance)
- Offline-first (butuh server untuk persist data)
- Multi-user / multi-tenant

## 4. Target Users

- **Line Manager** (primary): input lembur, lihat rekap
- **HR/Payroll** (secondary, read-only): download xlsx arsip

> Single instance, public (GitHub Pages). Semua orang bisa akses. Data disimpan di localStorage browser masing-masing. Import/export xlsx untuk backup/transfer.

## 5. Tech Stack & Constraints

- **Frontend:** Vanilla HTML/CSS/JS (no build step, no framework)
- **Backend:** NONE — static site (GitHub Pages)
- **Storage:** Browser localStorage (data per-browser, persist across sessions)
- **XLSX:** SheetJS (xlsx) library — client-side only (bundled in `libs/`)
- **Deploy:** GitHub Pages (static)
- **No npm install** — vendor libs di `libs/`

> Pilihan: Pure static site. Data disimpan di localStorage browser. Import/export xlsx untuk backup/transfer antar device.

## 6. Data Model

### Employee
| Field | Type | Notes |
|-------|------|-------|
| id | INTEGER PK | auto |
| name | TEXT | nama karyawan |
| department | TEXT | divisi |
| created_at | DATETIME | |

### Overtime (Lembur)
| Field | Type | Notes |
|-------|------|-------|
| id | INTEGER PK | auto |
| employee_id | INTEGER FK | |
| date | DATE | tanggal lembur |
| start_time | TIME | jam mulai |
| end_time | TIME | jam selesai |
| total_hours | REAL | auto-calculated |
| activity | TEXT | deskripsi aktivitas |
| project | TEXT | project/pekerjaan |
| category | TEXT | kategori lembur (weekday/weekend/holiday) |
| approved | BOOLEAN | default false |
| approved_by | TEXT | nama line manager |
| approved_at | DATETIME | |
| created_at | DATETIME | |

### Settings
| Field | Type | Notes |
|-------|------|-------|
| key | TEXT PK | |
| value | TEXT | |

## 7. XLSX Template (Import/Export)

### Kolom (header row):
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Nama | Tanggal | Jam Mulai | Jam Selesai | Total Jam | Aktivitas | Project | Kategori | Gaji Pokok | Uang Lembur |

- Format tanggal: `YYYYMMDD` (contoh: 20261026)
- **Import:** parse xlsx, validasi kolom, insert ke localStorage (skip duplikat berdasarkan nama+tanggal+jam mulai)
- **Export:** query localStorage → generate xlsx dengan header styling + auto-width

### Kategori lembur:
- `weekday` (hari kerja)
- `weekend` (akhir pekan)
- `holiday` (libur nasional)

### Rumus Uang Lembur (Indonesia — UU Ketenagakerjaan):
- Gaji per jam = Gaji Pokok / 173 (standar)
- **Weekday:**
  - Jam 1: 1.5 × gaji per jam
  - Jam 2+: 2 × gaji per jam
- **Weekend/Holiday:**
  - Jam 1-7: 2 × gaji per jam
  - Jam 8: 3 × gaji per jam
  - Jam 9+: 4 × gaji per jam

> User input gaji pokok per bulan di settings. Auto-calculate uang lembur saat input.

## 8. Features & Screens

### 8.1 Dashboard (Home)
- Card: total lembur bulan ini (jam)
- Card: jumlah karyawan lembur bulan ini
- Card: rata-rata jam per lembur
- Chart: bar chart lembur per bulan (6 bulan terakhir)
- Chart: pie chart distribusi kategori
- Tabel: top 5 karyawan lembur terbanyak bulan ini

### 8.2 Input Lembur
- Form: pilih karyawan (dropdown), tanggal (date picker), jam mulai (time), jam selesai (time), aktivitas (textarea), project (text), kategori (select)
- Auto-calculate total jam saat jam selesai diisi
- Validasi: jam selesai > jam mulai, tanggal tidak future
- Submit → insert ke DB, reset form

### 8.3 Riwayat Lembur
- Tabel: Nama, Tanggal, Jam, Total, Aktivitas, Project, Kategori, Status
- Filter: tanggal range, karyawan, project, kategori, status
- Sort: by tanggal, nama, total jam
- Pagination: 20 per halaman
- Action per row: edit, delete, approve/reject
- Bulk: select multiple → export selected / delete selected

### 8.4 Import XLSX
- Upload file xlsx
- Preview: tampilkan 5 baris pertama + jumlah total baris
- Validasi: kolom required, format tanggal/jam
- Konfirmasi → insert (skip duplikat)
- Result: jumlah inserted, skipped, error

### 8.5 Export XLSX
- Button export semua / export filtered
- Generate xlsx dengan header styling, auto-width, freeze header
- Download file: `lembur-YYYY-MM-DD.xlsx`

### 8.6 Kelola Karyawan — REMOVED (single user, no employee concept)

### 8.7 Settings
- Nama line manager (untuk approval)
- Jam kerja normal (default 8 jam) — untuk highlight lembur > 8 jam

## 9. UI/UX

- **Design:** Minimalist, clean, dark sidebar + light content area
- **Responsive:** Mobile-first (input form stack vertical di mobile)
- **Color:** Primary `#2563eb` (blue), accent `#10b981` (green for approved)
- **Font:** Inter / system font stack
- **No gradients/shadows berlebihan** (sesuai preferensi user: balanced refinement)

### Layout
```
┌─────────────────────────────────────────┐
│  Easy Absen          [User] [Export]    │
├──────────┬──────────────────────────────┤
│          │                              │
│ Dashboard│  [Content Area]              │
│ Input    │                              │
│ Riwayat  │                              │
│ Import   │                              │
│ Karyawan │                              │
│ Settings │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

## 10. API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/employees | List employees |
| POST | /api/employees | Create employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |
| GET | /api/overtime | List overtime (with filters) |
| POST | /api/overtime | Create overtime |
| PUT | /api/overtime/:id | Update overtime |
| DELETE | /api/overtime/:id | Delete overtime |
| POST | /api/overtime/:id/approve | Approve overtime |
| GET | /api/overtime/export | Export to xlsx |
| POST | /api/overtime/import | Import from xlsx |
| GET | /api/dashboard | Dashboard stats |

## 11. Constraints & Decisions

1. **Single instance** — satu line manager = satu instance. Multi-tenant out of scope.
2. **SQLite** — file-based, mudah backup, tidak perlu PostgreSQL.
3. **No auth complex** — simple password protection (env-based), seperti terminal-auth.
4. **XLSX client-side + server-side** — SheetJS di browser untuk preview, server untuk generate final.
5. **Data persist di `/srv/storage/easy-absen/`** (consistent dengan convention VPS).

## 12. Open Questions

1. Apakah perlu multi-user (beberapa line manager) atau single instance cukup?
2. Apakah perlu notifikasi (email/telegram) saat ada lembur baru?
3. Format tanggal di xlsx: `DD/MM/YYYY` atau `YYYY-MM-DD`?
4. Apakah perlu tracking "uang lembur" (rate per jam) atau hanya jam?

## 13. Implementation Plan (Next Steps)

1. Setup project structure + git init
2. Backend: Express + SQLite + SheetJS
3. Frontend: HTML/CSS/JS (dashboard, input, riwayat, import, export)
4. Docker: Dockerfile + docker-compose
5. Deploy: VPS + NPM proxy + SSL
6. Test: import/export round-trip, mobile responsive

---

**Approval needed before proceeding to implementation.**
