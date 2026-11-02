import {
  MasterPegawai,
  AbsensiUmumRecord,
  AbsensiSubBidangRecord,
  TimbanganSampahRecord,
  ProdukHasilRecord
} from '../types';
import {
  INITIAL_PEGAWAI,
  INITIAL_ABSENSI_UMUM,
  INITIAL_ABSENSI_SUB,
  INITIAL_TIMBANGAN,
  INITIAL_PRODUK
} from '../data/initialData';
import {
  ADMIN_PASSWORD,
  generateRecordId,
  formatDate,
  formatDateTime
} from '../utils/adiwiyataLogic';

const STORAGE_KEYS = {
  PEGAWAI: 'adiwiyata_sman27_pegawai',
  ABSENSI_UMUM: 'adiwiyata_sman27_absensi_umum',
  ABSENSI_SUB: 'adiwiyata_sman27_absensi_sub',
  TIMBANGAN: 'adiwiyata_sman27_timbangan',
  PRODUK: 'adiwiyata_sman27_produk',
  API_URL: 'adiwiyata_sman27_gas_url',
  USE_LIVE_API: 'adiwiyata_sman27_use_live_api'
};

export class DataService {
  private static getStored<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse localStorage for key:', key, e);
    }
    return fallback;
  }

  private static setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  // --- Configuration ---
  static getApiUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.API_URL) || '';
  }

  static setApiUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.API_URL, url.trim());
  }

  static isLiveApiEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.USE_LIVE_API) === 'true';
  }

  static setLiveApiEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.USE_LIVE_API, enabled ? 'true' : 'false');
  }

  // --- Master Pegawai ---
  static getMasterPegawai(): MasterPegawai[] {
    return this.getStored<MasterPegawai[]>(STORAGE_KEYS.PEGAWAI, INITIAL_PEGAWAI);
  }

  static setMasterPegawai(list: MasterPegawai[]): void {
    this.setStored(STORAGE_KEYS.PEGAWAI, list);
  }

  static managePegawai(
    subAction: 'add' | 'edit' | 'delete',
    payload: { idPegawai?: string; namaPegawai?: string; adminPassword?: string }
  ): { success: boolean; message: string; data?: MasterPegawai } {
    if (payload.adminPassword !== ADMIN_PASSWORD) {
      return { success: false, message: 'Password Admin tidak valid!' };
    }

    const current = this.getMasterPegawai();

    if (subAction === 'add') {
      const id = payload.idPegawai || `PEG-${String(current.length + 1).padStart(3, '0')}`;
      const name = (payload.namaPegawai || '').trim();
      if (!name) return { success: false, message: 'Nama pegawai tidak boleh kosong!' };

      const newPegawai: MasterPegawai = { ID_Pegawai: id, Nama_Pegawai: name };
      const updated = [...current, newPegawai];
      this.setMasterPegawai(updated);
      return { success: true, message: `Pegawai ${name} (${id}) berhasil ditambahkan.`, data: newPegawai };
    }

    if (subAction === 'edit') {
      const id = payload.idPegawai;
      const name = (payload.namaPegawai || '').trim();
      const idx = current.findIndex(p => p.ID_Pegawai === id);
      if (idx === -1) return { success: false, message: `Pegawai ID ${id} tidak ditemukan!` };

      current[idx].Nama_Pegawai = name;
      this.setMasterPegawai([...current]);
      return { success: true, message: `Data Pegawai ID ${id} berhasil diperbarui.` };
    }

    if (subAction === 'delete') {
      const id = payload.idPegawai;
      const updated = current.filter(p => p.ID_Pegawai !== id);
      if (updated.length === current.length) {
        return { success: false, message: `Pegawai ID ${id} tidak ditemukan!` };
      }
      this.setMasterPegawai(updated);
      return { success: true, message: `Pegawai ID ${id} berhasil dihapus.` };
    }

    return { success: false, message: 'Aksi tidak dikenal.' };
  }

  // --- Sub-Menu 1: Absensi Umum ---
  static getAbsensiUmum(): AbsensiUmumRecord[] {
    return this.getStored<AbsensiUmumRecord[]>(STORAGE_KEYS.ABSENSI_UMUM, INITIAL_ABSENSI_UMUM);
  }

  static createAbsensiUmum(payload: {
    namaPegawai: string;
    statusKehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
    catatan?: string;
    date?: string;
  }): AbsensiUmumRecord {
    const list = this.getAbsensiUmum();
    const newRecord: AbsensiUmumRecord = {
      ID: generateRecordId('ABS-UMUM'),
      Timestamp: formatDateTime(),
      Date: payload.date || formatDate(new Date()),
      Nama_Pegawai: payload.namaPegawai,
      Status_Kehadiran: payload.statusKehadiran,
      Catatan: payload.catatan || '-',
      Catatan_Khusus_Admin: ''
    };
    const updated = [newRecord, ...list];
    this.setStored(STORAGE_KEYS.ABSENSI_UMUM, updated);
    return newRecord;
  }

  // --- Sub-Menu 2: Absensi Sub-Bidang ---
  static getAbsensiSub(): AbsensiSubBidangRecord[] {
    return this.getStored<AbsensiSubBidangRecord[]>(STORAGE_KEYS.ABSENSI_SUB, INITIAL_ABSENSI_SUB);
  }

  static createAbsensiSub(payload: {
    namaPegawai: string;
    bidang: 'Pengumpulan Sampah Botol' | 'Plastik Halus' | 'Organik';
    status?: string;
    catatan?: string;
    date?: string;
  }): AbsensiSubBidangRecord {
    const list = this.getAbsensiSub();
    const newRecord: AbsensiSubBidangRecord = {
      ID: generateRecordId('ABS-SUB'),
      Timestamp: formatDateTime(),
      Date: payload.date || formatDate(new Date()),
      Nama_Pegawai: payload.namaPegawai,
      Bidang: payload.bidang,
      Status: payload.status || 'Aktif',
      Catatan: payload.catatan || '-',
      Catatan_Khusus_Admin: ''
    };
    const updated = [newRecord, ...list];
    this.setStored(STORAGE_KEYS.ABSENSI_SUB, updated);
    return newRecord;
  }

  // --- Sub-Menu 3: Timbangan Sampah ---
  static getTimbangan(): TimbanganSampahRecord[] {
    return this.getStored<TimbanganSampahRecord[]>(STORAGE_KEYS.TIMBANGAN, INITIAL_TIMBANGAN);
  }

  static createTimbangan(payload: {
    jenisSampah: 'Botol' | 'Plastik Halus' | 'Organik' | string;
    beratKg: number;
    petugas: string;
    catatan?: string;
    date?: string;
  }): TimbanganSampahRecord {
    const list = this.getTimbangan();
    const newRecord: TimbanganSampahRecord = {
      ID: generateRecordId('TMB'),
      Timestamp: formatDateTime(),
      Date: payload.date || formatDate(new Date()),
      Jenis_Sampah: payload.jenisSampah,
      Berat_KG: Number(payload.beratKg),
      Petugas: payload.petugas,
      Catatan: payload.catatan || '-',
      Catatan_Khusus_Admin: ''
    };
    const updated = [newRecord, ...list];
    this.setStored(STORAGE_KEYS.TIMBANGAN, updated);
    return newRecord;
  }

  // --- Sub-Menu 4: Produk Hasil ---
  static getProduk(): ProdukHasilRecord[] {
    return this.getStored<ProdukHasilRecord[]>(STORAGE_KEYS.PRODUK, INITIAL_PRODUK);
  }

  static createProduk(payload: {
    jenisProduk: 'Air lindi' | 'Pupuk Kompos' | 'Barang Daur Ulang' | string;
    satuan: 'Liter' | 'Kilogram' | 'Jumlah Barang' | string;
    jumlah: number;
    petugas: string;
    catatan?: string;
    date?: string;
  }): ProdukHasilRecord {
    const list = this.getProduk();
    const newRecord: ProdukHasilRecord = {
      ID: generateRecordId('PRD'),
      Timestamp: formatDateTime(),
      Date: payload.date || formatDate(new Date()),
      Jenis_Produk: payload.jenisProduk,
      Satuan: payload.satuan,
      Jumlah: Number(payload.jumlah),
      Petugas: payload.petugas,
      Catatan: payload.catatan || '-',
      Catatan_Khusus_Admin: ''
    };
    const updated = [newRecord, ...list];
    this.setStored(STORAGE_KEYS.PRODUK, updated);
    return newRecord;
  }

  // --- Admin Operations ---
  static updateRecord(
    sheetName: 'Absensi_Umum' | 'Absensi_SubBidang' | 'Timbangan_Sampah' | 'Produk_Hasil',
    recordId: string,
    updatedFields: Record<string, any>,
    adminPassword: string
  ): { success: boolean; message: string } {
    if (adminPassword !== ADMIN_PASSWORD) {
      return { success: false, message: 'Password Admin tidak valid!' };
    }

    if (sheetName === 'Absensi_Umum') {
      const records = this.getAbsensiUmum();
      const idx = records.findIndex(r => r.ID === recordId);
      if (idx === -1) return { success: false, message: 'Record tidak ditemukan.' };
      records[idx] = { ...records[idx], ...updatedFields };
      this.setStored(STORAGE_KEYS.ABSENSI_UMUM, records);
      return { success: true, message: `Record ${recordId} berhasil diperbarui.` };
    }

    if (sheetName === 'Absensi_SubBidang') {
      const records = this.getAbsensiSub();
      const idx = records.findIndex(r => r.ID === recordId);
      if (idx === -1) return { success: false, message: 'Record tidak ditemukan.' };
      records[idx] = { ...records[idx], ...updatedFields };
      this.setStored(STORAGE_KEYS.ABSENSI_SUB, records);
      return { success: true, message: `Record ${recordId} berhasil diperbarui.` };
    }

    if (sheetName === 'Timbangan_Sampah') {
      const records = this.getTimbangan();
      const idx = records.findIndex(r => r.ID === recordId);
      if (idx === -1) return { success: false, message: 'Record tidak ditemukan.' };
      records[idx] = { ...records[idx], ...updatedFields };
      this.setStored(STORAGE_KEYS.TIMBANGAN, records);
      return { success: true, message: `Record ${recordId} berhasil diperbarui.` };
    }

    if (sheetName === 'Produk_Hasil') {
      const records = this.getProduk();
      const idx = records.findIndex(r => r.ID === recordId);
      if (idx === -1) return { success: false, message: 'Record tidak ditemukan.' };
      records[idx] = { ...records[idx], ...updatedFields };
      this.setStored(STORAGE_KEYS.PRODUK, records);
      return { success: true, message: `Record ${recordId} berhasil diperbarui.` };
    }

    return { success: false, message: 'Nama sheet tidak valid.' };
  }

  static deleteRecord(
    sheetName: 'Absensi_Umum' | 'Absensi_SubBidang' | 'Timbangan_Sampah' | 'Produk_Hasil',
    recordId: string,
    adminPassword: string
  ): { success: boolean; message: string } {
    if (adminPassword !== ADMIN_PASSWORD) {
      return { success: false, message: 'Password Admin tidak valid!' };
    }

    if (sheetName === 'Absensi_Umum') {
      const records = this.getAbsensiUmum().filter(r => r.ID !== recordId);
      this.setStored(STORAGE_KEYS.ABSENSI_UMUM, records);
      return { success: true, message: `Record ${recordId} berhasil dihapus.` };
    }

    if (sheetName === 'Absensi_SubBidang') {
      const records = this.getAbsensiSub().filter(r => r.ID !== recordId);
      this.setStored(STORAGE_KEYS.ABSENSI_SUB, records);
      return { success: true, message: `Record ${recordId} berhasil dihapus.` };
    }

    if (sheetName === 'Timbangan_Sampah') {
      const records = this.getTimbangan().filter(r => r.ID !== recordId);
      this.setStored(STORAGE_KEYS.TIMBANGAN, records);
      return { success: true, message: `Record ${recordId} berhasil dihapus.` };
    }

    if (sheetName === 'Produk_Hasil') {
      const records = this.getProduk().filter(r => r.ID !== recordId);
      this.setStored(STORAGE_KEYS.PRODUK, records);
      return { success: true, message: `Record ${recordId} berhasil dihapus.` };
    }

    return { success: false, message: 'Nama sheet tidak valid.' };
  }

  static updateAdminNote(
    sheetName: 'Absensi_Umum' | 'Absensi_SubBidang' | 'Timbangan_Sampah' | 'Produk_Hasil',
    recordId: string,
    adminNote: string,
    adminPassword: string
  ): { success: boolean; message: string } {
    return this.updateRecord(sheetName, recordId, { Catatan_Khusus_Admin: adminNote }, adminPassword);
  }

  // --- Reset to Demo Defaults ---
  static resetToDefaults(): void {
    this.setStored(STORAGE_KEYS.PEGAWAI, INITIAL_PEGAWAI);
    this.setStored(STORAGE_KEYS.ABSENSI_UMUM, INITIAL_ABSENSI_UMUM);
    this.setStored(STORAGE_KEYS.ABSENSI_SUB, INITIAL_ABSENSI_SUB);
    this.setStored(STORAGE_KEYS.TIMBANGAN, INITIAL_TIMBANGAN);
    this.setStored(STORAGE_KEYS.PRODUK, INITIAL_PRODUK);
  }

  // --- Export Sheet as CSV ---
  static exportToCSV(sheetName: 'Absensi_Umum' | 'Absensi_SubBidang' | 'Timbangan_Sampah' | 'Produk_Hasil' | 'Master_Pegawai'): void {
    let headers: string[] = [];
    let rows: any[] = [];

    switch (sheetName) {
      case 'Master_Pegawai':
        headers = ['ID_Pegawai', 'Nama_Pegawai'];
        rows = this.getMasterPegawai().map(p => [p.ID_Pegawai, `"${p.Nama_Pegawai}"`]);
        break;
      case 'Absensi_Umum':
        headers = ['ID', 'Timestamp', 'Date', 'Nama_Pegawai', 'Status_Kehadiran', 'Catatan', 'Catatan_Khusus_Admin'];
        rows = this.getAbsensiUmum().map(r => [
          r.ID, r.Timestamp, r.Date, `"${r.Nama_Pegawai}"`, r.Status_Kehadiran, `"${r.Catatan}"`, `"${r.Catatan_Khusus_Admin || ''}"`
        ]);
        break;
      case 'Absensi_SubBidang':
        headers = ['ID', 'Timestamp', 'Date', 'Nama_Pegawai', 'Bidang', 'Status', 'Catatan', 'Catatan_Khusus_Admin'];
        rows = this.getAbsensiSub().map(r => [
          r.ID, r.Timestamp, r.Date, `"${r.Nama_Pegawai}"`, `"${r.Bidang}"`, r.Status, `"${r.Catatan}"`, `"${r.Catatan_Khusus_Admin || ''}"`
        ]);
        break;
      case 'Timbangan_Sampah':
        headers = ['ID', 'Timestamp', 'Date', 'Jenis_Sampah', 'Berat_KG', 'Petugas', 'Catatan', 'Catatan_Khusus_Admin'];
        rows = this.getTimbangan().map(r => [
          r.ID, r.Timestamp, r.Date, `"${r.Jenis_Sampah}"`, r.Berat_KG, `"${r.Petugas}"`, `"${r.Catatan}"`, `"${r.Catatan_Khusus_Admin || ''}"`
        ]);
        break;
      case 'Produk_Hasil':
        headers = ['ID', 'Timestamp', 'Date', 'Jenis_Produk', 'Satuan', 'Jumlah', 'Petugas', 'Catatan', 'Catatan_Khusus_Admin'];
        rows = this.getProduk().map(r => [
          r.ID, r.Timestamp, r.Date, `"${r.Jenis_Produk}"`, `"${r.Satuan}"`, r.Jumlah, `"${r.Petugas}"`, `"${r.Catatan}"`, `"${r.Catatan_Khusus_Admin || ''}"`
        ]);
        break;
    }

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${sheetName}_SMAN27GARUT_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
