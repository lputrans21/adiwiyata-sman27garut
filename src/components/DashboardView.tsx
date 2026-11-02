import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  UserCheck,
  Calendar,
  Download,
  Droplets,
  Sprout,
  Package,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  ReportPeriod,
  ActiveTab,
  AbsensiUmumRecord,
  AbsensiSubBidangRecord,
  TimbanganSampahRecord,
  ProdukHasilRecord
} from '../types';
import {
  isDateWithinPeriod,
  calculateTimbanganSummary,
  calculateProdukSummary,
  calculateKehadiranSummary,
  formatDate
} from '../utils/adiwiyataLogic';
import { DataService } from '../services/dataService';

interface DashboardViewProps {
  absensiUmum: AbsensiUmumRecord[];
  absensiSub: AbsensiSubBidangRecord[];
  timbangan: TimbanganSampahRecord[];
  produk: ProdukHasilRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  absensiUmum,
  absensiSub,
  timbangan,
  produk,
  setActiveTab,
  onRefresh,
  selectedDate,
  onDateChange
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('harian');

  // Filter records according to selected period
  const refDateObj = new Date(selectedDate + 'T00:00:00');

  const filteredTimbangan = timbangan.filter(r => isDateWithinPeriod(r.Date, period, refDateObj));
  const filteredProduk = produk.filter(r => isDateWithinPeriod(r.Date, period, refDateObj));
  const filteredAbsensi = absensiUmum.filter(r => isDateWithinPeriod(r.Date, period, refDateObj));
  const filteredSub = absensiSub.filter(r => isDateWithinPeriod(r.Date, period, refDateObj));

  const timbanganSummary = calculateTimbanganSummary(filteredTimbangan);
  const produkSummary = calculateProdukSummary(filteredProduk);
  const kehadiranSummary = calculateKehadiranSummary(filteredAbsensi);

  const totalPetugas = filteredAbsensi.length;
  const hadirCount = kehadiranSummary.Hadir;
  const attendanceRate = totalPetugas > 0 ? Math.round((hadirCount / totalPetugas) * 100) : 0;

  // Percentage for waste breakdown
  const botolKg = timbanganSummary.breakdown['Botol'] || 0;
  const plastikKg = timbanganSummary.breakdown['Plastik Halus'] || 0;
  const organikKg = timbanganSummary.breakdown['Organik'] || 0;
  const hasWasteData = timbanganSummary.totalKg > 0;
  const totalKg = hasWasteData ? timbanganSummary.totalKg : 1; // avoid division by 0

  const botolPct = hasWasteData ? Math.round((botolKg / totalKg) * 100) : 0;
  const plastikPct = hasWasteData ? Math.round((plastikKg / totalKg) * 100) : 0;
  const organikPct = hasWasteData ? Math.round((organikKg / totalKg) * 100) : 0;


  return (
    <div className="space-y-6">
      {/* 3D Cartoon Hero Card - SMA Students Eco Theme */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-emerald-600/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Gerakan Peduli & Berbudaya Lingkungan Hidup di Sekolah (PBLHS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Bersama Siswa-Siswi Hebat SMAN 27 GARUT, Pilah & Olah Sampah dari Sumbernya!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Mewujudkan sekolah hijau, bersih, dan asri melalui pemilahan botol plastik, plastik halus, dan pengolahan sampah organik menjadi pupuk kompos serta air lindi berkualitas tinggi.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-semibold text-emerald-200">
              🧴 Botol Plastik PET
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-semibold text-emerald-200">
              🛍️ Plastik Halus
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-semibold text-emerald-200">
              🍂 Kompos & Air Lindi
            </span>
          </div>
        </div>
        <div className="shrink-0 w-full md:w-80 lg:w-96">
          <img
            src="/sma_students_eco.jpg"
            alt="Ilustrasi Siswa SMA Adiwiyata SMAN 27 Garut"
            className="w-full h-48 sm:h-52 object-cover rounded-2xl shadow-2xl border-2 border-emerald-400/60 transform hover:scale-[1.02] transition duration-300"
          />
        </div>
      </div>

      {/* Top Filter and Actions Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mb-1">
            Menu 5: Laporan Realtime
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-emerald-950 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Laporan Realtime Operasional Adiwiyata
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Agregasi data seluruh sub-menu (Harian, Mingguan, Bulanan) SMAN 27 Garut
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {(['harian', 'mingguan', 'bulanan'] as ReportPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  period === p
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => onDateChange(e.target.value)}
              className="bg-transparent border-none text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sampah Masuk */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Total Sampah Terkumpul
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-950 font-mono">
                  {timbanganSummary.totalKg.toLocaleString('id-ID')}
                </span>
                <span className="text-sm font-bold text-emerald-700">KG</span>
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                Dari {timbanganSummary.count} kali penimbangan ({period})
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700">
              <Scale className="w-6 h-6" />
            </div>
          </div>
          <button
            onClick={() => setActiveTab('timbangan')}
            className="mt-4 w-full py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-200/50 hover:bg-emerald-200 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Buka Menu 3: Timbangan
          </button>
        </div>

        {/* Pupuk Kompos */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Pupuk Kompos Organik
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-950 font-mono">
                  {produkSummary.summary['Pupuk Kompos'].jumlah.toLocaleString('id-ID')}
                </span>
                <span className="text-sm font-bold text-amber-700">KG</span>
              </div>
              <p className="text-xs text-amber-700/80 mt-1">
                Hasil biopori & komposter sekolah
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700">
              <Sprout className="w-6 h-6" />
            </div>
          </div>
          <button
            onClick={() => setActiveTab('produk')}
            className="mt-4 w-full py-1.5 text-xs font-semibold text-amber-800 bg-amber-200/50 hover:bg-amber-200 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Buka Menu 4: Produk Kompos
          </button>
        </div>

        {/* Air Lindi */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Pupuk Cair Air Lindi
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950 font-mono">
                  {produkSummary.summary['Air lindi'].jumlah.toLocaleString('id-ID')}
                </span>
                <span className="text-sm font-bold text-blue-700">Liter</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Pupuk organik cair untuk tanaman sekolah
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-700">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
          <button
            onClick={() => setActiveTab('produk')}
            className="mt-4 w-full py-1.5 text-xs font-semibold text-blue-800 bg-blue-200/50 hover:bg-blue-200 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Buka Menu 4: Air Lindi
          </button>
        </div>

        {/* Kehadiran Petugas */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                Kehadiran Petugas
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-purple-950 font-mono">
                  {totalPetugas > 0 ? `${attendanceRate}%` : '0%'}
                </span>
                <span className="text-xs font-semibold text-purple-700">
                  {totalPetugas > 0 ? `(${hadirCount} Hadir)` : '(0 Hadir)'}
                </span>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {totalPetugas > 0
                  ? `${kehadiranSummary.Izin} Izin • ${kehadiranSummary.Sakit} Sakit`
                  : 'Belum ada data presensi periode ini'}
              </p>

            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-700">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <button
            onClick={() => setActiveTab('absensi-umum')}
            className="mt-4 w-full py-1.5 text-xs font-semibold text-purple-800 bg-purple-200/50 hover:bg-purple-200 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Buka Menu 1: Absensi
          </button>
        </div>
      </div>

      {/* Visual Breakdowns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown Sampah Masuk */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Komposisi Sampah Terpilah ({period})
              </h3>
              <p className="text-xs text-slate-500">
                Proporsi pengumpulan botol, plastik halus, dan sampah organik
              </p>
            </div>
            <button
              onClick={() => DataService.exportToCSV('Timbangan_Sampah')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 p-1.5 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
              title="Export CSV Timbangan"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Visual Progress Bar */}
          {hasWasteData ? (
            <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
              <div
                style={{ width: `${Math.max(organikPct, 3)}%` }}
                className="bg-emerald-500 transition-all duration-500 rounded-l-full"
                title={`Organik: ${organikKg} KG (${organikPct}%)`}
              />
              <div
                style={{ width: `${Math.max(botolPct, 3)}%` }}
                className="bg-sky-500 transition-all duration-500"
                title={`Botol: ${botolKg} KG (${botolPct}%)`}
              />
              <div
                style={{ width: `${Math.max(plastikPct, 3)}%` }}
                className="bg-amber-500 transition-all duration-500 rounded-r-full"
                title={`Plastik Halus: ${plastikKg} KG (${plastikPct}%)`}
              />
            </div>
          ) : (
            <div className="h-5 w-full rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60 text-[11px] text-slate-400 font-medium">
              Belum ada data penimbangan untuk periode ini
            </div>
          )}

          {/* Category breakdown items */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-800 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Organik</span>
              </div>
              <div className="text-lg font-black text-emerald-950 font-mono">{organikKg} <span className="text-xs font-normal">KG</span></div>
              <div className="text-[11px] text-emerald-600 font-semibold">{hasWasteData ? `${organikPct}% dari total` : '-'}</div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-sky-800 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                <span>Botol</span>
              </div>
              <div className="text-lg font-black text-sky-950 font-mono">{botolKg} <span className="text-xs font-normal">KG</span></div>
              <div className="text-[11px] text-sky-600 font-semibold">{hasWasteData ? `${botolPct}% dari total` : '-'}</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-800 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Plastik Halus</span>
              </div>
              <div className="text-lg font-black text-amber-950 font-mono">{plastikKg} <span className="text-xs font-normal">KG</span></div>
              <div className="text-[11px] text-amber-600 font-semibold">{hasWasteData ? `${plastikPct}% dari total` : '-'}</div>
            </div>
          </div>

        </div>

        {/* Produk Hasil Output Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Hasil Olahan Daur Ulang ({period})
              </h3>
              <p className="text-xs text-slate-500">
                Pencapaian konversi sampah menjadi produk bermanfaat
              </p>
            </div>
            <button
              onClick={() => DataService.exportToCSV('Produk_Hasil')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 p-1.5 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
              title="Export CSV Produk"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Air Lindi Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Air lindi (Pupuk Cair)</div>
                  <div className="text-[11px] text-slate-500">Fermentasi aerob/anaerob sisa makanan</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-slate-900">
                  {produkSummary.summary['Air lindi'].jumlah}
                </span>
                <span className="text-xs text-slate-600 ml-1 font-medium">Liter</span>
              </div>
            </div>

            {/* Pupuk Kompos Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Pupuk Kompos Padat</div>
                  <div className="text-[11px] text-slate-500">Hasil cacahan daun kering & ranting</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-slate-900">
                  {produkSummary.summary['Pupuk Kompos'].jumlah}
                </span>
                <span className="text-xs text-slate-600 ml-1 font-medium">Kilogram</span>
              </div>
            </div>

            {/* Barang Daur Ulang Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Barang Daur Ulang Kreatif</div>
                  <div className="text-[11px] text-slate-500">Pot hidroponik, kerajinan plastik</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-slate-900">
                  {produkSummary.summary['Barang Daur Ulang'].jumlah}
                </span>
                <span className="text-xs text-slate-600 ml-1 font-medium">Pcs / Barang</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation to Sheet Forms */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-bold text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Kelola Formulir Input Divisi Pengelolaan Sampah SMAN 27 GARUT
            </h4>
            <p className="text-xs text-emerald-200 mt-1">
              Data transaksi terhubung langsung dengan Google Sheets (Absensi Umum, Sub-Bidang, Timbangan, Produk Hasil)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('absensi-umum')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Menu 1: Absensi
            </button>
            <button
              onClick={() => setActiveTab('absensi-sub')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Menu 2: Sub-Bidang
            </button>
            <button
              onClick={() => setActiveTab('timbangan')}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer shadow"
            >
              Menu 3: Timbangan
            </button>
            <button
              onClick={() => setActiveTab('produk')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Menu 4: Produk Hasil
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow"
            >
              Menu 6: Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
