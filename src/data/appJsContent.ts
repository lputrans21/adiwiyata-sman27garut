/**
 * Client-Side JavaScript Engine (app.js) Source Code for Export & Viewing
 * Adiwiyata - Divisi Pengelolaan Sampah SMAN 27 GARUT
 */

export const APP_JS_SOURCE = `/**
 * =========================================================================================
 * CLIENT-SIDE JAVASCRIPT ENGINE (app.js)
 * APLIKASI: Adiwiyata - Divisi Pengelolaan Sampah SMAN 27 GARUT
 * INTEGRASI FRONTEND DENGAN GOOGLE APPS SCRIPT WEB APP BACKEND
 * =========================================================================================
 * 
 * PETUNJUK PENEMPELAN URL WEB APP GOOGLE APPS SCRIPT:
 * 1. Buka spreadsheet Google Sheets Anda > Klik Extensions > Apps Script.
 * 2. Salin kode 'Code.gs' ke editor Apps Script dan simpan (Ctrl + S).
 * 3. Klik tombol biru "Deploy" (Terapkan) di kanan atas > "New deployment" (Penerapan baru).
 * 4. Pilih tipe "Web app" (ikon bola dunia).
 * 5. Isi konfigurasi:
 *    - Description: "Adiwiyata SMAN 27 Garut v1"
 *    - Execute as (Jalankan sebagai): "Me" (email Anda)
 *    - Who has access (Siapa yang memiliki akses): "Anyone" (Siapa saja)
 * 6. Klik "Deploy", beri izin otorisasi Google ("Review permissions" > pilih akun > Advanced > Go to Untitled project (unsafe) > Allow).
 * 7. Salin "Web app URL" (URL berakhiran /exec).
 * 8. Tempelkan URL tersebut ke variabel GAS_WEB_APP_URL di bawah ini:
 */

// >>> TEMPELKAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA DI SINI <<<
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_DEPLOYMENT_ID_ANDA/exec";

// Password Admin Resmi SMAN 27 Garut
const ADMIN_PASSWORD = "dead4left";

// Status State Aplikasi
const AppState = {
  isAdmin: false,
  adminPassword: "",
  activePeriod: "harian", // 'harian', 'mingguan', 'bulanan'
  selectedDate: getTodayString(),
  masterPegawai: [],
  cache: {
    absensiUmum: [],
    absensiSub: [],
    timbangan: [],
    produk: []
  }
};

// ==========================================
// 1. HELPER FETCH & KOMUNIKASI GOOGLE APPS SCRIPT
// ==========================================

/**
 * Mengirim data ke Google Apps Script via POST.
 * PENTING: Gunakan 'text/plain;charset=utf-8' untuk menghindari CORS Pre-flight (OPTIONS)
 * pada endpoint Google Apps Script yang melakukan redirection (HTTP 302).
 */
async function sendToAppsScript(action, payload = {}) {
  // Cek apakah URL telah diganti
  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("GANTI_DENGAN_DEPLOYMENT_ID")) {
    console.warn("⚠️ Peringatan: GAS_WEB_APP_URL belum diatur. Menggunakan penyimpanan lokal sementara.");
    return fallbackLocalHandler(action, payload);
  }

  showLoading(true);

  const requestBody = {
    action: action,
    timestamp: new Date().toISOString(),
    ...payload
  };

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(\`HTTP Error Status: \${response.status}\`);
    }

    const jsonResult = await response.json();
    showLoading(false);
    return jsonResult;
  } catch (error) {
    showLoading(false);
    console.error("Gagal terhubung ke Google Apps Script:", error);
    showToast("Gagal koneksi ke server Apps Script. Beralih ke data lokal.", "error");
    return fallbackLocalHandler(action, payload);
  }
}

/**
 * Mengambil data laporan atau seluruh record dari Google Apps Script via GET
 */
async function fetchFromAppsScript(action, params = {}) {
  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("GANTI_DENGAN_DEPLOYMENT_ID")) {
    return fallbackLocalHandler(action, params);
  }

  showLoading(true);

  const queryParams = new URLSearchParams({
    action: action,
    ...params
  });

  try {
    const response = await fetch(\`\${GAS_WEB_APP_URL}?\${queryParams.toString()}\`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(\`HTTP Error Status: \${response.status}\`);
    }

    const jsonResult = await response.json();
    showLoading(false);
    return jsonResult;
  } catch (error) {
    showLoading(false);
    console.error("Gagal mengambil data dari Google Apps Script:", error);
    return fallbackLocalHandler(action, params);
  }
}

// ==========================================
// 2. FUNGSI SUBMIT FORM SUB-MENU 1 SAMPAI 4
// ==========================================

/**
 * Sub-Menu 1: Submit Form Absensi Umum
 * Kolom Sheet: ID, Timestamp, Date, Nama_Pegawai, Status_Kehadiran, Catatan, Catatan_Khusus_Admin
 */
async function submitAbsensiUmum(event) {
  if (event) event.preventDefault();

  const namaPegawai = document.getElementById("absensiPegawaiSelect")?.value?.trim();
  const statusKehadiran = window.currentAttendanceStatus || "Hadir";
  const catatan = document.getElementById("absensiCatatan")?.value?.trim() || "-";
  const date = document.getElementById("dateSelector")?.value || AppState.selectedDate;

  // Validasi Input
  if (!namaPegawai) {
    showToast("Pilih Nama Pegawai terlebih dahulu!", "warning");
    return;
  }

  const payload = {
    namaPegawai: namaPegawai,
    statusKehadiran: statusKehadiran,
    catatan: catatan,
    date: date
  };

  const res = await sendToAppsScript("createAbsensiUmum", payload);

  if (res && res.success) {
    showToast(\`Presensi \${statusKehadiran} untuk \${namaPegawai} berhasil dicatat!\`, "success");
    if (document.getElementById("absensiCatatan")) {
      document.getElementById("absensiCatatan").value = "";
    }
    // Refresh laporan realtime & tabel
    loadRealtimeReports();
  } else {
    showToast(res.message || "Gagal menyimpan absensi.", "error");
  }
}

/**
 * Sub-Menu 2: Submit Form Absensi Sub-Bidang
 * Kolom Sheet: ID, Timestamp, Date, Nama_Pegawai, Bidang, Status, Catatan, Catatan_Khusus_Admin
 */
async function submitAbsensiSubBidang(event) {
  if (event) event.preventDefault();

  const namaPegawai = document.getElementById("subPegawaiSelect")?.value?.trim();
  const bidang = document.getElementById("subBidangSelect")?.value?.trim();
  const status = document.getElementById("subStatusInput")?.value?.trim() || "Aktif Bekerja";
  const catatan = document.getElementById("subCatatan")?.value?.trim() || "-";
  const date = document.getElementById("dateSelector")?.value || AppState.selectedDate;

  // Validasi Input
  if (!namaPegawai) {
    showToast("Pilih Nama Pegawai terlebih dahulu!", "warning");
    return;
  }
  if (!bidang) {
    showToast("Pilih Sub-Bidang pemilahan sampah!", "warning");
    return;
  }

  const payload = {
    namaPegawai: namaPegawai,
    bidang: bidang,
    status: status,
    catatan: catatan,
    date: date
  };

  const res = await sendToAppsScript("createAbsensiSubBidang", payload);

  if (res && res.success) {
    showToast(\`Absensi Sub-Bidang (\${bidang}) berhasil disimpan!\`, "success");
    if (document.getElementById("subCatatan")) {
      document.getElementById("subCatatan").value = "";
    }
    loadRealtimeReports();
  } else {
    showToast(res.message || "Gagal menyimpan penugasan sub-bidang.", "error");
  }
}

/**
 * Sub-Menu 3: Submit Form Timbangan Sampah
 * Kolom Sheet: ID, Timestamp, Date, Jenis_Sampah, Berat_KG, Petugas, Catatan, Catatan_Khusus_Admin
 */
async function submitTimbanganSampah(event) {
  if (event) event.preventDefault();

  const jenisSampah = document.getElementById("timbanganJenisSelect")?.value?.trim() || "Organik";
  const beratInput = document.getElementById("timbanganBeratInput")?.value;
  const beratKg = parseFloat(beratInput);
  const petugas = document.getElementById("timbanganPetugasSelect")?.value?.trim();
  const catatan = document.getElementById("timbanganCatatan")?.value?.trim() || "-";
  const date = document.getElementById("dateSelector")?.value || AppState.selectedDate;

  // Validasi Input Ketat
  if (!petugas) {
    showToast("Pilih Nama Petugas Penimbang!", "warning");
    return;
  }
  if (isNaN(beratKg) || beratKg <= 0) {
    showToast("Berat timbangan sampah (KG) harus berupa angka lebih dari 0!", "warning");
    return;
  }

  const payload = {
    jenisSampah: jenisSampah,
    beratKg: beratKg,
    petugas: petugas,
    catatan: catatan,
    date: date
  };

  const res = await sendToAppsScript("createTimbanganSampah", payload);

  if (res && res.success) {
    showToast(\`Timbangan \${jenisSampah} seberat \${beratKg} KG berhasil dicatat!\`, "success");
    if (document.getElementById("timbanganCatatan")) {
      document.getElementById("timbanganCatatan").value = "";
    }
    loadRealtimeReports();
  } else {
    showToast(res.message || "Gagal menyimpan timbangan sampah.", "error");
  }
}

/**
 * Sub-Menu 4: Submit Form Produk Hasil Olahan Daur Ulang
 * Kolom Sheet: ID, Timestamp, Date, Jenis_Produk, Satuan, Jumlah, Petugas, Catatan, Catatan_Khusus_Admin
 */
async function submitProdukHasil(event) {
  if (event) event.preventDefault();

  const jenisProduk = document.getElementById("produkJenisSelect")?.value?.trim() || "Pupuk Kompos";
  const jumlahInput = document.getElementById("produkJumlahInput")?.value;
  const jumlah = parseFloat(jumlahInput);
  const satuan = document.getElementById("produkSatuanSelect")?.value?.trim() || "Kilogram";
  const petugas = document.getElementById("produkPetugasSelect")?.value?.trim();
  const catatan = document.getElementById("produkCatatan")?.value?.trim() || "-";
  const date = document.getElementById("dateSelector")?.value || AppState.selectedDate;

  // Validasi Input Ketat
  if (!petugas) {
    showToast("Pilih Petugas Penanggung Jawab!", "warning");
    return;
  }
  if (isNaN(jumlah) || jumlah <= 0) {
    showToast("Jumlah produk harus berupa angka valid lebih dari 0!", "warning");
    return;
  }

  const payload = {
    jenisProduk: jenisProduk,
    satuan: satuan,
    jumlah: jumlah,
    petugas: petugas,
    catatan: catatan,
    date: date
  };

  const res = await sendToAppsScript("createProdukHasil", payload);

  if (res && res.success) {
    showToast(\`Produk \${jenisProduk} (\${jumlah} \${satuan}) berhasil disimpan!\`, "success");
    if (document.getElementById("produkCatatan")) {
      document.getElementById("produkCatatan").value = "";
    }
    loadRealtimeReports();
  } else {
    showToast(res.message || "Gagal menyimpan produk hasil.", "error");
  }
}

// ==========================================
// 3. MODUL ADMIN (PASSWORD: "dead4left")
// ==========================================

/**
 * Verifikasi Password Admin via backend Google Apps Script
 */
async function verifyAdminAccess(enteredPassword) {
  if (!enteredPassword) {
    showToast("Masukkan password admin!", "warning");
    return false;
  }

  // Kirim verifikasi ke Apps Script
  const res = await sendToAppsScript("verifyAdmin", { password: enteredPassword });

  if (res && (res.isAdmin || res.success)) {
    AppState.isAdmin = true;
    AppState.adminPassword = enteredPassword;
    showToast("Verifikasi Admin Berhasil! Hak akses administratif terbuka.", "success");
    updateAdminUIState(true);
    return true;
  } else {
    AppState.isAdmin = false;
    showToast("Password admin salah! (Petunjuk: dead4left)", "error");
    return false;
  }
}

/**
 * Admin: Tambah Pegawai Baru ke Sheet "Master_Pegawai"
 */
async function adminTambahPegawai(namaPegawai, idPegawai = "") {
  if (!AppState.isAdmin) {
    showToast("Akses ditolak: Anda belum terotentikasi sebagai Admin!", "error");
    return;
  }
  if (!namaPegawai || !namaPegawai.trim()) {
    showToast("Nama pegawai tidak boleh kosong!", "warning");
    return;
  }

  const payload = {
    subAction: "add",
    namaPegawai: namaPegawai.trim(),
    idPegawai: idPegawai.trim(),
    adminPassword: AppState.adminPassword
  };

  const res = await sendToAppsScript("managePegawai", payload);

  if (res && res.success) {
    showToast(\`Pegawai \${namaPegawai} berhasil ditambahkan!\`, "success");
    await loadMasterPegawai();
  } else {
    showToast(res.message || "Gagal menambah pegawai.", "error");
  }
}

/**
 * Admin: Hapus Pegawai dari Sheet "Master_Pegawai"
 */
async function adminHapusPegawai(idPegawai, namaPegawai) {
  if (!AppState.isAdmin) {
    showToast("Akses ditolak: Anda belum terotentikasi sebagai Admin!", "error");
    return;
  }

  if (!confirm(\`Yakin ingin menghapus pegawai "\${namaPegawai}" (\${idPegawai}) dari Master Pegawai?\`)) {
    return;
  }

  const payload = {
    subAction: "delete",
    idPegawai: idPegawai,
    adminPassword: AppState.adminPassword
  };

  const res = await sendToAppsScript("managePegawai", payload);

  if (res && res.success) {
    showToast(\`Pegawai \${namaPegawai} berhasil dihapus!\`, "success");
    await loadMasterPegawai();
  } else {
    showToast(res.message || "Gagal menghapus pegawai.", "error");
  }
}

/**
 * Admin: Edit Data Transaksi Record pada Sub-Menu 1 sampai 4
 */
async function adminEditRecord(sheetName, recordId, updatedFields = {}) {
  if (!AppState.isAdmin) {
    showToast("Akses ditolak: Anda belum terotentikasi sebagai Admin!", "error");
    return;
  }

  const payload = {
    sheetName: sheetName,
    recordId: recordId,
    fields: updatedFields,
    adminPassword: AppState.adminPassword
  };

  const res = await sendToAppsScript("updateRecord", payload);

  if (res && res.success) {
    showToast(\`Record \${recordId} pada \${sheetName} berhasil diperbarui!\`, "success");
    loadRealtimeReports();
  } else {
    showToast(res.message || "Gagal memperbarui record.", "error");
  }
}

/**
 * Admin: Hapus Record Transaksi dari Sub-Menu 1 sampai 4
 */
async function adminHapusRecord(sheetName, recordId) {
  if (!AppState.isAdmin) {
    showToast("Akses ditolak: Anda belum terotentikasi sebagai Admin!", "error");
    return;
  }

  if (!confirm(\`Hapus permanen record \${recordId} dari sheet \${sheetName}?\`)) {
    return;
  }

  const payload = {
    sheetName: sheetName,
    recordId: recordId,
    adminPassword: AppState.adminPassword
  };

  const res = await sendToAppsScript("deleteRecord", payload);

  if (res && res.success) {
    showToast(\`Record \${recordId} berhasil dihapus permanen!\`, "success");
    loadRealtimeReports();
  } else {
    showToast(res.message || "Gagal menghapus record.", "error");
  }
}

/**
 * Admin: Tambah / Edit Kolom "Catatan Khusus Admin" pada Record Data
 */
async function adminUpdateCatatanKhusus(sheetName, recordId, catatanAdmin) {
  if (!AppState.isAdmin) {
    showToast("Akses ditolak: Anda belum terotentikasi sebagai Admin!", "error");
    return;
  }

  const payload = {
    sheetName: sheetName,
    recordId: recordId,
    adminNote: catatanAdmin,
    adminPassword: AppState.adminPassword
  };

  const res = await sendToAppsScript("updateAdminNote", payload);

  if (res && res.success) {
    showToast(\`Catatan Khusus Admin untuk record \${recordId} berhasil disimpan!\`, "success");
    loadRealtimeReports();
  } else {
    showToast(res.message || "Gagal menyimpan Catatan Khusus Admin.", "error");
  }
}

// ==========================================
// 4. MODUL LAPORAN REALTIME (HARIAN, MINGGUAN, BULANAN)
// ==========================================

/**
 * Mengambil data agregasi laporan realtime dan memperbarui Ringkasan Kartu Data & Tabel
 */
async function loadRealtimeReports(period = null) {
  if (period) AppState.activePeriod = period;

  const dateSelector = document.getElementById("dateSelector");
  const selectedDate = dateSelector ? dateSelector.value : AppState.selectedDate;

  const res = await fetchFromAppsScript("getReportData", {
    period: AppState.activePeriod,
    date: selectedDate
  });

  if (res && res.success && res.summary) {
    renderSummaryCards(res.summary);
    if (res.raw) {
      renderTablesFromData(res.raw);
    }
  }
}

/**
 * Memperbarui tampilan 4 Ringkasan Kartu Data KPI Utama
 */
function renderSummaryCards(summary) {
  // 1. Total Sampah Terkumpul
  const elTotalSampah = document.getElementById("cardTotalSampah");
  if (elTotalSampah) {
    elTotalSampah.innerHTML = \`\${(summary.totalSampahKg || 0).toLocaleString('id-ID')} <span class="text-sm font-bold text-emerald-700">KG</span>\`;
  }
  const elSampahDesc = document.getElementById("cardSampahDesc");
  if (elSampahDesc) {
    elSampahDesc.innerText = \`Dari \${summary.totalTransaksiTimbangan || 0} penimbangan (\${AppState.activePeriod})\`;
  }

  // 2. Pupuk Kompos Organik
  const komposJml = summary.produkByJenis?.["Pupuk Kompos"]?.jumlah || 0;
  const elKompos = document.getElementById("cardTotalKompos");
  if (elKompos) {
    elKompos.innerHTML = \`\${komposJml.toLocaleString('id-ID')} <span class="text-sm font-bold text-amber-700">KG</span>\`;
  }

  // 3. Pupuk Cair Air Lindi
  const lindiJml = summary.produkByJenis?.["Air lindi"]?.jumlah || 0;
  const elLindi = document.getElementById("cardTotalLindi");
  if (elLindi) {
    elLindi.innerHTML = \`\${lindiJml.toLocaleString('id-ID')} <span class="text-sm font-bold text-blue-700">Liter</span>\`;
  }

  // 4. Kehadiran Petugas
  const totalHadir = summary.kehadiran?.Hadir || 0;
  const totalIzin = summary.kehadiran?.Izin || 0;
  const totalSakit = summary.kehadiran?.Sakit || 0;
  const elKehadiran = document.getElementById("cardKehadiran");
  if (elKehadiran) {
    elKehadiran.innerHTML = \`\${totalHadir} Petugas <span class="text-xs font-bold text-purple-700">(Hadir)</span>\`;
  }
  const elKehadiranDesc = document.getElementById("cardKehadiranDesc");
  if (elKehadiranDesc) {
    elKehadiranDesc.innerText = \`\${totalIzin} Izin • \${totalSakit} Sakit\`;
  }
}

/**
 * Mengisi tabel riwayat data dari respons server
 */
function renderTablesFromData(raw) {
  if (raw.absensiUmum) {
    const tbody = document.getElementById("tableAbsensiUmumBody");
    if (tbody) {
      tbody.innerHTML = raw.absensiUmum.map(r => \`
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-semibold text-slate-800">\${r.Date || '-'}<br><span class="text-[10px] text-slate-400 font-mono">\${r.ID || ''}</span></td>
          <td class="py-2.5 px-3 font-bold text-slate-900">\${r.Nama_Pegawai || '-'}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${r.Status_Kehadiran === 'Hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">\${r.Status_Kehadiran || 'Hadir'}</span></td>
          <td class="py-2.5 px-3 text-slate-600">\${r.Catatan || '-'}</td>
          <td class="py-2.5 px-3 text-amber-800 font-semibold">\${r.Catatan_Khusus_Admin || '-'}</td>
        </tr>
      \`).join('');
    }
  }

  if (raw.timbangan) {
    const tbody = document.getElementById("tableTimbanganBody");
    if (tbody) {
      tbody.innerHTML = raw.timbangan.map(r => \`
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-semibold text-slate-800">\${r.Date || '-'}<br><span class="text-[10px] text-slate-400 font-mono">\${r.ID || ''}</span></td>
          <td class="py-2.5 px-3 font-bold \${r.Jenis_Sampah === 'Organik' ? 'text-emerald-700' : r.Jenis_Sampah === 'Botol' ? 'text-sky-700' : 'text-amber-700'}">\${r.Jenis_Sampah}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-slate-900">\${r.Berat_KG} KG</td>
          <td class="py-2.5 px-3">\${r.Petugas || '-'}</td>
          <td class="py-2.5 px-3 text-slate-600">\${r.Catatan || '-'}</td>
        </tr>
      \`).join('');
    }
  }

  if (raw.produk) {
    const tbody = document.getElementById("tableProdukBody");
    if (tbody) {
      tbody.innerHTML = raw.produk.map(r => \`
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-semibold text-slate-800">\${r.Date || '-'}<br><span class="text-[10px] text-slate-400 font-mono">\${r.ID || ''}</span></td>
          <td class="py-2.5 px-3 font-bold text-purple-800">\${r.Jenis_Produk}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-slate-900">\${r.Jumlah} \${r.Satuan}</td>
          <td class="py-2.5 px-3">\${r.Petugas || '-'}</td>
          <td class="py-2.5 px-3 text-slate-600">\${r.Catatan || '-'}</td>
        </tr>
      \`).join('');
    }
  }
}

// ==========================================
// 5. MASTER PEGAWAI LOADER
// ==========================================

async function loadMasterPegawai() {
  const res = await fetchFromAppsScript("getMasterPegawai");
  if (res && res.data) {
    AppState.masterPegawai = res.data;
    populatePegawaiSelectors(res.data);
  }
}

function populatePegawaiSelectors(pegawaiList) {
  const ids = ["absensiPegawaiSelect", "subPegawaiSelect", "timbanganPetugasSelect", "produkPetugasSelect"];
  ids.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Pilih Pegawai / Petugas --</option>' +
      pegawaiList.map(p => \`<option value="\${p.Nama_Pegawai}">\${p.Nama_Pegawai} (\${p.ID_Pegawai})</option>\`).join('');
  });

  // Render Admin Master Pegawai Table jika ada
  const adminTbody = document.getElementById("tableMasterPegawaiBody");
  if (adminTbody) {
    adminTbody.innerHTML = pegawaiList.map(p => \`
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3 font-mono font-bold text-slate-700">\${p.ID_Pegawai}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-900">\${p.Nama_Pegawai}</td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="adminHapusPegawai('\${p.ID_Pegawai}', '\${p.Nama_Pegawai}')" class="text-rose-600 hover:text-rose-800 font-bold text-xs px-2 py-1 bg-rose-50 rounded-lg transition">Hapus</button>
        </td>
      </tr>
    \`).join('');
  }
}

// ==========================================
// 6. UI & UTILITY HELPERS
// ==========================================

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return \`\${year}-\${month}-\${day}\`;
}

function showLoading(isLoading) {
  let loader = document.getElementById("globalSpinner");
  if (!loader && isLoading) {
    loader = document.createElement("div");
    loader.id = "globalSpinner";
    loader.className = "fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500/50 animate-bounce";
    loader.innerHTML = \`<span>⏳</span><span>Menghubungi Google Apps Script...</span>\`;
    document.body.appendChild(loader);
  } else if (loader && !isLoading) {
    loader.remove();
  }
}

function showToast(msg, type = "info") {
  const toast = document.createElement("div");
  const bg = type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-amber-600";
  toast.className = \`fixed top-6 right-6 z-50 \${bg} text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 transform transition-all duration-300\`;
  toast.innerHTML = \`<span>\${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span><span>\${msg}</span>\`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function updateAdminUIState(isLoggedIn) {
  const lockedView = document.getElementById("adminLockedView");
  const unlockedView = document.getElementById("adminUnlockedView");
  const badgeContainer = document.getElementById("adminStatusContainer");

  if (isLoggedIn) {
    if (lockedView) lockedView.classList.add("hidden");
    if (unlockedView) unlockedView.classList.remove("hidden");
    if (badgeContainer) {
      badgeContainer.innerHTML = \`
        <div class="flex items-center gap-1.5 bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow">
          <span>🛡️ Admin Aktif</span>
          <button onclick="logoutAdminSession()" class="ml-1 text-slate-950 hover:text-red-700 font-black" title="Keluar Admin">&times;</button>
        </div>
      \`;
    }
  } else {
    if (lockedView) lockedView.classList.remove("hidden");
    if (unlockedView) unlockedView.classList.add("hidden");
    if (badgeContainer) {
      badgeContainer.innerHTML = \`
        <button onclick="openModal('modalAdminLogin')" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 border border-emerald-500/60 text-xs text-amber-200 hover:text-white font-bold transition shadow-sm">
          <span>🛡️ Login Admin</span>
        </button>
      \`;
    }
  }
}

function logoutAdminSession() {
  AppState.isAdmin = false;
  AppState.adminPassword = "";
  updateAdminUIState(false);
  showToast("Anda telah keluar dari mode Admin.", "info");
}

// Fallback jika GAS_WEB_APP_URL belum diatur oleh pengguna
function fallbackLocalHandler(action, payload) {
  console.log(\`[SIMULASI LOCAL] Eksekusi aksi: \${action}\`, payload);
  if (action === "verifyAdmin") {
    const isValid = payload.password === ADMIN_PASSWORD;
    return { success: isValid, isAdmin: isValid, message: isValid ? "Admin Terverifikasi" : "Password Salah" };
  }
  return { success: true, message: "Tersimpan pada cache lokal (simulasi)" };
}

// Inisialisasi Event Listener Otomatis saat Halaman Siap
window.addEventListener("DOMContentLoaded", () => {
  loadMasterPegawai();
  loadRealtimeReports();
});
`;
