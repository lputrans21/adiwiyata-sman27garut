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
  Satuan: 'Liter' | 'Kilogram' | 'Pcs' | 'Jumlah Barang' | string;
  Jumlah: number;
  Petugas: string;
  Catatan: string;
  Catatan_Khusus_Admin?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'absensi-umum'
  | 'absensi-sub'
  | 'timbangan'
  | 'produk'
  | 'admin'
  | 'script-hub';

export type ReportPeriod = 'harian' | 'mingguan' | 'bulanan';
