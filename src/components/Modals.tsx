import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  KeyRound,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { MasterPegawai } from '../types';
import { verifyAdminPassword, ADMIN_PASSWORD } from '../utils/adiwiyataLogic';

// --- 1. Admin Login Modal ---
interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(password)) {
      setErrorMsg('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Password Admin salah! Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Tutup modal login"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Otentikasi Administrator</h3>
            <p className="text-xs text-slate-500">Divisi Pengelolaan Sampah SMAN 27 GARUT</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Masukkan Password Admin:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan password admin..."
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm pr-10"
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
            {errorMsg && <p className="text-xs text-rose-600 mt-1.5 font-medium">{errorMsg}</p>}
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-800">
            <p className="font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              Petunjuk Hak Akses Admin:
            </p>
            <p className="mt-1 text-[11px] text-emerald-700">
              Admin berwenang mengedit/menghapus Master Pegawai, mengoreksi data transaksi 1-4, dan membubuhkan Catatan Khusus Admin.
            </p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              Verifikasi & Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 2. Edit Record Modal ---
interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  sheetName: 'Absensi_Umum' | 'Absensi_SubBidang' | 'Timbangan_Sampah' | 'Produk_Hasil';
  onSave: (sheetName: any, recordId: string, updatedFields: Record<string, any>) => void;
  masterPegawai: MasterPegawai[];
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  onClose,
  record,
  sheetName,
  onSave,
  masterPegawai
}) => {
  if (!isOpen || !record) return null;

  const [formData, setFormData] = useState<Record<string, any>>({ ...record });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sheetName, record.ID, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Edit Data Transaksi (Admin)</h3>
              <p className="text-xs text-slate-500">Sheet: {sheetName} • ID: {record.ID}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tanggal */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tanggal Record:</label>
            <input
              type="date"
              value={formData.Date || ''}
              onChange={e => handleChange('Date', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Pegawai / Petugas */}
          {(formData.Nama_Pegawai !== undefined || formData.Petugas !== undefined) && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pegawai / Petugas:</label>
              <select
                value={formData.Nama_Pegawai || formData.Petugas || ''}
                onChange={e => {
                  if (formData.Nama_Pegawai !== undefined) handleChange('Nama_Pegawai', e.target.value);
                  if (formData.Petugas !== undefined) handleChange('Petugas', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              >
                <option value="">-- Pilih Pegawai --</option>
                {masterPegawai.map(p => (
                  <option key={p.ID_Pegawai} value={p.Nama_Pegawai}>
                    {p.Nama_Pegawai} ({p.ID_Pegawai})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form specific fields */}
          {sheetName === 'Absensi_Umum' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Kehadiran:</label>
              <select
                value={formData.Status_Kehadiran || 'Hadir'}
                onChange={e => handleChange('Status_Kehadiran', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>
          )}

          {sheetName === 'Absensi_SubBidang' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bidang:</label>
                <select
                  value={formData.Bidang || 'Organik'}
                  onChange={e => handleChange('Bidang', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Pengumpulan Sampah Botol">Pengumpulan Sampah Botol</option>
                  <option value="Plastik Halus">Plastik Halus</option>
                  <option value="Organik">Organik</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status:</label>
                <input
                  type="text"
                  value={formData.Status || ''}
                  onChange={e => handleChange('Status', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          {sheetName === 'Timbangan_Sampah' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Sampah:</label>
                <select
                  value={formData.Jenis_Sampah || 'Organik'}
                  onChange={e => handleChange('Jenis_Sampah', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Botol">Botol</option>
                  <option value="Plastik Halus">Plastik Halus</option>
                  <option value="Organik">Organik</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Berat (KG):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.Berat_KG || 0}
                  onChange={e => handleChange('Berat_KG', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </>
          )}

          {sheetName === 'Produk_Hasil' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Produk:</label>
                <select
                  value={formData.Jenis_Produk || 'Pupuk Kompos'}
                  onChange={e => handleChange('Jenis_Produk', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Air lindi">Air lindi</option>
                  <option value="Pupuk Kompos">Pupuk Kompos</option>
                  <option value="Barang Daur Ulang">Barang Daur Ulang</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.Jumlah || 0}
                    onChange={e => handleChange('Jumlah', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan:</label>
                  <input
                    type="text"
                    value={formData.Satuan || ''}
                    onChange={e => handleChange('Satuan', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Catatan Petugas */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Petugas:</label>
            <textarea
              rows={2}
              value={formData.Catatan || ''}
              onChange={e => handleChange('Catatan', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Catatan Khusus Admin */}
          <div>
            <label className="block font-bold text-amber-800 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Catatan Khusus Admin:
            </label>
            <textarea
              rows={2}
              value={formData.Catatan_Khusus_Admin || ''}
              onChange={e => handleChange('Catatan_Khusus_Admin', e.target.value)}
              placeholder="Tambahkan verifikasi atau instruksi khusus admin..."
              className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 3. Admin Note Quick Modal ---
interface AdminNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  sheetName: any;
  currentNote: string;
  onSave: (sheetName: any, recordId: string, note: string) => void;
}

export const AdminNoteModal: React.FC<AdminNoteModalProps> = ({
  isOpen,
  onClose,
  recordId,
  sheetName,
  currentNote,
  onSave
}) => {
  const [note, setNote] = useState(currentNote || '');

  React.useEffect(() => {
    setNote(currentNote || '');
  }, [currentNote]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sheetName, recordId, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-amber-200">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Catatan Khusus Admin</h3>
              <p className="text-[11px] text-slate-500">Record ID: {recordId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Catatan Resmi / Evaluasi Admin:
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contoh: Sudah diverifikasi dan sesuai SOP daur ulang..."
              className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 text-xs"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Simpan Catatan Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
