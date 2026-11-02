import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  FileText,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { TimbanganSampahRecord, MasterPegawai } from '../types';
import { formatDate } from '../utils/adiwiyataLogic';

interface TimbanganSampahViewProps {
  records: TimbanganSampahRecord[];
  masterPegawai: MasterPegawai[];
  isAdmin: boolean;
  onAddRecord: (data: {
    jenisSampah: 'Botol' | 'Plastik Halus' | 'Organik' | string;
    beratKg: number;
    petugas: string;
    catatan: string;
    date: string;
  }) => void;
  onEditRecord: (record: TimbanganSampahRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddAdminNote: (recordId: string, currentNote: string) => void;
}

export const TimbanganSampahView: React.FC<TimbanganSampahViewProps> = ({
  records,
  masterPegawai,
  isAdmin,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onAddAdminNote
}) => {
  const [jenisSampah, setJenisSampah] = useState<'Botol' | 'Plastik Halus' | 'Organik'>('Organik');
  const [beratKg, setBeratKg] = useState<number>(5.0);
  const [petugas, setPetugas] = useState('');
  const [catatan, setCatatan] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleAddWeight = (increment: number) => {
    setBeratKg(prev => Math.max(0, Math.round((prev + increment) * 10) / 10));
  };

  const handleTare = () => {
    setBeratKg(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petugas || beratKg <= 0) return;

    onAddRecord({
      jenisSampah,
      beratKg,
      petugas,
      catatan,
      date
    });

    setToastMsg(`Timbangan ${jenisSampah} seberat ${beratKg} KG berhasil dicatat!`);
    setCatatan('');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.Jenis_Sampah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.Petugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.Catatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ID.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate today's totals
  const todayStr = formatDate(new Date());
  const todayRecords = records.filter(r => r.Date === todayStr);
  const totalTodayKg = todayRecords.reduce((acc, r) => acc + (Number(r.Berat_KG) || 0), 0);

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

      {/* Grid: Scale Simulator & Form on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form & Scale Simulator */}
        <div className="lg:col-span-5 space-y-4">
          {/* Digital Scale Visualization Box */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-400 uppercase">
                <Scale className="w-4 h-4" />
                TIMBANGAN DIGITAL ADIWIYATA
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px]">
                CALIBRATED
              </span>
            </div>

            {/* LED Display */}
            <div className="my-4 bg-black/80 rounded-xl p-4 border border-emerald-900/60 shadow-inner flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-slate-500 font-mono block">
                  BERAT TIMBANGAN
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 tracking-wider">
                  {beratKg.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-emerald-500/80 block">KG</span>
                <span className="text-[11px] text-slate-400 font-mono">Precision: ±0.05</span>
              </div>
            </div>

            {/* Scale Controls / Increments */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold transition"
                title="Reset timbangan ke 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Tare / Nol
              </button>
              <div className="flex-1 grid grid-cols-4 gap-1.5">
                {[0.5, 1.0, 5.0, 10.0].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleAddWeight(inc)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900/60 border border-slate-700 hover:border-emerald-700 text-slate-200 text-xs font-mono font-bold transition text-center"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Input Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Catat Timbangan Sampah</h3>
              <span className="text-xs text-slate-500">Sheet: "Timbangan_Sampah"</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Tanggal */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Tanggal:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Jenis Sampah Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Jenis Sampah:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Botol', label: 'Botol', color: 'border-sky-500 bg-sky-50 text-sky-900' },
                    { id: 'Plastik Halus', label: 'Plastik Halus', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                    { id: 'Organik', label: 'Organik', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setJenisSampah(cat.id as any)}
                      className={`p-2 rounded-xl border text-center transition font-bold text-xs ${
                        jenisSampah === cat.id
                          ? `${cat.color} ring-2 ring-emerald-500 shadow-sm`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Berat (KG) input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Berat Sampah (KG): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={beratKg}
                    onChange={e => setBeratKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 pr-12"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500">
                    KG
                  </span>
                </div>
              </div>

              {/* Petugas Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Petugas Penimbang: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={petugas}
                  onChange={e => setPetugas(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">-- Pilih Petugas Penimbang --</option>
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
                  Catatan / Asal Sumber Sampah:
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Misal: Dari pembersihan ruang laboratorium biologi..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={beratKg <= 0 || !petugas}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Simpan Record Timbangan
              </button>
            </form>
          </div>
        </div>

        {/* Live Timbangan Table Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Riwayat Penimbangan Sampah</h3>
              <p className="text-xs text-slate-500">Tersinkronisasi dengan Sheet "Timbangan_Sampah"</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari jenis/petugas..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-36 sm:w-44 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Total Ditimbang Hari Ini ({todayStr}):</span>
            <span className="font-mono font-black text-emerald-800 text-sm">
              {Math.round(totalTodayKg * 100) / 100} KG
            </span>
          </div>

          <div className="overflow-x-auto flex-1 border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal / ID</th>
                  <th className="py-2.5 px-3">Jenis Sampah</th>
                  <th className="py-2.5 px-3">Berat (KG)</th>
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
                      Belum ada data penimbangan.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr key={r.ID} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{r.Date}</div>
                        <div className="font-mono text-[10px] text-slate-400">{r.ID}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            r.Jenis_Sampah === 'Organik'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.Jenis_Sampah === 'Botol'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.Jenis_Sampah}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {r.Berat_KG} KG
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
