# Lemboor

Aplikasi web untuk tracking lembur pribadi. Catat lembur, lihat rekap, kalender, dan backup/restore data.

Live: https://budife.github.io/lemboor/

## Fitur

- **Ringkasan** — total jam bulan ini, jumlah lembur, rata-rata, total uang, chart per bulan & kategori
- **Catat Lembur** — form input dengan auto-hitung total jam & estimasi uang lembur, validasi duplikat & overlap
- **Kalender** — tampilan bulan & minggu, navigasi, hari ini ditandai
- **Riwayat** — tabel filterable, hapus dengan undo, pagination
- **Import/Export** — backup/restore JSON, import/export XLSX
- **Settings** — nama manager, gaji pokok, jam kerja, rumus uang lembur

## Tech Stack

- Vanilla HTML/CSS/JS (no build step)
- SheetJS (xlsx) — bundled offline di `libs/`
- Data disimpan di **localStorage** browser (per-device)
- Static site — deploy ke GitHub Pages
- PWA (manifest + service worker)

## Cara Pakai

1. Buka https://budife.github.io/lemboor/
2. Set gaji pokok di **Settings**
3. Input lembur di **Catat Lembur**
4. Lihat rekap di **Ringkasan**, **Kalender**, **Riwayat**
5. Backup data via **Import/Export** → Export JSON/XLSX

## Rumus Uang Lembur (Indonesia)

- Gaji per jam = Gaji Pokok ÷ 173
- **Weekday:** Jam 1 = 1.5×, Jam 2+ = 2×
- **Weekend/Holiday:** Jam 1-7 = 2×, Jam 8 = 3×, Jam 9+ = 4×

## Deploy

Static site — push ke GitHub, aktifkan Pages (main branch / root).

## License

MIT