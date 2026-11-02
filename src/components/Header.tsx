import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Radio,
  FileCode,
  LogOut,
  Sparkles,
  Calendar,
  Sparkle
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
  onOpenAdminLogin: () => void;
  useLiveApi: boolean;
  selectedDate: string;
  onDateChange: (newDate: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onAdminLogout,
  onOpenAdminLogin,
  useLiveApi,
  selectedDate,
  onDateChange
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAutoDate, setIsAutoDate] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handleResetToToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
    setIsAutoDate(true);
  };

  const handleManualDateChange = (val: string) => {
    onDateChange(val);
    setIsAutoDate(false);
  };

  return (
    <header className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl border-b border-emerald-600/40 relative overflow-hidden">
      {/* Decorative background glow circle */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      {/* 1. Running Text Marquee: Kebersihan sebagian dari iman */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 text-xs font-black h-7 px-4 shadow-sm border-b border-amber-500 overflow-hidden flex items-center">
        <div className="w-full overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-flex items-center gap-8 whitespace-nowrap leading-none">
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              🌿 "Kebersihan sebagian dari iman"
            </span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              🏫 Adiwiyata Mandiri SMAN 27 GARUT
            </span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              ♻️ Divisi Pengelolaan Sampah: Botol, Plastik Halus & Organik
            </span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              🌿 "Kebersihan sebagian dari iman"
            </span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              ✨ Pilah & Olah Sampah dari Sumbernya
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & School Title with Glowing Welcome */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Logo SMAN 27 Garut Image (Utuh dan Proporsional) */}
            <div className="shrink-0 flex items-center justify-center p-1 bg-white/95 rounded-2xl shadow-md border-2 border-amber-300">
              <img
                src="/logo_sman27_garut.svg"
                alt="Logo SMAN 27 Garut"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/sman27_garut_logo.jpg';
                }}
              />
            </div>

            {/* School Info & Glowing "Selamat Datang" */}
            <div>
              {/* Animasi Kerlap-Kerlip Ucapan Selamat Datang */}
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin text-shadow" />
                <span className="text-xs sm:text-sm font-black tracking-wide uppercase animate-glow-text">
                  ✨ Selamat Datang di Divisi Pengelolaan Sampah ✨
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                SMAN 27 GARUT
                <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Adiwiyata Mandiri
                </span>
              </h1>
              <p className="text-xs text-emerald-200/90 font-medium">
                Sistem Terpadu Absensi, Timbangan Sampah & Produk Olahan Daur Ulang
              </p>
            </div>
          </div>

          {/* Right Section: Date Widget & Control Badges */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Automatic Online Date Selector + Manual Picker */}
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/50 rounded-2xl p-1.5 sm:px-3 sm:py-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-semibold hidden sm:inline">Tanggal Operasional:</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleManualDateChange(e.target.value)}
                className="bg-emerald-900/90 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                title="Pilih tanggal manual atau klik tombol Hari Ini"
              />
              <button
                type="button"
                onClick={handleResetToToday}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                  isAutoDate
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'
                }`}
                title="Sinkronkan dengan tanggal online saat ini"
              >
                {isAutoDate ? '🟢 Hari Ini' : 'Set Hari Ini'}
              </button>
            </div>

            {/* Live Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-xs text-emerald-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formattedTime}</span>
            </div>

            {/* Admin Badge */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl px-3 py-1.5 text-xs shadow-md border border-amber-300">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Admin Aktif</span>
                <button
                  onClick={onAdminLogout}
                  title="Logout Admin"
                  className="ml-1 p-0.5 hover:bg-amber-600 rounded text-slate-950"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-500/60 text-xs text-amber-200 hover:text-white font-bold transition shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
