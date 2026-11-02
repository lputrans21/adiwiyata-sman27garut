import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  FileText,
  Droplets,
  Sprout,
  Package
} from 'lucide-react';
import { ProdukHasilRecord, MasterPegawai } from '../types';
import { formatDate } from '../utils/adiwiyataLogic';

interface ProdukHasilViewProps {
  records: ProdukHasilRecord[];
  masterPegawai: MasterPegawai[];
  isAdmin: boolean;
  onAddRecord: (data: {
    jenisProduk: 'Air lindi' | 'Pupuk Kompos' | 'Barang Daur Ulang' | string;
    satuan: 'Liter' | 'Kilogram' | 'Jumlah Barang' | string;
    jumlah: number;
    petugas: string;
    catatan: string;
    date: string;
  }) => void;
  onEditRecord: (record: ProdukHasilRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddAdminNote: (recordId: string, currentNote: string) => void;
}

export const ProdukHasilView: React.FC<ProdukHasilViewProps> = ({
  records,
  masterPegawai,
  isAdmin,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onAddAdminNote
}) => {
  const [jenisProduk, setJenisProduk] = useState<'Air lindi' | 'Pupuk Kompos' | 'Barang Daur Ulang'>('Pupuk Kompos');
  const [satuan, setSatuan] = useState('Kilogram');
  const [jumlah, setJumlah] = useState<number>(10);
  const [petugas, setPetugas] = useState('');
  const [catatan, setCatatan] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Auto-switch default unit when product changes
  const handleJenisProdukChange = (val: 'Air lindi' | 'Pupuk Kompos' | 'Barang Daur Ulang') => {
    setJenisProduk(val);
    if (val === 'Air lindi') setSatuan('Liter');
    else if (val === 'Pupuk Kompos') setSatuan('Kilogram');
    else if (val === 'Barang Daur Ulang') setSatuan('Pcs');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petugas || jumlah <= 0) return;

    onAddRecord({
      jenisProduk,
      satuan,
      jumlah,
      petugas,
      catatan,
      date
    });

    setToastMsg(`Produk hasil ${jenisProduk} (${jumlah} ${satuan}) berhasil dicatat!`);
    setCatatan('');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.Jenis_Produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.Petugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.Catatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ID.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate cumulative stocks
  const totalLindi = records
    .filter(r => r.Jenis_Produk === 'Air lindi')
    .reduce((acc, r) => acc + (Number(r.Jumlah) || 0), 0);

  const totalKompos = records
    .filter(r => r.Jenis_Produk === 'Pupuk Kompos')
    .reduce((acc, r) => acc + (Number(r.Jumlah) || 0), 0);

  const totalDaurUlang = records
    .filter(r => r.Jenis_Produk === 'Barang Daur Ulang')
    .reduce((acc, r) => acc + (Number(r.Jumlah) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-emerald-200 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Product Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Total Air Lindi Terproduksi
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {totalLindi.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Liter</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pupuk organik cair serbaguna</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Total Pupuk Kompos Matang
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {totalKompos.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">KG</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Siap pakai media tanam sekolah</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Barang Daur Ulang Kreatif
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {totalDaurUlang.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Barang</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pot hidroponik & hiasan taman</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Form on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pencatatan Produk Hasil</h3>
              <p className="text-xs text-slate-500">Sheet: "Produk_Hasil"</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Tanggal */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Tanggal Produksi:
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Pilihan Jenis Produk */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Jenis Produk Olahan:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'Air lindi', label: 'Air lindi (Pupuk Organik Cair)', icon: Droplets, unit: 'Liter' },
                  { id: 'Pupuk Kompos', label: 'Pupuk Kompos (Padat)', icon: Sprout, unit: 'Kilogram' },
                  { id: 'Barang Daur Ulang', label: 'Barang Daur Ulang (Kerajinan/Pot)', icon: Package, unit: 'Jumlah Barang' }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.id}
                      onClick={() => handleJenisProdukChange(item.id as any)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                        jenisProduk === item.id
                          ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 text-amber-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="jenisProdukRadio"
                        checked={jenisProduk === item.id}
                        onChange={() => handleJenisProdukChange(item.id as any)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="flex-1 font-bold text-xs">{item.label}</div>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-500">
                        {item.unit}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Jumlah & Satuan Input */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={jumlah}
                  onChange={e => setJumlah(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Satuan:
                </label>
                <select
                  value={satuan}
                  onChange={e => setSatuan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Liter">Liter</option>
                  <option value="Kilogram">Kilogram</option>
                  <option value="Pcs">Pcs (Satuan Barang)</option>
                  <option value="Jumlah Barang">Jumlah Barang</option>
                </select>
              </div>
            </div>

            {/* Petugas Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Petugas Penanggung Jawab: <span className="text-rose-500">*</span>
              </label>
              <select
                value={petugas}
                onChange={e => setPetugas(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              >
                <option value="">-- Pilih Petugas --</option>
                {masterPegawai.map(p => (
                  <option key={p.ID_Pegawai} value={p.Nama_Pegawai}>
                    {p.Nama_Pegawai} ({p.ID_Pegawai})
                  </option>
                ))}
              </select>
            </div>

            {/* Catatan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Produksi / Keterangan:
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Misal: Sudah disaring & dimasukkan ke dalam botol kemasan 1 liter..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={jumlah <= 0 || !petugas}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Simpan Produk ke Google Sheet
            </button>
          </form>
        </div>

        {/* Live Table Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Riwayat Output Produk Hasil</h3>
              <p className="text-xs text-slate-500">Tersinkronisasi dengan Sheet "Produk_Hasil"</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari produk/petugas..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-36 sm:w-44 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal / ID</th>
                  <th className="py-2.5 px-3">Jenis Produk</th>
                  <th className="py-2.5 px-3">Jumlah</th>
                  <th className="py-2.5 px-3">Petugas</th>
                  <th className="py-2.5 px-3">Catatan</th>
                  <th className="py-2.5 px-3">Catatan Admin</th>
                  {isAdmin && <th className="py-2.5 px-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                      Belum ada data produk hasil yang dicatat.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr key={r.ID} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{r.Date}</div>
                        <div className="font-mono text-[10px] text-slate-400">{r.ID}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                        {r.Jenis_Produk}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                        {r.Jumlah} <span className="font-normal text-slate-500 text-[11px]">{r.Satuan}</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {r.Petugas}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={r.Catatan}>
                        {r.Catatan || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {r.Catatan_Khusus_Admin ? (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate max-w-[130px]" title={r.Catatan_Khusus_Admin}>
                              {r.Catatan_Khusus_Admin}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => onAddAdminNote(r.ID, r.Catatan_Khusus_Admin || '')}
                              title="Beri Catatan Khusus Admin"
                              className="p-1 hover:bg-amber-50 text-amber-600 rounded"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditRecord(r)}
                              title="Edit Record"
                              className="p-1 hover:bg-slate-100 text-blue-600 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRecord(r.ID)}
                              title="Hapus Record"
                              className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
