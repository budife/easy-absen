# Lemboor

Aplikasi web sederhana untuk tracking lemburan (overtime) karyawan. Input lembur, lihat rekap, import/export ke xlsx.

## Fitur

- **Dashboard** — ringkasan total jam, jumlah lembur, karyawan aktif, chart per bulan & kategori
- **Input Lemboor** — form input dengan auto-hitung total jam & estimasi uang lembur
- **Riwayat** — tabel filterable/sortable, edit, hapus, export filtered
- **Import/Export** — import dari xlsx (template), export semua/filtered, backup/restore JSON
- **Karyawan** — CRUD karyawan
- **Settings** — gaji pokok, nama manager, rumus uang lembur (Indonesia)

## Tech Stack

- Vanilla HTML/CSS/JS (no build step)
- SheetJS (xlsx) — bundled offline di `libs/`
- Data disimpan di **localStorage** browser (per-device)
- Static site — bisa di-deploy ke GitHub Pages

## Cara Pakai

1. Buka `index.html` di browser
2. Tambah karyawan di menu **Karyawan**
3. Set gaji pokok di **Settings**
4. Input lembur di **Input Lemboor**
5. Lihat rekap di **Dashboard** dan **Riwayat**
6. Backup data via **Import/Export** → Export/Backup JSON atau XLSX

## Import/Export XLSX

Format kolom (header row):
| Tanggal | Jam Mulai | Jam Selesai | Total Jam | Aktivitas | Project | Kategori | Gaji Pokok | Uang Lemboor |

- Tanggal format: `YYYYMMDD` (contoh: 20261026)
- Kategori: `weekday`, `weekend`, `holiday`

## Rumus Uang Lemboor (Indonesia)

- Gaji per jam = Gaji Pokok ÷ 173
- **Weekday:** Jam 1 = 1.5×, Jam 2+ = 2×
- **Weekend/Holiday:** Jam 1-7 = 2×, Jam 8 = 3×, Jam 9+ = 4×

## Deploy ke GitHub Pages

1. Push repo ke GitHub
2. Settings → Pages → Source: main branch / root
3. Akses via `https://<username>.github.io/easy-absen/`

## License

MIT