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

  static DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwCovXVDhvC05ppLUfnfHYsLs7wC070aNVXdF8to8mpKQHLvTUUdLyzlpLdI5ey2aI/exec';

  // --- Configuration ---
  static getApiUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.API_URL) || this.DEFAULT_GAS_URL;
  }

  static setApiUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.API_URL, url.trim());
  }

  static isLiveApiEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.USE_LIVE_API) !== 'false';
  }

  static setLiveApiEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.USE_LIVE_API, enabled ? 'true' : 'false');
  }

  // --- Remote Google Apps Script Communication ---
  static async sendRemote(action: string, payload: any = {}): Promise<any> {
    const url = this.getApiUrl();
    if (!url) return null;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action,
          timestamp: new Date().toISOString(),
          ...payload
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(`[DataService] Gagal sinkronisasi remote (${action}):`, e);
    }
    return null;
  }

  static cleanLegacyMockData(): void {
    try {
      const storedPegawai = localStorage.getItem(STORAGE_KEYS.PEGAWAI);
      if (storedPegawai && (storedPegawai.includes('Lucy Ega') || storedPegawai.includes('Asep Sunandar'))) {
        localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(INITIAL_PEGAWAI));
      }

      // Check for legacy mock transaction data
      const storedTimbangan = localStorage.getItem(STORAGE_KEYS.TIMBANGAN);
      if (storedTimbangan && (storedTimbangan.includes('TMB-3001') || storedTimbangan.includes('Asep Sunandar'))) {
        localStorage.setItem(STORAGE_KEYS.TIMBANGAN, JSON.stringify([]));
      }

      const storedAbsensiUmum = localStorage.getItem(STORAGE_KEYS.ABSENSI_UMUM);
      if (storedAbsensiUmum && (storedAbsensiUmum.includes('ABS-UMUM-1001') || storedAbsensiUmum.includes('Lucy Ega'))) {
        localStorage.setItem(STORAGE_KEYS.ABSENSI_UMUM, JSON.stringify([]));
      }

      const storedAbsensiSub = localStorage.getItem(STORAGE_KEYS.ABSENSI_SUB);
      if (storedAbsensiSub && (storedAbsensiSub.includes('ABS-SUB-2001') || storedAbsensiSub.includes('Dewi Sartika'))) {
        localStorage.setItem(STORAGE_KEYS.ABSENSI_SUB, JSON.stringify([]));
      }

      const storedProduk = localStorage.getItem(STORAGE_KEYS.PRODUK);
      if (storedProduk && (storedProduk.includes('PRD-4001') || storedProduk.includes('Air lindi'))) {
        localStorage.setItem(STORAGE_KEYS.PRODUK, JSON.stringify([]));
      }
    } catch (e) {
      console.warn('Error cleaning legacy mock data:', e);
    }
  }

  static async syncFromRemote(): Promise<{ success: boolean; message: string; count?: number }> {
    const url = this.getApiUrl();
    if (!url) return { success: false, message: 'URL Google Apps Script belum diset' };
    try {
      const res = await fetch(`${url}?action=getAllData`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          if (Array.isArray(data.masterPegawai) && data.masterPegawai.length > 0) {
            // Verify if masterPegawai from remote doesn't have old mock names
            const hasLegacyNames = data.masterPegawai.some((p: any) =>
              p.Nama_Pegawai?.includes('Lucy Ega') || p.Nama_Pegawai?.includes('Asep Sunandar')
            );
            if (!hasLegacyNames) {
              this.setMasterPegawai(data.masterPegawai);
            } else {
              this.setMasterPegawai(INITIAL_PEGAWAI);
            }
          }

          if (Array.isArray(data.absensiUmum)) {
            const cleanAbsensiUmum = data.absensiUmum
              .filter((r: any) => {
                const name = String(r.Nama_Pegawai || '');
                return !name.includes('Lucy Ega') && !name.includes('Asep Sunandar') && r.ID !== 'ABS-UMUM-1001';
              })
              .map((r: any) => ({
                ID: r.ID || r.Timestamp || generateRecordId('ABS-UMUM'),
                Timestamp: String(r.Timestamp || ''),
                Date: String(r.Date || ''),
                Nama_Pegawai: String(r.Nama_Pegawai || ''),
                Status_Kehadiran: r.Status_Kehadiran || 'Hadir',
                Catatan: String(r.Catatan || '-'),
                Catatan_Khusus_Admin: String(r.Catatan_Khusus_Admin || r.Catatan_Admin || '')
              }));
            this.setStored(STORAGE_KEYS.ABSENSI_UMUM, cleanAbsensiUmum);
          }

          if (Array.isArray(data.absensiSubBidang)) {
            const cleanAbsensiSub = data.absensiSubBidang
              .filter((r: any) => {
                const name = String(r.Nama_Pegawai || '');
                return !name.includes('Lucy Ega') && !name.includes('Asep Sunandar') && r.ID !== 'ABS-SUB-2001';
              })
              .map((r: any) => ({
                ID: r.ID || r.Timestamp || generateRecordId('ABS-SUB'),
                Timestamp: String(r.Timestamp || ''),
                Date: String(r.Date || ''),
                Nama_Pegawai: String(r.Nama_Pegawai || ''),
                Bidang: r.Bidang || 'Organik',
                Status: String(r.Status || 'Aktif'),
                Catatan: String(r.Catatan || '-'),
                Catatan_Khusus_Admin: String(r.Catatan_Khusus_Admin || r.Catatan_Admin || '')
              }));
            this.setStored(STORAGE_KEYS.ABSENSI_SUB, cleanAbsensiSub);
          }

          if (Array.isArray(data.timbanganSampah)) {
            const cleanTimbangan = data.timbanganSampah
              .filter((r: any) => {
                const pet = String(r.Petugas || '');
                const js = String(r.Jenis_Sampah || '');
                const dt = String(r.Date || '');
                // Filter out mock names or shifted rows
                return !pet.includes('Asep Sunandar') && r.ID !== 'TMB-3001' && js !== dt;
              })
              .map((r: any) => ({
                ID: r.ID || r.Timestamp || generateRecordId('TMB'),
                Timestamp: String(r.Timestamp || ''),
                Date: String(r.Date || ''),
                Jenis_Sampah: String(r.Jenis_Sampah || 'Organik'),
                Berat_KG: Number(r.Berat_KG) || 0,
                Petugas: String(r.Petugas || '-'),
                Catatan: String(r.Catatan || '-'),
                Catatan_Khusus_Admin: String(r.Catatan_Khusus_Admin || r.Catatan_Admin || '')
              }));
            this.setStored(STORAGE_KEYS.TIMBANGAN, cleanTimbangan);
          }

          if (Array.isArray(data.produkHasil)) {
            const cleanProduk = data.produkHasil
              .filter((r: any) => {
                const pet = String(r.Petugas || '');
                return !pet.includes('Asep Sunandar') && r.ID !== 'PRD-4001';
              })
              .map((r: any) => ({
                ID: r.ID || r.Timestamp || generateRecordId('PRD'),
                Timestamp: String(r.Timestamp || ''),
                Date: String(r.Date || ''),
                Jenis_Produk: String(r.Jenis_Produk || 'Pupuk Kompos'),
                Satuan: String(r.Satuan || 'Kilogram'),
                Jumlah: Number(r.Jumlah) || 0,
                Petugas: String(r.Petugas || '-'),
                Catatan: String(r.Catatan || '-'),
                Catatan_Khusus_Admin: String(r.Catatan_Khusus_Admin || r.Catatan_Admin || '')
              }));
            this.setStored(STORAGE_KEYS.PRODUK, cleanProduk);
          }

          return {
            success: true,
            message: `Tersinkronisasi dengan Spreadsheet Google Sheets! (${data.masterPegawai?.length || 0} Pegawai)`,
            count: data.masterPegawai?.length || 0
          };
        }
      }
    } catch (e: any) {
      console.warn('[DataService] Sync error:', e);
      return { success: false, message: e.message || 'Gagal tersambung ke Google Apps Script' };
    }
    return { success: false, message: 'Format respons tidak valid' };
  }



  // --- Master Pegawai ---
  static getMasterPegawai(): MasterPegawai[] {
    const list = this.getStored<MasterPegawai[]>(STORAGE_KEYS.PEGAWAI, INITIAL_PEGAWAI);
    if (!Array.isArray(list) || list.length === 0 || list.some(p => p.Nama_Pegawai?.includes('Lucy Ega') || p.Nama_Pegawai?.includes('Asep Sunandar'))) {
      this.setMasterPegawai(INITIAL_PEGAWAI);
      return INITIAL_PEGAWAI;
    }
    return list;
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
      const id = payload.idPegawai || `PGW-${String(current.length + 1).padStart(3, '0')}`;
      const name = (payload.namaPegawai || '').trim();
      if (!name) return { success: false, message: 'Nama pegawai tidak boleh kosong!' };

      const newPegawai: MasterPegawai = { ID_Pegawai: id, Nama_Pegawai: name };
      const updated = [...current, newPegawai];
      this.setMasterPegawai(updated);
      this.sendRemote('managePegawai', {
        subAction: 'add',
        namaPegawai: name,
        idPegawai: id,
        adminPassword: payload.adminPassword
      });
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
      this.sendRemote('managePegawai', {
        subAction: 'delete',
        idPegawai: id,
        adminPassword: payload.adminPassword
      });
      return { success: true, message: `Pegawai ID ${id} berhasil dihapus.` };
    }

    return { success: false, message: 'Aksi tidak dikenal.' };
  }

  // --- Sub-Menu 1: Absensi Umum ---
  static getAbsensiUmum(): AbsensiUmumRecord[] {
    const list = this.getStored<AbsensiUmumRecord[]>(STORAGE_KEYS.ABSENSI_UMUM, INITIAL_ABSENSI_UMUM);
    if (!Array.isArray(list) || list.some(r => r.ID === 'ABS-UMUM-1001' || String(r.Nama_Pegawai || '').includes('Lucy Ega') || String(r.Nama_Pegawai || '').includes('Asep Sunandar'))) {
      this.setStored(STORAGE_KEYS.ABSENSI_UMUM, []);
      return [];
    }
    return list;
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

    // Kirim sinkronisasi remote ke Google Sheets via Apps Script
    this.sendRemote('createAbsensiUmum', {
      namaPegawai: payload.namaPegawai,
      statusKehadiran: payload.statusKehadiran,
      catatan: payload.catatan || '-',
      date: newRecord.Date
    });

    return newRecord;
  }

  // --- Sub-Menu 2: Absensi Sub-Bidang ---
  static getAbsensiSub(): AbsensiSubBidangRecord[] {
    const list = this.getStored<AbsensiSubBidangRecord[]>(STORAGE_KEYS.ABSENSI_SUB, INITIAL_ABSENSI_SUB);
    if (!Array.isArray(list) || list.some(r => r.ID === 'ABS-SUB-2001' || String(r.Nama_Pegawai || '').includes('Asep Sunandar'))) {
      this.setStored(STORAGE_KEYS.ABSENSI_SUB, []);
      return [];
    }
    return list;
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

    // Kirim sinkronisasi remote ke Google Sheets via Apps Script
    this.sendRemote('createAbsensiSubBidang', {
      namaPegawai: payload.namaPegawai,
      bidang: payload.bidang,
      status: payload.status || 'Aktif',
      catatan: payload.catatan || '-',
      date: newRecord.Date
    });

    return newRecord;
  }

  // --- Sub-Menu 3: Timbangan Sampah ---
  static getTimbangan(): TimbanganSampahRecord[] {
    const list = this.getStored<TimbanganSampahRecord[]>(STORAGE_KEYS.TIMBANGAN, INITIAL_TIMBANGAN);
    if (!Array.isArray(list) || list.some(r => r.ID === 'TMB-3001' || String(r.Petugas || '').includes('Asep Sunandar') || String(r.Jenis_Sampah || '') === String(r.Date || ''))) {
      this.setStored(STORAGE_KEYS.TIMBANGAN, []);
      return [];
    }
    return list;
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

    // Kirim sinkronisasi remote ke Google Sheets via Apps Script
    this.sendRemote('createTimbanganSampah', {
      jenisSampah: payload.jenisSampah,
      beratKg: Number(payload.beratKg),
      petugas: payload.petugas,
      catatan: payload.catatan || '-',
      date: newRecord.Date
    });

    return newRecord;
  }

  // --- Sub-Menu 4: Produk Hasil ---
  static getProduk(): ProdukHasilRecord[] {
    const list = this.getStored<ProdukHasilRecord[]>(STORAGE_KEYS.PRODUK, INITIAL_PRODUK);
    if (!Array.isArray(list) || list.some(r => r.ID === 'PRD-4001' || String(r.Petugas || '').includes('Asep Sunandar'))) {
      this.setStored(STORAGE_KEYS.PRODUK, []);
      return [];
    }
    return list;
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

    // Kirim sinkronisasi remote ke Google Sheets via Apps Script
    this.sendRemote('createProdukHasil', {
      jenisProduk: payload.jenisProduk,
      satuan: payload.satuan,
      jumlah: Number(payload.jumlah),
      petugas: payload.petugas,
      catatan: payload.catatan || '-',
      date: newRecord.Date
    });

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
      this.sendRemote('updateRecord', { sheetName, recordId, fields: updatedFields, adminPassword });
      return { success: true, message: `Record ${recordId} berhasil diperbarui.` };
    }

    if (sheetName === 'Absensi_SubBidang') {
      const records = this.getAbsensiSub();
      const idx = records.findIndex(r => r.ID === recordId);
      if (idx === -1) return { success: false, message: 'Record tidak ditemukan.' };
      records[idx] = { ...records[idx], ...updatedFields };
      this.setStored(STORAGE_KEYS.ABSENSI_SUB, records);
      this.sendRemote('updateRecord', { sheetName, recordId, fields: updatedFields, adminPassword });
      return { success: true, message: `Record ${recordId} berhasil diperbarui.` };
    }

    if (sheetName === 'Timbangan_Sampah') {
      const records = this.getTimbangan();
      const idx = records.findIndex(r => r.ID === recordId);
      if (idx === -1) return { success: false, message: 'Record tidak ditemukan.' };
      records[idx] = { ...records[idx], ...updatedFields };
      this.setStored(STORAGE_KEYS.TIMBANGAN, records);
      this.sendRemote('updateRecord', { sheetName, recordId, fields: updatedFields, adminPassword });
      return { success: true, message: `Record ${recordId} berhasil diperbarui.` };
    }

    if (sheetName === 'Produk_Hasil') {
      const records = this.getProduk();
      const idx = records.findIndex(r => r.ID === recordId);
      if (idx === -1) return { success: false, message: 'Record tidak ditemukan.' };
      records[idx] = { ...records[idx], ...updatedFields };
      this.setStored(STORAGE_KEYS.PRODUK, records);
      this.sendRemote('updateRecord', { sheetName, recordId, fields: updatedFields, adminPassword });
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
      this.sendRemote('deleteRecord', { sheetName, recordId, adminPassword });
      return { success: true, message: `Record ${recordId} berhasil dihapus.` };
    }

    if (sheetName === 'Absensi_SubBidang') {
      const records = this.getAbsensiSub().filter(r => r.ID !== recordId);
      this.setStored(STORAGE_KEYS.ABSENSI_SUB, records);
      this.sendRemote('deleteRecord', { sheetName, recordId, adminPassword });
      return { success: true, message: `Record ${recordId} berhasil dihapus.` };
    }

    if (sheetName === 'Timbangan_Sampah') {
      const records = this.getTimbangan().filter(r => r.ID !== recordId);
      this.setStored(STORAGE_KEYS.TIMBANGAN, records);
      this.sendRemote('deleteRecord', { sheetName, recordId, adminPassword });
      return { success: true, message: `Record ${recordId} berhasil dihapus.` };
    }

    if (sheetName === 'Produk_Hasil') {
      const records = this.getProduk().filter(r => r.ID !== recordId);
      this.setStored(STORAGE_KEYS.PRODUK, records);
      this.sendRemote('deleteRecord', { sheetName, recordId, adminPassword });
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
    this.sendRemote('updateAdminNote', { sheetName, recordId, adminNote, adminPassword });
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
