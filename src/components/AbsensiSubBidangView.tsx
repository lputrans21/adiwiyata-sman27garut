import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  FileText,
  Filter
} from 'lucide-react';
import { AbsensiSubBidangRecord, MasterPegawai } from '../types';
import { formatDate } from '../utils/adiwiyataLogic';

interface AbsensiSubBidangViewProps {
  records: AbsensiSubBidangRecord[];
  masterPegawai: MasterPegawai[];
  isAdmin: boolean;
  onAddRecord: (data: {
    namaPegawai: string;
    bidang: 'Pengumpulan Sampah Botol' | 'Plastik Halus' | 'Organik';
    status: string;
    catatan: string;
    date: string;
  }) => void;
  onEditRecord: (record: AbsensiSubBidangRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddAdminNote: (recordId: string, currentNote: string) => void;
}

export const AbsensiSubBidangView: React.FC<AbsensiSubBidangViewProps> = ({
  records,
  masterPegawai,
  isAdmin,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onAddAdminNote
}) => {
  const [selectedPegawai, setSelectedPegawai] = useState('');
  const [bidang, setBidang] = useState<'Pengumpulan Sampah Botol' | 'Plastik Halus' | 'Organik'>('Organik');
  const [status, setStatus] = useState('Aktif Bekerja');
  const [catatan, setCatatan] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [bidangFilter, setBidangFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawai) return;

    onAddRecord({
      namaPegawai: selectedPegawai,
      bidang,
      status,
      catatan,
      date
    });

    setToastMsg(`Absensi Sub-Bidang (${bidang}) untuk ${selectedPegawai} tersimpan.`);
    setCatatan('');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.Nama_Pegawai.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.Catatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ID.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBidang = bidangFilter === 'all' || r.Bidang === bidangFilter;
    return matchesSearch && matchesBidang;
  });

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

      {/* Grid: Form on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Absensi Sub-Bidang</h3>
              <p className="text-xs text-slate-500">Sheet: "Absensi_SubBidang"</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Tanggal */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Tanggal Pelaksanaan:
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
                Nama Pegawai: <span className="text-rose-500">*</span>
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

            {/* Pilihan Sub-Bidang */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Sub-Bidang Pengelolaan Sampah:
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'Pengumpulan Sampah Botol',
                    label: 'Pengumpulan Sampah Botol',
                    desc: 'Pemilahan botol plastik kemasan, cup minuman, dan tutup botol'
                  },
                  {
                    id: 'Plastik Halus',
                    label: 'Plastik Halus',
                    desc: 'Pengumpulan kantong kresek, bungkus sachet, dan plastik fleksibel'
                  },
                  {
                    id: 'Organik',
                    label: 'Organik',
                    desc: 'Pengolahan sisa makanan kantin, daun gugur taman, dan biopori'
                  }
                ].map(b => (
                  <label
                    key={b.id}
                    onClick={() => setBidang(b.id as any)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      bidang === b.id
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bidangRadio"
                      checked={bidang === b.id}
                      onChange={() => setBidang(b.id as any)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs">{b.label}</div>
                      <div className="text-[11px] text-slate-500">{b.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Kerja */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status Operasional:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Aktif Bekerja">Aktif Bekerja</option>
                <option value="Shift Pagi (07.00 - 10.00)">Shift Pagi (07.00 - 10.00)</option>
                <option value="Shift Siang (10.00 - 13.00)">Shift Siang (10.00 - 13.00)</option>
                <option value="Selesai Shift">Selesai Shift</option>
                <option value="Izin Khusus">Izin Khusus</option>
              </select>
            </div>

            {/* Catatan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Aktivitas / Hasil Sementara:
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Misal: Sudah memilah 3 karung botol bersih..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Simpan Absensi Sub-Bidang
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rekap Penugasan Sub-Bidang</h3>
              <p className="text-xs text-slate-500">Tersinkronisasi dengan Sheet "Absensi_SubBidang"</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-32 sm:w-40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={bidangFilter}
                onChange={e => setBidangFilter(e.target.value)}
                className="py-1.5 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">Semua Bidang</option>
                <option value="Pengumpulan Sampah Botol">Botol</option>
                <option value="Plastik Halus">Plastik Halus</option>
                <option value="Organik">Organik</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal / ID</th>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3">Sub-Bidang</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Catatan</th>
                  <th className="py-2.5 px-3">Catatan Admin</th>
                  {isAdmin && <th className="py-2.5 px-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                      Belum ada data penugasan sub-bidang.
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
                            r.Bidang === 'Organik'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.Bidang === 'Pengumpulan Sampah Botol'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.Bidang}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                        {r.Status}
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
