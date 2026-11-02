/**
 * Standalone index.html export for Google Apps Script HTML Service and direct hosting.
 */

export const STANDALONE_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adiwiyata - Divisi Pengelolaan Sampah SMAN 27 GARUT</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Inter & Outfit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3, h4, .font-heading { font-family: 'Outfit', sans-serif; }

    /* 1. Animasi Tulisan Kerlap-Kerlip (Glowing Flashing Text Effect) */
    @keyframes glowTextEffect {
      0%, 100% {
        text-shadow: 0 0 10px rgba(253, 224, 71, 0.95), 0 0 20px rgba(245, 158, 11, 0.8), 0 0 30px rgba(234, 179, 8, 0.6);
        color: #fef08a;
        transform: scale(1);
      }
      50% {
        text-shadow: 0 0 4px rgba(254, 240, 138, 0.5), 0 0 10px rgba(250, 204, 21, 0.4);
        color: #ffffff;
        transform: scale(1.02);
      }
    }
    .animate-glow-text {
      display: inline-block;
      animation: glowTextEffect 1.8s ease-in-out infinite alternate;
    }

    /* 2. Animasi Running Text (Marquee Effect) */
    @keyframes marqueeSlide {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .animate-marquee {
      display: inline-flex;
      white-space: nowrap;
      animation: marqueeSlide 24s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  </style>
</head>
<body class="bg-slate-100/80 text-slate-900 min-h-screen flex flex-col antialiased">
  <!-- Running Text Marquee: Kebersihan sebagian dari iman -->
  <div class="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 text-xs font-black h-7 px-4 shadow-sm border-b border-amber-500 overflow-hidden flex items-center">
    <div class="w-full overflow-hidden whitespace-nowrap">
      <div class="animate-marquee items-center gap-8 text-[11px] sm:text-xs">
        <span>🌿 "Kebersihan sebagian dari iman"</span>
        <span class="text-amber-800">•</span>
        <span>🏫 Adiwiyata Mandiri SMAN 27 GARUT - Sekolah Bersih, Hijau & Lestari</span>
        <span class="text-amber-800">•</span>
        <span>♻️ Pilah Sampah Jadi Berkah: Botol, Plastik Halus & Organik</span>
        <span class="text-amber-800">•</span>
        <span>🌿 "Kebersihan sebagian dari iman"</span>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header class="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl sticky top-0 z-40 border-b border-emerald-600/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Logo SMAN 27 Garut Utuh & Proporsional -->
        <div class="flex items-center gap-3.5 sm:gap-4">
          <div class="shrink-0 flex items-center justify-center p-1.5 bg-white/95 rounded-2xl shadow-md border-2 border-amber-300">
            <img src="/logo_sman27_garut.svg" 
                 alt="Logo SMAN 27 Garut" 
                 class="h-14 sm:h-16 w-auto object-contain drop-shadow" 
                 onerror="this.src='/sman27_garut_logo.jpg';">
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs sm:text-sm font-black tracking-wide uppercase animate-glow-text">
                ✨ Selamat Datang di Divisi Pengelolaan Sampah ✨
              </span>
            </div>
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5 font-heading">
              SMAN 27 GARUT
              <span class="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Adiwiyata Mandiri
              </span>
            </h1>
            <p class="text-xs text-emerald-200/90 font-medium">
              Sistem Terpadu Absensi, Timbangan Sampah & Produk Olahan Daur Ulang berbasis Google Apps Script
            </p>
          </div>
        </div>

        <!-- Date & Admin Status -->
        <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div class="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/50 rounded-2xl p-1.5 sm:px-3 sm:py-1.5 shadow-inner">
            <span class="text-xs font-semibold text-emerald-300 hidden sm:inline">📅 Tanggal:</span>
            <input type="date" id="dateSelector" class="bg-emerald-900/90 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer">
            <button id="btnTodayDate" class="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-400 text-slate-950 shadow transition hover:bg-amber-300">
              🟢 Hari Ini
            </button>
          </div>
          <div id="adminStatusContainer">
            <button onclick="openModal('modalAdminLogin')" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 border border-emerald-500/60 text-xs text-amber-200 hover:text-white font-bold transition shadow-sm">
              <span>🛡️ Login Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
  <!-- Menus 1 to 6 follow standard tab layout -->
</body>
</html>
`;

export const STANDALONE_HTML_SOURCE = STANDALONE_INDEX_HTML;
