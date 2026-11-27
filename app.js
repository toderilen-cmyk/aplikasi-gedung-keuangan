const STORAGE_KEY = 'gedung_keuangan_pegawai_v1';
let pegawaiList = [];
let unitChartInstance = null;
let golChartInstance = null;

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function initApp() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    pegawaiList = JSON.parse(saved);
  } else {
    pegawaiList = [...DEFAULT_PEGAWAI];
    saveData();
  }
  const nowStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('reportDateText').textContent = 'Tanggal: ' + nowStr;
  document.getElementById('ttdDate').textContent = nowStr;
  refreshAll();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pegawaiList));
}

function resetDefaultData() {
  if (confirm('Kembalikan data ke 55 pegawai default Gedung Keuangan?')) {
    pegawaiList = [...DEFAULT_PEGAWAI];
    saveData();
    refreshAll();
  }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('loginModal').classList.add('hidden');
});

function logout() {
  document.getElementById('loginModal').classList.remove('hidden');
}

function switchTab(tabName) {
  ['dashboard', 'pegawai', 'laporan'].forEach(t => {
    document.getElementById('tab-' + t).classList.add('hidden');
    const btn = document.getElementById('nav-' + t);
    btn.classList.remove('bg-white/15', 'text-white');
    btn.classList.add('text-blue-100');
  });
  document.getElementById('tab-' + tabName).classList.remove('hidden');
  const activeBtn = document.getElementById('nav-' + tabName);
  activeBtn.classList.add('bg-white/15', 'text-white');
  activeBtn.classList.remove('text-blue-100');

  if (tabName === 'laporan') renderReportPreview();
}

function refreshAll() {
  document.getElementById('badgeCount').textContent = pegawaiList.length;
  updateDashboard();
  renderTable();
  renderReportPreview();
}

function updateDashboard() {
  const total = pegawaiList.length;
  const pns = pegawaiList.filter(p => p.status_kepegawaian === 'PNS').length;
  const pppk = pegawaiList.filter(p => p.status_kepegawaian === 'PPPK').length;
  const units = [...new Set(pegawaiList.map(p => p.unit_kerja))];
  const totalBelanja = pegawaiList.reduce((acc, p) => acc + Number(p.gaji_pokok) + Number(p.tunjangan), 0);

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiStatus').textContent = `${pns} PNS / ${pppk} PPPK`;
  document.getElementById('kpiUnit').textContent = units.length;
  document.getElementById('kpiGaji').textContent = formatRupiah(totalBelanja);

  // Chart Unit Kerja
  const unitCounts = {};
  pegawaiList.forEach(p => { unitCounts[p.unit_kerja] = (unitCounts[p.unit_kerja] || 0) + 1; });
  if (unitChartInstance) unitChartInstance.destroy();
  unitChartInstance = new Chart(document.getElementById('unitChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(unitCounts).map(u => u.replace('Kupang', '').replace('Provinsi NTT', 'NTT')),
      datasets: [{
        label: 'Jumlah Pegawai',
        data: Object.values(unitCounts),
        backgroundColor: '#1e3a8a',
        borderRadius: 6
      }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  // Chart Golongan
  const golCounts = {};
  pegawaiList.forEach(p => { golCounts[p.golongan] = (golCounts[p.golongan] || 0) + 1; });
  if (golChartInstance) golChartInstance.destroy();
  golChartInstance = new Chart(document.getElementById('golChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(golCounts),
      datasets: [{
        data: Object.values(golCounts),
        backgroundColor: ['#1e3a8a', '#2563eb', '#0284c7', '#d97706', '#f59e0b', '#059669', '#4f46e5', '#64748b']
      }]
    }
  });
}

function renderTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const unitF = document.getElementById('filterUnit').value;
  const statusF = document.getElementById('filterStatus').value;

  const filtered = pegawaiList.filter(p => {
    const matchText = p.nama.toLowerCase().includes(q) || p.nip.includes(q) || p.jabatan.toLowerCase().includes(q);
    const matchUnit = !unitF || p.unit_kerja === unitF;
    const matchStatus = !statusF || p.status_kepegawaian === statusF;
    return matchText && matchUnit && matchStatus;
  });

  const tbody = document.getElementById('pegawaiTableBody');
  tbody.innerHTML = filtered.map((p, idx) => {
    const total = Number(p.gaji_pokok) + Number(p.tunjangan);
    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-4 font-medium text-slate-500">${idx + 1}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${p.nama}</div>
          <div class="text-xs text-slate-500 font-mono">NIP. ${p.nip}</div>
        </td>
        <td class="py-3 px-4">
          <span class="font-semibold text-blue-900">${p.golongan}</span>
          <div class="text-xs text-slate-500">${p.pangkat}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-800">${p.jabatan}</div>
          <div class="text-xs text-slate-500">${p.unit_kerja}</div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${p.status_kepegawaian === 'PNS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}">
            ${p.status_kepegawaian}
          </span>
        </td>
        <td class="py-3 px-4 font-semibold text-emerald-700">${formatRupiah(total)}</td>
        <td class="py-3 px-4 text-center space-x-1">
          <button onclick="editPegawai(${p.id})" class="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button onclick="deletePegawai(${p.id})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function openModalPegawai(emp = null) {
  const modal = document.getElementById('pegawaiModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (emp) {
    document.getElementById('modalTitle').textContent = 'Edit Data Pegawai';
    document.getElementById('empId').value = emp.id;
    document.getElementById('empNip').value = emp.nip;
    document.getElementById('empNama').value = emp.nama;
    document.getElementById('empJk').value = emp.jenis_kelamin;
    document.getElementById('empGol').value = `${emp.golongan}|${emp.pangkat}`;
    document.getElementById('empJabatan').value = emp.jabatan;
    document.getElementById('empUnit').value = emp.unit_kerja;
    document.getElementById('empStatus').value = emp.status_kepegawaian;
    document.getElementById('empPendidikan').value = emp.pendidikan;
    document.getElementById('empGaji').value = emp.gaji_pokok;
    document.getElementById('empTunjangan').value = emp.tunjangan;
  } else {
    document.getElementById('modalTitle').textContent = 'Tambah Pegawai Baru';
    document.getElementById('pegawaiForm').reset();
    document.getElementById('empId').value = '';
  }
}

function closeModalPegawai() {
  const modal = document.getElementById('pegawaiModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

document.getElementById('pegawaiForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const idVal = document.getElementById('empId').value;
  const [gol, pangkat] = document.getElementById('empGol').value.split('|');
  const payload = {
    id: idVal ? Number(idVal) : (pegawaiList.length ? Math.max(...pegawaiList.map(p => p.id)) + 1 : 1),
    nip: document.getElementById('empNip').value,
    nama: document.getElementById('empNama').value,
    jenis_kelamin: document.getElementById('empJk').value,
    pangkat: pangkat,
    golongan: gol,
    jabatan: document.getElementById('empJabatan').value,
    unit_kerja: document.getElementById('empUnit').value,
    pendidikan: document.getElementById('empPendidikan').value,
    status_kepegawaian: document.getElementById('empStatus').value,
    gaji_pokok: Number(document.getElementById('empGaji').value),
    tunjangan: Number(document.getElementById('empTunjangan').value)
  };

  if (idVal) {
    const idx = pegawaiList.findIndex(p => p.id === Number(idVal));
    pegawaiList[idx] = { ...pegawaiList[idx], ...payload };
  } else {
    pegawaiList.unshift(payload);
  }
  saveData();
  refreshAll();
  closeModalPegawai();
});

function editPegawai(id) {
  const emp = pegawaiList.find(p => p.id === id);
  if (emp) openModalPegawai(emp);
}

function deletePegawai(id) {
  if (confirm('Yakin ingin menghapus data pegawai ini?')) {
    pegawaiList = pegawaiList.filter(p => p.id !== id);
    saveData();
    refreshAll();
  }
}

function renderReportPreview() {
  const unitFilter = document.getElementById('reportUnitFilter').value;
  const rows = unitFilter ? pegawaiList.filter(p => p.unit_kerja === unitFilter) : pegawaiList;

  document.getElementById('reportSubtitle').textContent = 'Unit Kerja: ' + (unitFilter || 'Seluruh Unit Gedung Keuangan');
  document.getElementById('repTotal').textContent = rows.length;
  document.getElementById('repPns').textContent = rows.filter(p => p.status_kepegawaian === 'PNS').length;
  document.getElementById('repPppk').textContent = rows.filter(p => p.status_kepegawaian === 'PPPK').length;
  const totalGaji = rows.reduce((s, p) => s + Number(p.gaji_pokok) + Number(p.tunjangan), 0);
  document.getElementById('repGaji').textContent = formatRupiah(totalGaji);

  document.getElementById('reportTableBody').innerHTML = rows.map((p, idx) => `
    <tr>
      <td class="border border-slate-400 px-2 py-1 text-center">${idx + 1}</td>
      <td class="border border-slate-400 px-2 py-1 font-mono">${p.nip}</td>
      <td class="border border-slate-400 px-2 py-1 font-semibold">${p.nama}</td>
      <td class="border border-slate-400 px-2 py-1">${p.pangkat} (${p.golongan})</td>
      <td class="border border-slate-400 px-2 py-1">${p.jabatan}</td>
      <td class="border border-slate-400 px-2 py-1">${p.unit_kerja}</td>
      <td class="border border-slate-400 px-2 py-1 text-center">${p.status_kepegawaian}</td>
      <td class="border border-slate-400 px-2 py-1 text-right">${formatRupiah(Number(p.gaji_pokok) + Number(p.tunjangan))}</td>
    </tr>
  `).join('');
}

function downloadPDF() {
  const element = document.getElementById('printableReportArea');
  const opt = {
    margin: 0.4,
    filename: 'Laporan_Kepegawaian_Gedung_Keuangan.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
}

window.addEventListener('DOMContentLoaded', initApp);
