import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AbsensiUmumRecord, MasterPegawai } from '../types';
import { formatDate } from '../utils/adiwiyataLogic';

interface AbsensiUmumViewProps {
  records: AbsensiUmumRecord[];
  masterPegawai: MasterPegawai[];
  isAdmin: boolean;
  onAddRecord: (data: {
    namaPegawai: string;
    statusKehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
    catatan: string;
    date: string;
  }) => void;
  onEditRecord: (record: AbsensiUmumRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddAdminNote: (recordId: string, currentNote: string) => void;
}

export const AbsensiUmumView: React.FC<AbsensiUmumViewProps> = ({
  records,
  masterPegawai,
  isAdmin,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onAddAdminNote
}) => {
  const [selectedPegawai, setSelectedPegawai] = useState('');
  const [status, setStatus] = useState<'Hadir' | 'Izin' | 'Sakit' | 'Alpa'>('Hadir');
  const [catatan, setCatatan] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [submittedToast, setSubmittedToast] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawai) return;

    onAddRecord({
      namaPegawai: selectedPegawai,
      statusKehadiran: status,
      catatan,
      date
    });

    setSubmittedToast(`Absensi untuk ${selectedPegawai} (${status}) berhasil dicatat!`);
    setCatatan('');
    setTimeout(() => setSubmittedToast(''), 4000);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.Nama_Pegawai.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.Catatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ID.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.Status_Kehadiran === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {submittedToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between animate-fadeIn text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="font-semibold">{submittedToast}</span>
          </div>
          <button onClick={() => setSubmittedToast('')} className="text-emerald-200 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Grid: Form Input on Left, Live Sheet Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Form Absensi Umum</h3>
              <p className="text-xs text-slate-500">Sheet: "Absensi_Umum"</p>
            </div>
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

            {/* Nama Pegawai */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pilih Nama Pegawai: <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPegawai}
                onChange={e => setSelectedPegawai(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              >
                <option value="">-- Pilih dari Master Pegawai --</option>
                {masterPegawai.map(p => (
                  <option key={p.ID_Pegawai} value={p.Nama_Pegawai}>
                    {p.Nama_Pegawai} ({p.ID_Pegawai})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Kehadiran Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Status Kehadiran:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2 px-1 text-center rounded-xl font-bold text-xs transition border ${
                      status === s
                        ? s === 'Hadir'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : s === 'Izin'
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : s === 'Sakit'
                          ? 'bg-amber-600 text-white border-amber-600 shadow'
                          : 'bg-rose-600 text-white border-rose-600 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Petugas:
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Contoh: Piket pagi di biopori & komposting..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Simpan ke Google Sheet
            </button>
          </form>
        </div>

        {/* Live Table Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rekapitulasi Absensi Umum</h3>
              <p className="text-xs text-slate-500">Tersinkronisasi dengan Sheet "Absensi_Umum"</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama/catatan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-36 sm:w-44 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="py-1.5 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">Semua</option>
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto flex-1 border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal / ID</th>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Catatan</th>
                  <th className="py-2.5 px-3">Catatan Khusus Admin</th>
                  {isAdmin && <th className="py-2.5 px-3 text-right">Aksi Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-slate-400">
                      Belum ada data absensi yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr key={r.ID} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{r.Date}</div>
                        <div className="font-mono text-[10px] text-slate-400">{r.ID}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {r.Nama_Pegawai}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            r.Status_Kehadiran === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.Status_Kehadiran === 'Izin'
                              ? 'bg-blue-100 text-blue-800'
                              : r.Status_Kehadiran === 'Sakit'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.Status_Kehadiran}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={r.Catatan}>
                        {r.Catatan || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {r.Catatan_Khusus_Admin ? (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate max-w-[140px]" title={r.Catatan_Khusus_Admin}>
                              {r.Catatan_Khusus_Admin}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px] italic">-</span>
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
