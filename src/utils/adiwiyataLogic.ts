/**
 * Pure logic and utility functions for Adiwiyata SMAN 27 Garut Waste Management
 */

export const ADMIN_PASSWORD = "dead4left";

export interface MasterPegawai {
  ID_Pegawai: string;
  Nama_Pegawai: string;
}

export interface AbsensiUmumRecord {
  ID: string;
  Timestamp: string;
  Date: string;
  Nama_Pegawai: string;
  Status_Kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  Catatan: string;
  Catatan_Khusus_Admin?: string;
}

export interface AbsensiSubBidangRecord {
  ID: string;
  Timestamp: string;
  Date: string;
  Nama_Pegawai: string;
  Bidang: 'Pengumpulan Sampah Botol' | 'Plastik Halus' | 'Organik';
  Status: string;
  Catatan: string;
  Catatan_Khusus_Admin?: string;
}

export interface TimbanganSampahRecord {
  ID: string;
  Timestamp: string;
  Date: string;
  Jenis_Sampah: 'Botol' | 'Plastik Halus' | 'Organik' | string;
  Berat_KG: number;
  Petugas: string;
  Catatan: string;
  Catatan_Khusus_Admin?: string;
}

export interface ProdukHasilRecord {
  ID: string;
  Timestamp: string;
  Date: string;
  Jenis_Produk: 'Air lindi' | 'Pupuk Kompos' | 'Barang Daur Ulang' | string;
  Satuan: 'Liter' | 'Kilogram' | 'Jumlah Barang' | string;
  Jumlah: number;
  Petugas: string;
  Catatan: string;
  Catatan_Khusus_Admin?: string;
}

/**
 * Verifikasi password Admin
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD;
}

/**
 * Format tanggal YYYY-MM-DD
 */
export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format tanggal dan waktu YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(d: Date | string = new Date()): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const datePart = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${datePart} ${hours}:${minutes}:${seconds}`;
}

/**
 * Filter data berdasarkan periode: 'harian', 'mingguan', atau 'bulanan'
 */
export function isDateWithinPeriod(
  recordDateStr: string,
  period: 'harian' | 'mingguan' | 'bulanan',
  referenceDate: Date = new Date()
): boolean {
  if (!recordDateStr) return false;
  const d = new Date(recordDateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return false;

  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  if (period === 'harian') {
    return (
      d.getFullYear() === ref.getFullYear() &&
      d.getMonth() === ref.getMonth() &&
      d.getDate() === ref.getDate()
    );
  } else if (period === 'mingguan') {
    const diffTime = ref.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  } else if (period === 'bulanan') {
    return (
      d.getFullYear() === ref.getFullYear() &&
      d.getMonth() === ref.getMonth()
    );
  }

  return true;
}

/**
 * Agregasi timbangan sampah
 */
export function calculateTimbanganSummary(records: TimbanganSampahRecord[]) {
  let totalKg = 0;
  const breakdown: Record<string, number> = {
    Botol: 0,
    'Plastik Halus': 0,
    Organik: 0,
    Lainnya: 0
  };

  records.forEach(r => {
    const weight = Number(r.Berat_KG) || 0;
    totalKg += weight;
    if (breakdown[r.Jenis_Sampah] !== undefined) {
      breakdown[r.Jenis_Sampah] += weight;
    } else {
      breakdown.Lainnya += weight;
    }
  });

  return {
    totalKg: Math.round(totalKg * 100) / 100,
    breakdown,
    count: records.length
  };
}

/**
 * Agregasi produk hasil
 */
export function calculateProdukSummary(records: ProdukHasilRecord[]) {
  const summary: Record<string, { jumlah: number; satuan: string }> = {
    'Air lindi': { jumlah: 0, satuan: 'Liter' },
    'Pupuk Kompos': { jumlah: 0, satuan: 'Kilogram' },
    'Barang Daur Ulang': { jumlah: 0, satuan: 'Jumlah Barang' }
  };

  records.forEach(r => {
    const jml = Number(r.Jumlah) || 0;
    const jenis = r.Jenis_Produk;
    if (summary[jenis]) {
      summary[jenis].jumlah += jml;
    } else {
      summary[jenis] = { jumlah: jml, satuan: r.Satuan || 'Satuan' };
    }
  });

  return {
    summary,
    totalRecords: records.length
  };
}

/**
 * Agregasi status kehadiran
 */
export function calculateKehadiranSummary(records: AbsensiUmumRecord[]) {
  const statusCounts = {
    Hadir: 0,
    Izin: 0,
    Sakit: 0,
    Alpa: 0
  };

  records.forEach(r => {
    const status = r.Status_Kehadiran;
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    } else {
      statusCounts.Hadir++;
    }
  });

  return statusCounts;
}

/**
 * Generate Unique ID
 */
export function generateRecordId(prefix: string): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${Date.now().toString().slice(-6)}-${rand}`;
}
