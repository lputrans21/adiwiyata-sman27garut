import {
  MasterPegawai,
  AbsensiUmumRecord,
  AbsensiSubBidangRecord,
  TimbanganSampahRecord,
  ProdukHasilRecord
} from '../types';

export const INITIAL_PEGAWAI: MasterPegawai[] = [
  { ID_Pegawai: 'PGW-001', Nama_Pegawai: 'SAIRA AULIA' },
  { ID_Pegawai: 'PGW-002', Nama_Pegawai: 'GARSHELA PUTRI DERIS' },
  { ID_Pegawai: 'PGW-003', Nama_Pegawai: 'NAZWA DEANDRA KESHA AUNI' },
  { ID_Pegawai: 'PGW-004', Nama_Pegawai: 'VIKKA ALNABILLA' },
  { ID_Pegawai: 'PGW-005', Nama_Pegawai: 'FIKA RAHMA ARNIDA' },
  { ID_Pegawai: 'PGW-006', Nama_Pegawai: 'ZIRA ALMERA' },
  { ID_Pegawai: 'PGW-007', Nama_Pegawai: 'RAHMI MAULIDA' },
  { ID_Pegawai: 'PGW-008', Nama_Pegawai: 'DEWI RAHMA' },
  { ID_Pegawai: 'PGW-009', Nama_Pegawai: 'GARNISA NOVIYANTI' },
  { ID_Pegawai: 'PGW-010', Nama_Pegawai: 'LIA APRILIANI' },
  { ID_Pegawai: 'PGW-011', Nama_Pegawai: 'REVALINA AGUSTINA' },
  { ID_Pegawai: 'PGW-012', Nama_Pegawai: 'AMELIA KHUSUS KHOTIMAH' },
  { ID_Pegawai: 'PGW-013', Nama_Pegawai: 'MEIKA RAHMA WIDIANTI' },
  { ID_Pegawai: 'PGW-014', Nama_Pegawai: 'RIZKI RAMADHAN' },
  { ID_Pegawai: 'PGW-015', Nama_Pegawai: 'ALKHA PRAMUDYA' },
  { ID_Pegawai: 'PGW-016', Nama_Pegawai: 'DENISA FEBRIANTI' },
  { ID_Pegawai: 'PGW-017', Nama_Pegawai: 'AMIRA AMBAR RAMADHANI' },
  { ID_Pegawai: 'PGW-018', Nama_Pegawai: 'SISIL' },
  { ID_Pegawai: 'PGW-019', Nama_Pegawai: 'REFA CAHYANI' },
  { ID_Pegawai: 'PGW-020', Nama_Pegawai: 'METI PURNAMA SARI CAHYUNI' }
];

export const INITIAL_ABSENSI_UMUM: AbsensiUmumRecord[] = [
  {
    ID: 'ABS-UMUM-1001',
    Timestamp: '2026-11-02 07:15:20',
    Date: '2026-11-02',
    Nama_Pegawai: 'Drs. Lucy Ega Suganda',
    Status_Kehadiran: 'Hadir',
    Catatan: 'Koordinator briefing pagi Adiwiyata',
    Catatan_Khusus_Admin: 'Terverifikasi hadir memimpin apel tim sampah'
  },
  {
    ID: 'ABS-UMUM-1002',
    Timestamp: '2026-11-02 07:22:11',
    Date: '2026-11-02',
    Nama_Pegawai: 'Asep Sunandar, S.Pd',
    Status_Kehadiran: 'Hadir',
    Catatan: 'Piket area komposting timur',
    Catatan_Khusus_Admin: ''
  },
  {
    ID: 'ABS-UMUM-1003',
    Timestamp: '2026-11-02 07:30:45',
    Date: '2026-11-02',
    Nama_Pegawai: 'Rian Hidayat',
    Status_Kehadiran: 'Hadir',
    Catatan: 'Penimbangan sampah dari ruang kelas X',
    Catatan_Khusus_Admin: ''
  },
  {
    ID: 'ABS-UMUM-1004',
    Timestamp: '2026-11-02 08:00:00',
    Date: '2026-11-02',
    Nama_Pegawai: 'Dewi Sartika',
    Status_Kehadiran: 'Hadir',
    Catatan: 'Pemilahan daur ulang botol dan tutup botol',
    Catatan_Khusus_Admin: ''
  },
  {
    ID: 'ABS-UMUM-1005',
    Timestamp: '2026-11-02 08:05:00',
    Date: '2026-11-02',
    Nama_Pegawai: 'Siti Nurhaliza, M.Pd',
    Status_Kehadiran: 'Izin',
    Catatan: 'Dinas luar pendampingan lomba Adiwiyata Kabupaten',
    Catatan_Khusus_Admin: 'Surat tugas dinas terlampir'
  }
];

export const INITIAL_ABSENSI_SUB: AbsensiSubBidangRecord[] = [
  {
    ID: 'ABS-SUB-2001',
    Timestamp: '2026-11-02 07:45:00',
    Date: '2026-11-02',
    Nama_Pegawai: 'Dewi Sartika',
    Bidang: 'Pengumpulan Sampah Botol',
    Status: 'Aktif Bekerja',
    Catatan: 'Fokus pembersihan & pencopotan label botol PET',
    Catatan_Khusus_Admin: 'Progres pemilahan baik'
  },
  {
    ID: 'ABS-SUB-2002',
    Timestamp: '2026-11-02 07:50:00',
    Date: '2026-11-02',
    Nama_Pegawai: 'Rian Hidayat',
    Bidang: 'Plastik Halus',
    Status: 'Aktif Bekerja',
    Catatan: 'Pengumpulan plastik kantong dari kantin sehat',
    Catatan_Khusus_Admin: ''
  },
  {
    ID: 'ABS-SUB-2003',
    Timestamp: '2026-11-02 08:10:00',
    Date: '2026-11-02',
    Nama_Pegawai: 'Asep Sunandar, S.Pd',
    Bidang: 'Organik',
    Status: 'Aktif Bekerja',
    Catatan: 'Pencacahan daun kering & sisa makanan kantin',
    Catatan_Khusus_Admin: 'Bahan komposting batch #12 masuk'
  }
];

export const INITIAL_TIMBANGAN: TimbanganSampahRecord[] = [
  {
    ID: 'TMB-3001',
    Timestamp: '2026-11-02 08:30:15',
    Date: '2026-11-02',
    Jenis_Sampah: 'Organik',
    Berat_KG: 42.5,
    Petugas: 'Asep Sunandar, S.Pd',
    Catatan: 'Daun ranting taman depan & sisa buah kantin',
    Catatan_Khusus_Admin: 'Kondisi lembab siap masuk biopori'
  },
  {
    ID: 'TMB-3002',
    Timestamp: '2026-11-02 09:15:00',
    Date: '2026-11-02',
    Jenis_Sampah: 'Botol',
    Berat_KG: 14.8,
    Petugas: 'Dewi Sartika',
    Catatan: 'Botol plastik air mineral bersih dari kelas X & XI',
    Catatan_Khusus_Admin: ''
  },
  {
    ID: 'TMB-3003',
    Timestamp: '2026-11-02 10:00:22',
    Date: '2026-11-02',
    Jenis_Sampah: 'Plastik Halus',
    Berat_KG: 8.2,
    Petugas: 'Rian Hidayat',
    Catatan: 'Plastik bungkus pembungkus snack & kantong kresek',
    Catatan_Khusus_Admin: ''
  },
  {
    ID: 'TMB-3004',
    Timestamp: '2026-11-02 11:20:00',
    Date: '2026-11-02',
    Jenis_Sampah: 'Organik',
    Berat_KG: 28.0,
    Petugas: 'Asep Sunandar, S.Pd',
    Catatan: 'Sisa rumput pemotongan lapangan olahraga',
    Catatan_Khusus_Admin: ''
  }
];

export const INITIAL_PRODUK: ProdukHasilRecord[] = [
  {
    ID: 'PRD-4001',
    Timestamp: '2026-11-02 10:30:00',
    Date: '2026-11-02',
    Jenis_Produk: 'Air lindi',
    Satuan: 'Liter',
    Jumlah: 25,
    Petugas: 'Asep Sunandar, S.Pd',
    Catatan: 'Hasil panen drum komposter aerob nomor 3',
    Catatan_Khusus_Admin: 'Pekat dan sudah disaring untuk pupuk cair'
  },
  {
    ID: 'PRD-4002',
    Timestamp: '2026-11-02 11:45:00',
    Date: '2026-11-02',
    Jenis_Produk: 'Pupuk Kompos',
    Satuan: 'Kilogram',
    Jumlah: 80,
    Petugas: 'Asep Sunandar, S.Pd',
    Catatan: 'Kompos matang diayak siap kemas 5kg untuk taman sekolah',
    Catatan_Khusus_Admin: 'Kualitas A halus & harum tanah'
  },
  {
    ID: 'PRD-4003',
    Timestamp: '2026-11-02 13:00:00',
    Date: '2026-11-02',
    Jenis_Produk: 'Barang Daur Ulang',
    Satuan: 'Jumlah Barang',
    Jumlah: 15,
    Petugas: 'Dewi Sartika',
    Catatan: 'Pot gantung tanaman hidroponik dari botol plastik 1.5L',
    Catatan_Khusus_Admin: 'Siap dipajang di selasar gedung B'
  }
];
