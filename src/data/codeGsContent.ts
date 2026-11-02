/**
 * Source code representation of Code.gs for the web viewer, 1-click copy, and download.
 */

export const CODE_GS_SOURCE = `/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT (Code.gs)
 * PROYEK: Adiwiyata - Divisi Pengelolaan Sampah SMAN 27 GARUT
 * BACKEND CRUD & REPORTING ENGINE
 * 
 * Fitur:
 * 1. Manajemen Struktur 5 Sheets (Absensi_Umum, Absensi_SubBidang, Timbangan_Sampah, Produk_Hasil, Master_Pegawai)
 * 2. Auto-Inisialisasi Sheet & Header otomatis jika belum tersedia
 * 3. Web App doGet() untuk penyajian UI HTML dan pengujian endpoint
 * 4. Web App doPost() API Handler untuk CRUD Form Sub-menu 1-4
 * 5. Agregasi Data Laporan Realtime (Harian, Mingguan, Bulanan)
 * 6. Verifikasi Keamanan Admin (Password: "dead4left")
 * 7. Fitur Khusus Admin: Edit/Hapus Master Pegawai, Edit/Hapus Record Transaksi 1-4,
 *    dan Pemberian "Catatan Khusus Admin" pada setiap transaksi
 * 8. Dukungan Concurrency LockService & Output JSON berstandar CORS
 * =========================================================================================
 */

// ==========================================
// 1. KONFIGURASI GLOBAL & KONSTANTA
// ==========================================

// Password otentikasi Admin
const ADMIN_PASSWORD = "dead4left";

// Nama-nama Sheet Database
const SHEETS = {
  ABSENSI_UMUM: "Absensi_Umum",
  ABSENSI_SUB: "Absensi_SubBidang",
  TIMBANGAN: "Timbangan_Sampah",
  PRODUK: "Produk_Hasil",
  MASTER_PEGAWAI: "Master_Pegawai"
};

// Skema Header Kolom untuk Setiap Sheet
const SHEET_HEADERS = {
  [SHEETS.ABSENSI_UMUM]: ["ID", "Timestamp", "Date", "Nama_Pegawai", "Status_Kehadiran", "Catatan", "Catatan_Khusus_Admin"],
  [SHEETS.ABSENSI_SUB]: ["ID", "Timestamp", "Date", "Nama_Pegawai", "Bidang", "Status", "Catatan", "Catatan_Khusus_Admin"],
  [SHEETS.TIMBANGAN]: ["ID", "Timestamp", "Date", "Jenis_Sampah", "Berat_KG", "Petugas", "Catatan", "Catatan_Khusus_Admin"],
  [SHEETS.PRODUK]: ["ID", "Timestamp", "Date", "Jenis_Produk", "Satuan", "Jumlah", "Petugas", "Catatan", "Catatan_Khusus_Admin"],
  [SHEETS.MASTER_PEGAWAI]: ["ID_Pegawai", "Nama_Pegawai"]
};

/**
 * Mendapatkan instance Spreadsheet aktif.
 * Jika script di-bind langsung pada Google Sheets, menggunakan getActiveSpreadsheet().
 * Jika menggunakan script standalone, ganti return SpreadsheetApp.openById("YOUR_SPREADSHEET_ID");
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    throw new Error("Tidak dapat mengakses Spreadsheet aktif. Pastikan script ini dibuat melalui Extensions > Apps Script pada Google Sheets.");
  }
}

// ==========================================
// 2. INISIALISASI STRUKTUR DATABASE (SHEETS)
// ==========================================

/**
 * Inisialisasi otomatis semua sheet dan header kolom yang dibutuhkan.
 * Dapat dijalankan manual satu kali dari editor Apps Script via Run > initSheets.
 */
function initSheets() {
  const ss = getSpreadsheet();
  
  Object.keys(SHEET_HEADERS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    const headers = SHEET_HEADERS[sheetName];
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      
      // Format header: Bold, latar belakang hijau Adiwiyata, teks putih, freeze baris 1
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1b4332");
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    } else {
      // Pastikan baris header terisi jika sheet masih kosong
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#1b4332");
        headerRange.setFontColor("#ffffff");
        sheet.setFrozenRows(1);
      }
    }
  });

  // Isi data awal Master Pegawai (20 Siswa Resmi SMAN 27 Garut) jika masih kosong
  const masterSheet = ss.getSheetByName(SHEETS.MASTER_PEGAWAI);
  if (masterSheet.getLastRow() <= 1) {
    const officialPegawai = [
      ["PGW-001", "SAIRA AULIA"],
      ["PGW-002", "GARSHELA PUTRI DERIS"],
      ["PGW-003", "NAZWA DEANDRA KESHA AUNI"],
      ["PGW-004", "VIKKA ALNABILLA"],
      ["PGW-005", "FIKA RAHMA ARNIDA"],
      ["PGW-006", "ZIRA ALMERA"],
      ["PGW-007", "RAHMI MAULIDA"],
      ["PGW-008", "DEWI RAHMA"],
      ["PGW-009", "GARNISA NOVIYANTI"],
      ["PGW-010", "LIA APRILIANI"],
      ["PGW-011", "REVALINA AGUSTINA"],
      ["PGW-012", "AMELIA KHUSUS KHOTIMAH"],
      ["PGW-013", "MEIKA RAHMA WIDIANTI"],
      ["PGW-014", "RIZKI RAMADHAN"],
      ["PGW-015", "ALKHA PRAMUDYA"],
      ["PGW-016", "DENISA FEBRIANTI"],
      ["PGW-017", "AMIRA AMBAR RAMADHANI"],
      ["PGW-018", "SISIL"],
      ["PGW-019", "REFA CAHYANI"],
      ["PGW-020", "METI PURNAMA SARI CAHYUNI"]
    ];
    officialPegawai.forEach(row => masterSheet.appendRow(row));
  }


  Logger.log("✅ Inisialisasi Database Sheet Adiwiyata SMAN 27 Garut Berhasil!");
  return { success: true, message: "Database dan Sheet berhasil diinisialisasi" };
}

// ==========================================
// 3. HANDLER WEB APP: doGet & doPost
// ==========================================

/**
 * Melayani request GET.
 * Menampilkan antarmuka HTML jika diakses langsung di browser,
 * atau mengembalikan JSON jika disertai query parameter ?action=...
 */
function doGet(e) {
  // Jika parameter action disertakan, proses sebagai API GET
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }

  // Tampilan Default HTML saat Web App dibuka di browser
  const htmlContent = \`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Backend Adiwiyata SMAN 27 Garut</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0fdf4; color: #1e293b; padding: 2rem; margin: 0; }
        .card { max-width: 680px; margin: 2rem auto; background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #bbf7d0; }
        h1 { color: #166534; margin-top: 0; font-size: 1.5rem; }
        .badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-size: 0.85rem; font-weight: bold; display: inline-block; }
        ul { padding-left: 1.25rem; line-height: 1.7; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #0f172a; }
        .footer { margin-top: 2rem; font-size: 0.85rem; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">Backend Active</span>
        <h1>Adiwiyata - Divisi Pengelolaan Sampah</h1>
        <h3>SMAN 27 GARUT</h3>
        <p>Google Apps Script Web App berhasil terpasang dan siap melayani pertukaran data CRUD dengan Google Sheets.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;" />
        <p><strong>Endpoint Tersedia:</strong></p>
        <ul>
          <li><code>doPost</code> untuk simpan form 1-4, verifikasi admin, update record, dan edit pegawai.</li>
          <li><code>doGet?action=getAllData</code> untuk membaca seluruh data sheet.</li>
          <li><code>doGet?action=getReportData&period=harian</code> untuk data laporan realtime.</li>
        </ul>
        <div class="footer">SMAN 27 Garut • Adiwiyata Mandiri • Google Apps Script Backend</div>
      </div>
    </body>
    </html>
  \`;
  return HtmlService.createHtmlOutput(htmlContent)
    .setTitle("Adiwiyata SMAN 27 Garut - Backend Service")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Melayani request POST dari formulir client / web app.
 * Menerima payload JSON atau FormData.
 */
function doPost(e) {
  // Gunakan LockService untuk mencegah race condition pada penulisan bersamaan
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Tunggu maksimal 10 detik
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Server sibuk memproses antrean data. Silakan coba kembali sesaat lagi."
    });
  }

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;
    const result = handleApiRequest(action, payload);
    return result;
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: "Terjadi kesalahan internal: " + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 4. ROUTER API UTAMA
// ==========================================

/**
 * Routing dispatcher untuk seluruh operasi CRUD dan query laporan.
 */
function handleApiRequest(action, data) {
  switch (action) {
    // 1. Verifikasi Password Admin
    case "verifyAdmin":
      return verifyAdminPassword(data.password);

    // 2. Operasi Create (Simpan data baru sub-menu 1 sampai 4)
    case "createAbsensiUmum":
      return createRecordAbsensiUmum(data);
    case "createAbsensiSubBidang":
      return createRecordAbsensiSubBidang(data);
    case "createTimbanganSampah":
      return createRecordTimbanganSampah(data);
    case "createProdukHasil":
      return createRecordProdukHasil(data);

    // 3. Baca Data Realtime & Laporan
    case "getReportData":
      return getReportDataRealtime(data.period, data.date);
    case "getAllData":
      return getAllDataRecords();
    case "getMasterPegawai":
      return getMasterPegawaiList();

    // 4. Operasi Khusus Admin
    case "managePegawai":
      return handleManagePegawai(data);
    case "updateRecord":
      return handleUpdateRecord(data);
    case "deleteRecord":
      return handleDeleteRecord(data);
    case "updateAdminNote":
      return handleUpdateAdminNote(data);

    default:
      return createJsonResponse({
        success: false,
        message: "Aksi tidak dikenali: " + action
      });
  }
}

// ==========================================
// 5. OPERASI VERIFIKASI ADMIN
// ==========================================

/**
 * Verifikasi password admin. Password resmi: "dead4left"
 */
function verifyAdminPassword(password) {
  if (password === ADMIN_PASSWORD) {
    return createJsonResponse({
      success: true,
      message: "Otentikasi Admin berhasil! Hak akses administratif diberikan.",
      isAdmin: true
    });
  } else {
    return createJsonResponse({
      success: false,
      message: "Password Admin salah. Akses ditolak.",
      isAdmin: false
    });
  }
}

/**
 * Helper validasi token/password admin sebelum eksekusi aksi sensitif
 */
function validateAdminAuth(data) {
  const pass = data.adminPassword || data.password;
  return pass === ADMIN_PASSWORD;
}

// ==========================================
// 6. OPERASI CREATE (SUB-MENU 1 SAMPAI 4)
// ==========================================

/**
 * Sub-Menu 1: Simpan Absensi Umum
 * Kolom: ID, Timestamp, Date, Nama_Pegawai, Status_Kehadiran, Catatan, Catatan_Khusus_Admin
 */
function createRecordAbsensiUmum(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ABSENSI_UMUM);
  if (!sheet) initSheets();

  const id = generateId("ABS-UMUM");
  const now = new Date();
  const timestamp = formatDateTime(now);
  const recordDate = data.date || formatDate(now);
  const namaPegawai = data.namaPegawai || data.nama_pegawai || "";
  const statusKehadiran = data.statusKehadiran || data.status_kehadiran || "Hadir";
  const catatan = data.catatan || "-";
  const catatanAdmin = data.catatanAdmin || "";

  if (!namaPegawai) {
    return createJsonResponse({ success: false, message: "Nama Pegawai wajib diisi!" });
  }

  sheet.appendRow([id, timestamp, recordDate, namaPegawai, statusKehadiran, catatan, catatanAdmin]);

  return createJsonResponse({
    success: true,
    message: "Absensi Umum untuk " + namaPegawai + " berhasil dicatat.",
    data: { id, timestamp, recordDate, namaPegawai, statusKehadiran, catatan, catatanAdmin }
  });
}

/**
 * Sub-Menu 2: Simpan Absensi Sub-Bidang
 * Bidang: Pengumpulan Sampah Botol / Plastik Halus / Organik
 * Kolom: ID, Timestamp, Date, Nama_Pegawai, Bidang, Status, Catatan, Catatan_Khusus_Admin
 */
function createRecordAbsensiSubBidang(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ABSENSI_SUB);
  if (!sheet) initSheets();

  const id = generateId("ABS-SUB");
  const now = new Date();
  const timestamp = formatDateTime(now);
  const recordDate = data.date || formatDate(now);
  const namaPegawai = data.namaPegawai || data.nama_pegawai || "";
  const bidang = data.bidang || "Organik"; // Botol / Plastik Halus / Organik
  const status = data.status || "Aktif";
  const catatan = data.catatan || "-";
  const catatanAdmin = data.catatanAdmin || "";

  if (!namaPegawai || !bidang) {
    return createJsonResponse({ success: false, message: "Nama Pegawai dan Sub-Bidang wajib diisi!" });
  }

  sheet.appendRow([id, timestamp, recordDate, namaPegawai, bidang, status, catatan, catatanAdmin]);

  return createJsonResponse({
    success: true,
    message: "Absensi Sub-Bidang (" + bidang + ") untuk " + namaPegawai + " berhasil disimpan.",
    data: { id, timestamp, recordDate, namaPegawai, bidang, status, catatan, catatanAdmin }
  });
}

/**
 * Sub-Menu 3: Simpan Timbangan Sampah
 * Jenis: Botol / Plastik Halus / Organik
 * Kolom: ID, Timestamp, Date, Jenis_Sampah, Berat_KG, Petugas, Catatan, Catatan_Khusus_Admin
 */
function createRecordTimbanganSampah(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.TIMBANGAN);
  if (!sheet) initSheets();

  const id = generateId("TMB");
  const now = new Date();
  const timestamp = formatDateTime(now);
  const recordDate = data.date || formatDate(now);
  const jenisSampah = data.jenisSampah || data.jenis_sampah || "Organik";
  const beratKg = parseFloat(data.beratKg || data.berat_kg || 0);
  const petugas = data.petugas || data.namaPegawai || "-";
  const catatan = data.catatan || "-";
  const catatanAdmin = data.catatanAdmin || "";

  if (isNaN(beratKg) || beratKg <= 0) {
    return createJsonResponse({ success: false, message: "Berat sampah (KG) harus berupa angka positif lebih dari 0!" });
  }

  sheet.appendRow([id, timestamp, recordDate, jenisSampah, beratKg, petugas, catatan, catatanAdmin]);

  return createJsonResponse({
    success: true,
    message: "Timbangan sampah " + jenisSampah + " seberat " + beratKg + " KG berhasil disimpan.",
    data: { id, timestamp, recordDate, jenisSampah, beratKg, petugas, catatan, catatanAdmin }
  });
}

/**
 * Sub-Menu 4: Simpan Produk Hasil
 * Jenis: Air lindi / Pupuk Kompos / Barang Daur Ulang
 * Satuan: Liter / Kilogram / Jumlah Barang
 * Kolom: ID, Timestamp, Date, Jenis_Produk, Satuan, Jumlah, Petugas, Catatan, Catatan_Khusus_Admin
 */
function createRecordProdukHasil(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PRODUK);
  if (!sheet) initSheets();

  const id = generateId("PRD");
  const now = new Date();
  const timestamp = formatDateTime(now);
  const recordDate = data.date || formatDate(now);
  const jenisProduk = data.jenisProduk || data.jenis_produk || "Pupuk Kompos";
  const satuan = data.satuan || "Kilogram";
  const jumlah = parseFloat(data.jumlah || 0);
  const petugas = data.petugas || data.namaPegawai || "-";
  const catatan = data.catatan || "-";
  const catatanAdmin = data.catatanAdmin || "";

  if (isNaN(jumlah) || jumlah <= 0) {
    return createJsonResponse({ success: false, message: "Jumlah produk hasil harus berupa angka valid lebih dari 0!" });
  }

  sheet.appendRow([id, timestamp, recordDate, jenisProduk, satuan, jumlah, petugas, catatan, catatanAdmin]);

  return createJsonResponse({
    success: true,
    message: "Produk hasil " + jenisProduk + " (" + jumlah + " " + satuan + ") berhasil disimpan.",
    data: { id, timestamp, recordDate, jenisProduk, satuan, jumlah, petugas, catatan, catatanAdmin }
  });
}

// ==========================================
// 7. OPERASI BACA & AGREGASI LAPORAN REALTIME
// ==========================================

/**
 * Membaca data realtime dan mengagregasi laporan:
 * - Harian (Hari ini atau tanggal yang dipilih)
 * - Mingguan (7 hari terakhir dari tanggal referensi)
 * - Bulanan (Bulan berjalan)
 */
function getReportDataRealtime(period, filterDateStr) {
  const ss = getSpreadsheet();
  const refDate = filterDateStr ? new Date(filterDateStr) : new Date();
  const periodType = (period || "harian").toLowerCase();

  // Helper rentang tanggal
  const isWithinPeriod = function(dateVal) {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return false;

    if (periodType === "harian") {
      return d.getFullYear() === refDate.getFullYear() &&
             d.getMonth() === refDate.getMonth() &&
             d.getDate() === refDate.getDate();
    } else if (periodType === "mingguan") {
      const diffTime = Math.abs(refDate.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && d <= refDate;
    } else if (periodType === "bulanan") {
      return d.getFullYear() === refDate.getFullYear() &&
             d.getMonth() === refDate.getMonth();
    }
    return true;
  };

  // 1. Rekap Timbangan Sampah
  const timbanganSheet = ss.getSheetByName(SHEETS.TIMBANGAN);
  const timbanganRows = getRowsAsObjects(timbanganSheet);
  const filteredTimbangan = timbanganRows.filter(r => isWithinPeriod(r.Date));

  let totalSampahKg = 0;
  const sampahByJenis = {
    "Botol": 0,
    "Plastik Halus": 0,
    "Organik": 0,
    "Lainnya": 0
  };

  filteredTimbangan.forEach(r => {
    const berat = parseFloat(r.Berat_KG) || 0;
    totalSampahKg += berat;
    if (sampahByJenis.hasOwnProperty(r.Jenis_Sampah)) {
      sampahByJenis[r.Jenis_Sampah] += berat;
    } else {
      sampahByJenis["Lainnya"] += berat;
    }
  });

  // 2. Rekap Produk Hasil
  const produkSheet = ss.getSheetByName(SHEETS.PRODUK);
  const produkRows = getRowsAsObjects(produkSheet);
  const filteredProduk = produkRows.filter(r => isWithinPeriod(r.Date));

  const produkByJenis = {
    "Air lindi": { jumlah: 0, satuan: "Liter" },
    "Pupuk Kompos": { jumlah: 0, satuan: "Kilogram" },
    "Barang Daur Ulang": { jumlah: 0, satuan: "Jumlah Barang" }
  };

  filteredProduk.forEach(r => {
    const jml = parseFloat(r.Jumlah) || 0;
    const jenis = r.Jenis_Produk;
    if (produkByJenis[jenis]) {
      produkByJenis[jenis].jumlah += jml;
    } else {
      produkByJenis[jenis] = { jumlah: jml, satuan: r.Satuan || "-" };
    }
  });

  // 3. Rekap Absensi Umum
  const absensiSheet = ss.getSheetByName(SHEETS.ABSENSI_UMUM);
  const absensiRows = getRowsAsObjects(absensiSheet);
  const filteredAbsensi = absensiRows.filter(r => isWithinPeriod(r.Date));

  const kehadiranSummary = {
    "Hadir": 0,
    "Izin": 0,
    "Sakit": 0,
    "Alpa": 0
  };

  filteredAbsensi.forEach(r => {
    const status = r.Status_Kehadiran || "Hadir";
    if (kehadiranSummary.hasOwnProperty(status)) {
      kehadiranSummary[status]++;
    } else {
      kehadiranSummary["Hadir"]++;
    }
  });

  // 4. Rekap Absensi Sub-Bidang
  const subSheet = ss.getSheetByName(SHEETS.ABSENSI_SUB);
  const subRows = getRowsAsObjects(subSheet);
  const filteredSub = subRows.filter(r => isWithinPeriod(r.Date));

  return createJsonResponse({
    success: true,
    period: periodType,
    referenceDate: formatDate(refDate),
    summary: {
      totalSampahKg: Math.round(totalSampahKg * 100) / 100,
      sampahByJenis: sampahByJenis,
      produkByJenis: produkByJenis,
      kehadiran: kehadiranSummary,
      totalPetugasHadir: kehadiranSummary["Hadir"],
      totalTransaksiTimbangan: filteredTimbangan.length,
      totalTransaksiProduk: filteredProduk.length
    },
    raw: {
      timbangan: filteredTimbangan,
      produk: filteredProduk,
      absensiUmum: filteredAbsensi,
      absensiSubBidang: filteredSub
    }
  });
}

/**
 * Mengambil seluruh data dari seluruh sheet (untuk sinkronisasi client realtime)
 */
function getAllDataRecords() {
  const ss = getSpreadsheet();
  return createJsonResponse({
    success: true,
    absensiUmum: getRowsAsObjects(ss.getSheetByName(SHEETS.ABSENSI_UMUM)),
    absensiSubBidang: getRowsAsObjects(ss.getSheetByName(SHEETS.ABSENSI_SUB)),
    timbanganSampah: getRowsAsObjects(ss.getSheetByName(SHEETS.TIMBANGAN)),
    produkHasil: getRowsAsObjects(ss.getSheetByName(SHEETS.PRODUK)),
    masterPegawai: getRowsAsObjects(ss.getSheetByName(SHEETS.MASTER_PEGAWAI))
  });
}

/**
 * Mengambil daftar Master Pegawai
 */
function getMasterPegawaiList() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MASTER_PEGAWAI);
  const rows = getRowsAsObjects(sheet);
  return createJsonResponse({
    success: true,
    data: rows
  });
}

// ==========================================
// 8. FITUR KHUSUS ADMIN
// ==========================================

/**
 * Kelola Master Pegawai: Tambah, Edit, Hapus
 * Membutuhkan verifikasi password admin: "dead4left"
 */
function handleManagePegawai(data) {
  if (!validateAdminAuth(data)) {
    return createJsonResponse({ success: false, message: "Otentikasi Admin Gagal! Aksi ditolak." });
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MASTER_PEGAWAI);
  const subAction = data.subAction; // 'add', 'edit', 'delete'

  if (subAction === "add") {
    const idPegawai = data.idPegawai || ("PEG-" + String(sheet.getLastRow()).padStart(3, "0"));
    const namaPegawai = data.namaPegawai;
    if (!namaPegawai) return createJsonResponse({ success: false, message: "Nama Pegawai tidak boleh kosong!" });
    
    sheet.appendRow([idPegawai, namaPegawai]);
    return createJsonResponse({
      success: true,
      message: "Pegawai " + namaPegawai + " (" + idPegawai + ") berhasil ditambahkan.",
      data: { ID_Pegawai: idPegawai, Nama_Pegawai: namaPegawai }
    });
  }

  if (subAction === "edit") {
    const targetId = data.idPegawai;
    const newName = data.namaPegawai;
    const rowIndex = findRowIndexById(sheet, 1, targetId);
    
    if (rowIndex === -1) {
      return createJsonResponse({ success: false, message: "Pegawai dengan ID " + targetId + " tidak ditemukan!" });
    }
    
    sheet.getRange(rowIndex, 2).setValue(newName);
    return createJsonResponse({
      success: true,
      message: "Data Pegawai ID " + targetId + " berhasil diperbarui menjadi " + newName + "."
    });
  }

  if (subAction === "delete") {
    const targetId = data.idPegawai;
    const rowIndex = findRowIndexById(sheet, 1, targetId);
    
    if (rowIndex === -1) {
      return createJsonResponse({ success: false, message: "Pegawai dengan ID " + targetId + " tidak ditemukan!" });
    }
    
    sheet.deleteRow(rowIndex);
    return createJsonResponse({
      success: true,
      message: "Pegawai dengan ID " + targetId + " berhasil dihapus dari Master Pegawai."
    });
  }

  return createJsonResponse({ success: false, message: "Sub-aksi pegawai tidak valid." });
}

/**
 * Edit Record Data Sub-Menu 1 sampai 4 oleh Admin
 * Membutuhkan password admin: "dead4left"
 */
function handleUpdateRecord(data) {
  if (!validateAdminAuth(data)) {
    return createJsonResponse({ success: false, message: "Otentikasi Admin Gagal! Aksi edit ditolak." });
  }

  const sheetName = data.sheetName;
  const recordId = data.recordId || data.id;
  const updatedFields = data.fields || {};

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return createJsonResponse({ success: false, message: "Sheet " + sheetName + " tidak ditemukan." });
  }

  const rowIndex = findRowIndexById(sheet, 1, recordId);
  if (rowIndex === -1) {
    return createJsonResponse({ success: false, message: "Record ID " + recordId + " tidak ditemukan pada " + sheetName });
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Perbarui setiap kolom yang diberikan
  headers.forEach((colName, colIdx) => {
    if (updatedFields.hasOwnProperty(colName)) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(updatedFields[colName]);
    }
  });

  return createJsonResponse({
    success: true,
    message: "Record " + recordId + " pada sheet " + sheetName + " berhasil diperbarui oleh Admin."
  });
}

/**
 * Hapus Record Transaksi Sub-Menu 1 sampai 4 oleh Admin
 * Membutuhkan password admin: "dead4left"
 */
function handleDeleteRecord(data) {
  if (!validateAdminAuth(data)) {
    return createJsonResponse({ success: false, message: "Otentikasi Admin Gagal! Aksi hapus ditolak." });
  }

  const sheetName = data.sheetName;
  const recordId = data.recordId || data.id;

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return createJsonResponse({ success: false, message: "Sheet " + sheetName + " tidak ditemukan." });
  }

  const rowIndex = findRowIndexById(sheet, 1, recordId);
  if (rowIndex === -1) {
    return createJsonResponse({ success: false, message: "Record ID " + recordId + " tidak ditemukan." });
  }

  sheet.deleteRow(rowIndex);
  return createJsonResponse({
    success: true,
    message: "Record ID " + recordId + " pada " + sheetName + " berhasil dihapus permanen oleh Admin."
  });
}

/**
 * Menambahkan atau memperbarui "Catatan Khusus Admin" pada record transaksi 1-4
 * Membutuhkan password admin: "dead4left"
 */
function handleUpdateAdminNote(data) {
  if (!validateAdminAuth(data)) {
    return createJsonResponse({ success: false, message: "Otentikasi Admin Gagal! Penambahan catatan ditolak." });
  }

  const sheetName = data.sheetName;
  const recordId = data.recordId || data.id;
  const adminNote = data.adminNote || data.catatanAdmin || "";

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return createJsonResponse({ success: false, message: "Sheet tidak ditemukan: " + sheetName });
  }

  const rowIndex = findRowIndexById(sheet, 1, recordId);
  if (rowIndex === -1) {
    return createJsonResponse({ success: false, message: "Record " + recordId + " tidak ditemukan." });
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const adminColIndex = headers.indexOf("Catatan_Khusus_Admin");

  if (adminColIndex === -1) {
    // Tambahkan header jika belum ada
    const newCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, newCol).setValue("Catatan_Khusus_Admin");
    sheet.getRange(rowIndex, newCol).setValue(adminNote);
  } else {
    sheet.getRange(rowIndex, adminColIndex + 1).setValue(adminNote);
  }

  return createJsonResponse({
    success: true,
    message: "Catatan Khusus Admin untuk record " + recordId + " berhasil disimpan.",
    data: { id: recordId, catatanKhususAdmin: adminNote }
  });
}

// ==========================================
// 9. HELPER & UTILITIES
// ==========================================

/**
 * Helper mengubah sheet menjadi array of object (JSON) berdasarkan baris header
 */
function getRowsAsObjects(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  const result = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (val instanceof Date) {
        val = formatDate(val);
      }
      obj[h] = val;
    });
    result.push(obj);
  }
  return result;
}

/**
 * Mencari nomor baris (1-indexed) berdasarkan kecocokan ID pada kolom tertentu
 */
function findRowIndexById(sheet, colIndex, targetId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  const values = sheet.getRange(1, colIndex, lastRow, 1).getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(targetId).trim()) {
      return i + 1; // 1-indexed row number
    }
  }
  return -1;
}

/**
 * Generate ID unik dengan prefix dan timestamp
 */
function generateId(prefix) {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return prefix + "-" + Date.now().toString().slice(-6) + "-" + rand;
}

/**
 * Format tanggal ke format YYYY-MM-DD
 */
function formatDate(d) {
  if (!(d instanceof Date)) d = new Date(d);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/**
 * Format tanggal dan waktu ke format YYYY-MM-DD HH:mm:ss
 */
function formatDateTime(d) {
  if (!(d instanceof Date)) d = new Date(d);
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return dateStr + " " + hours + ":" + minutes + ":" + seconds;
}

/**
 * Menghasilkan respon HTTP JSON dengan header CORS yang tepat
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
