import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Edit2,
  Trash2,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  RotateCcw,
  Download,
  Users
} from 'lucide-react';
import {
  MasterPegawai,
  AbsensiUmumRecord,
  AbsensiSubBidangRecord,
  TimbanganSampahRecord,
  ProdukHasilRecord
} from '../types';
import { verifyAdminPassword, ADMIN_PASSWORD } from '../utils/adiwiyataLogic';
import { DataService } from '../services/dataService';

interface AdminPanelViewProps {
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  masterPegawai: MasterPegawai[];
  absensiUmum: AbsensiUmumRecord[];
  absensiSub: AbsensiSubBidangRecord[];
  timbangan: TimbanganSampahRecord[];
  produk: ProdukHasilRecord[];
  onManagePegawai: (subAction: 'add' | 'edit' | 'delete', payload: any) => void;
  onEditRecord: (sheetName: any, record: any) => void;
  onDeleteRecord: (sheetName: any, recordId: string) => void;
  onAddAdminNote: (sheetName: any, recordId: string, currentNote: string) => void;
  onResetDefaults: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  isAdmin,
  onLoginSuccess,
  onLogout,
  masterPegawai,
  absensiUmum,
  absensiSub,
  timbangan,
  produk,
  onManagePegawai,
  onEditRecord,
  onDeleteRecord,
  onAddAdminNote,
  onResetDefaults
}) => {
  // Login Form States
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Master Pegawai Form States
  const [newPegawaiName, setNewPegawaiName] = useState('');
  const [newPegawaiId, setNewPegawaiId] = useState('');
  const [editingPegawaiId, setEditingPegawaiId] = useState<string | null>(null);
  const [editPegawaiName, setEditPegawaiName] = useState('');

  // Transaction Inspection Sheet Filter
  const [selectedSheet, setSelectedSheet] = useState<
    'Absensi_Umum' | 'Absensi_SubBidang' | 'Timbangan_Sampah' | 'Produk_Hasil'
  >('Absensi_Umum');
  const [searchTransaction, setSearchTransaction] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setLoginError('');
      setPasswordInput('');
      onLoginSuccess();
    } else {
      setLoginError('Password salah! Password default resmi adalah "dead4left".');
    }
  };

  const handleAddPegawai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPegawaiName.trim()) return;

    onManagePegawai('add', {
      idPegawai: newPegawaiId.trim() || undefined,
      namaPegawai: newPegawaiName.trim(),
      adminPassword: ADMIN_PASSWORD
    });

    setNewPegawaiName('');
    setNewPegawaiId('');
    setActionNotice('Pegawai baru berhasil ditambahkan ke Sheet "Master_Pegawai".');
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleSaveEditPegawai = (id: string) => {
    if (!editPegawaiName.trim()) return;
    onManagePegawai('edit', {
      idPegawai: id,
      namaPegawai: editPegawaiName.trim(),
      adminPassword: ADMIN_PASSWORD
    });
    setEditingPegawaiId(null);
    setEditPegawaiName('');
    setActionNotice(`Data pegawai ID ${id} berhasil diperbarui.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleDeletePegawai = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus pegawai "${name}" (${id}) dari Master Pegawai?`)) {
      onManagePegawai('delete', {
        idPegawai: id,
        adminPassword: ADMIN_PASSWORD
      });
      setActionNotice(`Pegawai ${name} telah dihapus.`);
      setTimeout(() => setActionNotice(''), 4000);
    }
  };

  // If NOT logged in, show clean Login Screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900">Login Administrator</h2>
          <p className="text-xs text-slate-500 mt-1">
            Divisi Pengelolaan Sampah Adiwiyata SMAN 27 GARUT
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password Administrator:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Masukkan password..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm pr-10 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginError && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {loginError}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Informasi Keamanan:
              </span>
              <p className="text-[11px] leading-relaxed">
                Password admin resmi yang dikonfigurasi pada spesifikasi Apps Script adalah{' '}
                <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">
                  dead4left
                </code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition text-sm cursor-pointer"
            >
              Verifikasi & Buka Panel Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Admin View
  return (
    <div className="space-y-6">
      {/* Admin Status Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-lg border border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold uppercase tracking-wider">
                Hak Akses Penuh
              </span>
              <span className="text-xs text-amber-200">Password: "dead4left" Terverifikasi</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Panel Kendali Khusus Administrator
            </h2>
            <p className="text-xs text-slate-300">
              Kelola Master Pegawai, koreksi transaksi 1-4, dan sematkan Catatan Khusus Admin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset data lokal ke master 20 siswa resmi SMAN 27 Garut dan kosongkan catatan transaksi?')) {
                onResetDefaults();
                setActionNotice('Data lokal berhasil di-reset ke kondisi awal (Master 20 Siswa SMAN 27 Garut).');
              }
            }}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
            title="Reset ke master siswa resmi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Action Notice Toast */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-200" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-emerald-200 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* SECTION 1: Master Pegawai CRUD Manager */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Manajemen Master Pegawai (Sheet "Master_Pegawai")
              </h3>
              <p className="text-xs text-slate-500">
                Data induk pegawai yang menjadi pilihan pada form absensi, timbangan, dan produk hasil
              </p>
            </div>
          </div>
          <button
            onClick={() => DataService.exportToCSV('Master_Pegawai')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Pegawai</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Pegawai Form */}
          <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Tambah Pegawai Baru
            </h4>
            <form onSubmit={handleAddPegawai} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ID Pegawai (Opsional, auto jika kosong):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PEG-006"
                  value={newPegawaiId}
                  onChange={e => setNewPegawaiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Pegawai: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama pegawai..."
                  value={newPegawaiName}
                  onChange={e => setNewPegawaiName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Simpan ke Master Pegawai
              </button>
            </form>
          </div>

          {/* Pegawai List Table */}
          <div className="lg:col-span-8 overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ID Pegawai</th>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterPegawai.map(p => (
                  <tr key={p.ID_Pegawai} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {p.ID_Pegawai}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {editingPegawaiId === p.ID_Pegawai ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editPegawaiName}
                            onChange={e => setEditPegawaiName(e.target.value)}
                            className="px-2 py-1 rounded border border-emerald-400 text-xs w-full max-w-xs focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEditPegawai(p.ID_Pegawai)}
                            className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px]"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditingPegawaiId(null);
                              setEditPegawaiName('');
                            }}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        p.Nama_Pegawai
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {editingPegawaiId !== p.ID_Pegawai && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingPegawaiId(p.ID_Pegawai);
                              setEditPegawaiName(p.Nama_Pegawai);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit nama pegawai"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePegawai(p.ID_Pegawai, p.Nama_Pegawai)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus pegawai"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Master Transactions CRUD & Admin Note Inspector */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Manajemen Seluruh Transaksi & Catatan Khusus Admin
            </h3>
            <p className="text-xs text-slate-500">
              Pilih sheet untuk mengoreksi data transaksi atau memberikan catatan khusus resmi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTransaction}
                onChange={e => setSearchTransaction(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-40 sm:w-52 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Sheet Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'Absensi_Umum', label: '1. Absensi Umum', count: absensiUmum.length },
            { id: 'Absensi_SubBidang', label: '2. Absensi Sub-Bidang', count: absensiSub.length },
            { id: 'Timbangan_Sampah', label: '3. Timbangan Sampah', count: timbangan.length },
            { id: 'Produk_Hasil', label: '4. Produk Hasil', count: produk.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSheet(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedSheet === tab.id
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedSheet === tab.id ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Active Sheet Records Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ID Record</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Pegawai / Petugas</th>
                <th className="py-2.5 px-3">Detail Spesifik</th>
                <th className="py-2.5 px-3">Catatan Petugas</th>
                <th className="py-2.5 px-3">Catatan Khusus Admin</th>
                <th className="py-2.5 px-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(() => {
                let currentRecords: any[] = [];
                if (selectedSheet === 'Absensi_Umum') currentRecords = absensiUmum;
                else if (selectedSheet === 'Absensi_SubBidang') currentRecords = absensiSub;
                else if (selectedSheet === 'Timbangan_Sampah') currentRecords = timbangan;
                else if (selectedSheet === 'Produk_Hasil') currentRecords = produk;

                const filtered = currentRecords.filter(r =>
                  JSON.stringify(r).toLowerCase().includes(searchTransaction.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada record yang sesuai pada {selectedSheet}.
                      </td>
                    </tr>
                  );
                }

                return filtered.map(r => (
                  <tr key={r.ID} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {r.ID}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      {r.Date}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {r.Nama_Pegawai || r.Petugas}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {selectedSheet === 'Absensi_Umum' && (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {r.Status_Kehadiran}
                        </span>
                      )}
                      {selectedSheet === 'Absensi_SubBidang' && (
                        <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {r.Bidang} • {r.Status}
                        </span>
                      )}
                      {selectedSheet === 'Timbangan_Sampah' && (
                        <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                          {r.Jenis_Sampah}: {r.Berat_KG} KG
                        </span>
                      )}
                      {selectedSheet === 'Produk_Hasil' && (
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {r.Jenis_Produk}: {r.Jumlah} {r.Satuan}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={r.Catatan}>
                      {r.Catatan || '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.Catatan_Khusus_Admin ? (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[140px]" title={r.Catatan_Khusus_Admin}>
                            {r.Catatan_Khusus_Admin}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onAddAdminNote(selectedSheet, r.ID, r.Catatan_Khusus_Admin || '')}
                          title="Beri / Edit Catatan Khusus Admin"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditRecord(selectedSheet, r)}
                          title="Edit record transaksi"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus record ${r.ID} secara permanen?`)) {
                              onDeleteRecord(selectedSheet, r.ID);
                              setActionNotice(`Record ${r.ID} berhasil dihapus.`);
                            }
                          }}
                          title="Hapus record transaksi"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
