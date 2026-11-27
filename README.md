# Sistem Informasi Kepegawaian - Gedung Keuangan (Cloud App)

Aplikasi berbasis web **Gedung Keuangan** untuk pengelolaan data kepegawaian Aparatur Sipil Negara (ASN) lintas unit kerja dengan fitur cetak laporan PDF langsung dari aplikasi, memuat **55 data pegawai** (melebihi syarat minimal 50 pegawai), serta siap dideploy otomatis ke **Cloud** menggunakan **GitHub**.

## Fitur Utama
1. **Autentikasi Admin**: Halaman login terintegrasi.
2. **Dashboard Analitik**: Visualisasi jumlah pegawai, rasio PNS/PPPK, total belanja pegawai, grafik unit kerja, dan golongan.
3. **Master Data 55 Pegawai (CRUD)**: Tambah, edit, hapus, pencarian NIP/Nama, serta filter unit kerja dan status.
4. **Cetak Laporan PDF Langsung**: Kop surat resmi Sekretariat Bersama Gedung Keuangan dengan fitur *Download PDF Langsung* (`html2pdf.js`) dan *Print*.
5. **Cloud CI/CD**: Dilengkapi `.github/workflows/deploy.yml` untuk deployment otomatis ke GitHub Pages / Vercel / Netlify.

## Cara Menjalankan & Deploy ke Cloud via GitHub
1. Buat repository baru di GitHub bernama `gedung-keuangan`.
2. Upload seluruh file dalam folder ini (`index.html`, `data.js`, `app.js`, `.github/workflows/deploy.yml`).
3. Buka tab **Settings > Pages** di repository GitHub Anda, lalu pilih **Source: GitHub Actions**.
4. Aplikasi **Gedung Keuangan** akan langsung online dan dapat diakses melalui URL cloud GitHub Pages Anda.
