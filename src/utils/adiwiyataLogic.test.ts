import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyAdminPassword,
  formatDate,
  formatDateTime,
  isDateWithinPeriod,
  calculateTimbanganSummary,
  calculateProdukSummary,
  calculateKehadiranSummary,
  generateRecordId,
  TimbanganSampahRecord,
  ProdukHasilRecord,
  AbsensiUmumRecord
} from './adiwiyataLogic';

test('verifyAdminPassword accurately checks dead4left', () => {
  assert.equal(verifyAdminPassword('dead4left'), true);
  assert.equal(verifyAdminPassword(' dead4left '), true);
  assert.equal(verifyAdminPassword('wrongpassword'), false);
  assert.equal(verifyAdminPassword(''), false);
});

test('formatDate correctly formats date strings and objects', () => {
  const d = new Date(2026, 10, 2); // Month is 0-indexed, 10 = Nov
  assert.equal(formatDate(d), '2026-11-02');
  assert.equal(formatDate('2026-05-15T10:00:00'), '2026-05-15');
});

test('isDateWithinPeriod accurately filters harian, mingguan, and bulanan', () => {
  const ref = new Date('2026-11-02T12:00:00');
  
  // Harian
  assert.equal(isDateWithinPeriod('2026-11-02', 'harian', ref), true);
  assert.equal(isDateWithinPeriod('2026-11-01', 'harian', ref), false);

  // Mingguan (within past 7 days)
  assert.equal(isDateWithinPeriod('2026-11-02', 'mingguan', ref), true);
  assert.equal(isDateWithinPeriod('2026-10-30', 'mingguan', ref), true);
  assert.equal(isDateWithinPeriod('2026-10-20', 'mingguan', ref), false);

  // Bulanan
  assert.equal(isDateWithinPeriod('2026-11-01', 'bulanan', ref), true);
  assert.equal(isDateWithinPeriod('2026-11-20', 'bulanan', ref), true);
  assert.equal(isDateWithinPeriod('2026-10-31', 'bulanan', ref), false);
});

test('calculateTimbanganSummary calculates totals and breakdown', () => {
  const mockTimbangan: TimbanganSampahRecord[] = [
    { ID: 'T1', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Sampah: 'Botol', Berat_KG: 12.5, Petugas: 'Asep', Catatan: '-' },
    { ID: 'T2', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Sampah: 'Organik', Berat_KG: 30.0, Petugas: 'Rian', Catatan: '-' },
    { ID: 'T3', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Sampah: 'Plastik Halus', Berat_KG: 5.5, Petugas: 'Dewi', Catatan: '-' },
    { ID: 'T4', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Sampah: 'Botol', Berat_KG: 7.5, Petugas: 'Asep', Catatan: '-' }
  ];

  const res = calculateTimbanganSummary(mockTimbangan);
  assert.equal(res.totalKg, 55.5);
  assert.equal(res.breakdown['Botol'], 20.0);
  assert.equal(res.breakdown['Organik'], 30.0);
  assert.equal(res.breakdown['Plastik Halus'], 5.5);
  assert.equal(res.count, 4);
});

test('calculateProdukSummary tallies products properly', () => {
  const mockProduk: ProdukHasilRecord[] = [
    { ID: 'P1', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Produk: 'Air lindi', Satuan: 'Liter', Jumlah: 15, Petugas: 'Asep', Catatan: '-' },
    { ID: 'P2', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Produk: 'Pupuk Kompos', Satuan: 'Kilogram', Jumlah: 50, Petugas: 'Asep', Catatan: '-' },
    { ID: 'P3', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Produk: 'Pupuk Kompos', Satuan: 'Kilogram', Jumlah: 25, Petugas: 'Rian', Catatan: '-' },
    { ID: 'P4', Timestamp: '2026-11-02', Date: '2026-11-02', Jenis_Produk: 'Barang Daur Ulang', Satuan: 'Jumlah Barang', Jumlah: 8, Petugas: 'Dewi', Catatan: '-' }
  ];

  const res = calculateProdukSummary(mockProduk);
  assert.equal(res.summary['Air lindi'].jumlah, 15);
  assert.equal(res.summary['Pupuk Kompos'].jumlah, 75);
  assert.equal(res.summary['Barang Daur Ulang'].jumlah, 8);
  assert.equal(res.totalRecords, 4);
});

test('calculateKehadiranSummary aggregates attendance properly', () => {
  const mockAbsensi: AbsensiUmumRecord[] = [
    { ID: 'A1', Timestamp: '2026-11-02', Date: '2026-11-02', Nama_Pegawai: 'P1', Status_Kehadiran: 'Hadir', Catatan: '-' },
    { ID: 'A2', Timestamp: '2026-11-02', Date: '2026-11-02', Nama_Pegawai: 'P2', Status_Kehadiran: 'Hadir', Catatan: '-' },
    { ID: 'A3', Timestamp: '2026-11-02', Date: '2026-11-02', Nama_Pegawai: 'P3', Status_Kehadiran: 'Izin', Catatan: 'Urusan keluarga' },
    { ID: 'A4', Timestamp: '2026-11-02', Date: '2026-11-02', Nama_Pegawai: 'P4', Status_Kehadiran: 'Sakit', Catatan: 'Flu' }
  ];

  const res = calculateKehadiranSummary(mockAbsensi);
  assert.equal(res.Hadir, 2);
  assert.equal(res.Izin, 1);
  assert.equal(res.Sakit, 1);
  assert.equal(res.Alpa, 0);
});

test('generateRecordId produces non-empty ID with prefix', () => {
  const id1 = generateRecordId('TMB');
  const id2 = generateRecordId('TMB');
  assert.match(id1, /^TMB-\d{6}-\d{4}$/);
  assert.notEqual(id1, id2);
});

test('Summary functions handle empty records gracefully', () => {
  const emptyTimbangan = calculateTimbanganSummary([]);
  assert.equal(emptyTimbangan.totalKg, 0);
  assert.equal(emptyTimbangan.count, 0);
  assert.equal(emptyTimbangan.breakdown['Botol'], 0);
  assert.equal(emptyTimbangan.breakdown['Organik'], 0);
  assert.equal(emptyTimbangan.breakdown['Plastik Halus'], 0);

  const emptyProduk = calculateProdukSummary([]);
  assert.equal(emptyProduk.totalRecords, 0);
  assert.equal(emptyProduk.summary['Air lindi'].jumlah, 0);
  assert.equal(emptyProduk.summary['Pupuk Kompos'].jumlah, 0);
  assert.equal(emptyProduk.summary['Barang Daur Ulang'].jumlah, 0);

  const emptyKehadiran = calculateKehadiranSummary([]);
  assert.equal(emptyKehadiran.Hadir, 0);
  assert.equal(emptyKehadiran.Izin, 0);
  assert.equal(emptyKehadiran.Sakit, 0);
  assert.equal(emptyKehadiran.Alpa, 0);
});

