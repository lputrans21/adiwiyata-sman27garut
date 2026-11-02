import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Sparkles,
  Search,
  Globe,
  Radio
} from 'lucide-react';
import { CODE_GS_SOURCE } from '../data/codeGsContent';
import { APP_JS_SOURCE } from '../data/appJsContent';
import { STANDALONE_HTML_SOURCE } from '../data/standaloneHtmlContent';
import { DataService } from '../services/dataService';

interface AppsScriptHubViewProps {
  useLiveApi: boolean;
  onToggleLiveApi: (enabled: boolean) => void;
}

export const AppsScriptHubView: React.FC<AppsScriptHubViewProps> = ({
  useLiveApi,
  onToggleLiveApi
}) => {
  const [copied, setCopied] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'panduan' | 'struktur' | 'koneksi'>('panduan');
  const [selectedFile, setSelectedFile] = useState<'Code.gs' | 'app.js' | 'index.html'>('Code.gs');
  const [apiUrl, setApiUrl] = useState(DataService.getApiUrl());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const getCurrentFileContent = () => {
    switch (selectedFile) {
      case 'app.js':
        return APP_JS_SOURCE;
      case 'index.html':
        return STANDALONE_HTML_SOURCE;
      case 'Code.gs':
      default:
        return CODE_GS_SOURCE;
    }
  };

  const currentContent = getCurrentFileContent();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadCode = () => {
    const mime = selectedFile.endsWith('.html') ? 'text/html' : 'text/javascript';
    const blob = new Blob([currentContent], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveApiUrl = () => {
    DataService.setApiUrl(apiUrl);
    setTestResult({
      success: true,
      message: 'URL Google Apps Script Web App berhasil disimpan!'
    });
  };

  const handleTestConnection = async () => {
    if (!apiUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App terlebih dahulu.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Testing with GET request
      const endpoint = `${apiUrl.trim()}${apiUrl.includes('?') ? '&' : '?'}action=getAllData`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: 'Koneksi Berhasil! Google Apps Script merespons data sheet secara realtime.'
        });
      } else {
        setTestResult({
          success: false,
          message: `Server merespons status ${res.status}. Pastikan deployment diset 'Anyone' (Siapa saja).`
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Tidak dapat terhubung ke URL tersebut. Periksa izin "Who has access: Anyone" pada deployment.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const filteredCodeLines = CODE_GS_SOURCE.split('\n');

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <FileCode className="w-3.5 h-3.5" />
              <span>Backend Google Sheets Engine • SMAN 27 GARUT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Kode Backend Google Apps Script (Code.gs)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-2 leading-relaxed">
              Arsitektur kode backend bersih, terstruktur, lengkap dengan komentar berbahasa Indonesia,
              penanganan LockService untuk keamanan concurrency, CRUD untuk 5 sheets, otentikasi admin (Password: <code className="bg-emerald-900 text-amber-300 px-1 py-0.5 rounded font-mono font-bold">dead4left</code>),
              dan generator laporan otomatis.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={handleCopyCode}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900" />
                  <span>Kode Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Seluruh Kode.gs</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCode}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Code.gs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        {[
          { id: 'panduan', label: '📖 Panduan Pemasangan di Google Sheets', icon: BookOpen },
          { id: 'struktur', label: '🗂️ Struktur 5 Sheet Database', icon: Layers },
          { id: 'koneksi', label: '🔗 Pengaturan Koneksi Web App URL', icon: Globe }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveGuideTab(tab.id as any)}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeGuideTab === tab.id
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Guide Tab Content 1: Step-by-Step Deployment */}
      {activeGuideTab === 'panduan' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Langkah-Langkah Memasang Code.gs ke Google Sheets SMAN 27 Garut
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Buka Google Sheets</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Buka browser Anda dan buat Spreadsheet baru di Google Drive Anda. Beri judul misalnya{' '}
                  <span className="font-semibold text-emerald-950">"Database Adiwiyata SMAN 27 Garut"</span>.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-emerald-700 font-medium">
                Tip: Tidak perlu membuat 5 sheet manual karena script otomatis membuatnya.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Buka Apps Script</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Pada menu bar Google Sheets di bagian atas, klik menu{' '}
                  <span className="font-semibold text-emerald-950">Ekstensi (Extensions)</span> &gt;{' '}
                  <span className="font-semibold text-emerald-950">Apps Script</span>.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-emerald-700 font-medium">
                Jendela editor Google Apps Script akan terbuka di tab baru.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Paste Code & Inisialisasi</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Hapus fungsi bawaan di <code className="text-emerald-900 font-bold">Code.gs</code>, lalu paste seluruh isi kode di bawah. Klik tombol <strong>Simpan (Ctrl+S)</strong>. Pilih fungsi <code className="text-emerald-900 font-bold">initSheets</code> lalu klik <strong>Jalankan (Run)</strong> satu kali untuk membuat sheet & header otomatis.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-emerald-700 font-medium">
                Pilih Akun & berikan izin akses spreadsheet saat popup otorisasi muncul.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                  4
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Deploy Web App</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan baru (New deployment)</strong>. Pilih jenis <strong>Aplikasi web (Web app)</strong>. Setel <em>Jalankan sebagai</em>: <strong>Saya (Me)</strong>, dan <em>Yang memiliki akses</em>: <strong>Siapa saja (Anyone)</strong>.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-emerald-700 font-medium">
                Salin Web App URL yang dihasilkan!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Tab Content 2: Database Structure */}
      {activeGuideTab === 'struktur' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Struktur 5 Sheet Database yang Diatur Otomatis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-900 text-sm mb-1">1. Sheet "Absensi_Umum"</div>
              <p className="text-slate-500 mb-2">Pencatatan kehadiran harian seluruh pegawai</p>
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <div>• ID (Primary Key)</div>
                <div>• Timestamp</div>
                <div>• Date</div>
                <div>• Nama_Pegawai</div>
                <div>• Status_Kehadiran (Hadir/Izin/Sakit/Alpa)</div>
                <div>• Catatan</div>
                <div>• Catatan_Khusus_Admin</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-900 text-sm mb-1">2. Sheet "Absensi_SubBidang"</div>
              <p className="text-slate-500 mb-2">Penugasan divisi khusus pemilahan sampah</p>
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <div>• ID (Primary Key)</div>
                <div>• Timestamp</div>
                <div>• Date</div>
                <div>• Nama_Pegawai</div>
                <div>• Bidang (Botol / Plastik Halus / Organik)</div>
                <div>• Status</div>
                <div>• Catatan</div>
                <div>• Catatan_Khusus_Admin</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-900 text-sm mb-1">3. Sheet "Timbangan_Sampah"</div>
              <p className="text-slate-500 mb-2">Data berat sampah masuk per kategori</p>
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <div>• ID (Primary Key)</div>
                <div>• Timestamp</div>
                <div>• Date</div>
                <div>• Jenis_Sampah (Botol / Plastik Halus / Organik)</div>
                <div>• Berat_KG (Angka desimal)</div>
                <div>• Petugas</div>
                <div>• Catatan</div>
                <div>• Catatan_Khusus_Admin</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-900 text-sm mb-1">4. Sheet "Produk_Hasil"</div>
              <p className="text-slate-500 mb-2">Hasil pengolahan sampah daur ulang & biopori</p>
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <div>• ID (Primary Key)</div>
                <div>• Timestamp</div>
                <div>• Date</div>
                <div>• Jenis_Produk (Air lindi / Pupuk Kompos / Barang Daur Ulang)</div>
                <div>• Satuan (Liter / Kilogram / Jumlah Barang)</div>
                <div>• Jumlah</div>
                <div>• Petugas</div>
                <div>• Catatan</div>
                <div>• Catatan_Khusus_Admin</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-900 text-sm mb-1">5. Sheet "Master_Pegawai"</div>
              <p className="text-slate-500 mb-2">Daftar staf resmi Adiwiyata SMAN 27 Garut</p>
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <div>• ID_Pegawai (PEG-001, dst)</div>
                <div>• Nama_Pegawai</div>
              </div>
              <div className="mt-3 p-2 bg-emerald-100/60 rounded text-[11px] text-emerald-900">
                Dapat diedit / ditambah / dihapus oleh Admin dengan password <code>dead4left</code>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Tab Content 3: Web App URL Connector */}
      {activeGuideTab === 'koneksi' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Hubungkan ke Google Apps Script Web App Live
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan URL endpoint hasil deployment Google Apps Script Anda untuk sinkronisasi langsung dengan Google Sheets
              </p>
            </div>

            {/* Toggle Mode Button */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Mode Live API:</span>
              <button
                onClick={() => onToggleLiveApi(!useLiveApi)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useLiveApi ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useLiveApi ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Web App Google Apps Script:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={apiUrl}
                  onChange={e => setApiUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveApiUrl}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  Simpan URL
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Radio className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{testResult.success ? 'Koneksi Berhasil' : 'Koneksi Gagal'}</div>
                  <div className="mt-0.5">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete Code Viewer Section */}
      <div className="bg-slate-950 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        {/* Code Toolbar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          {/* File Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'Code.gs' as const, label: 'Code.gs (Backend)', desc: 'Apps Script' },
              { id: 'app.js' as const, label: 'app.js (Client Integration)', desc: 'JavaScript' },
              { id: 'index.html' as const, label: 'index.html (Frontend)', desc: 'HTML5/Tailwind' }
            ].map(file => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                  selectedFile === file.id
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.label}</span>
              </button>
            ))}
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              {currentContent.split('\n').length} baris
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : `Salin ${selectedFile}`}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh {selectedFile}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="max-h-[600px] overflow-y-auto p-4 sm:p-6 font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          <pre className="text-slate-200 select-all whitespace-pre-wrap font-mono text-[11px] sm:text-xs">
            {currentContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
