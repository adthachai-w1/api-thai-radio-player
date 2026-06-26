import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Shuffle,
  Repeat,
  Users,
  Radio as RadioIcon,
  Phone,
  MapPin,
  Facebook,
  Youtube,
  Globe,
  User,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Wifi,
  X,
  Megaphone,
  Navigation,
  Home,
  ExternalLink,
  Menu,
  ChevronRight,
  ShoppingBasket,
  Signal,
} from 'lucide-react';
import iconKaew from "./images/icon-kaew.png";
import { motion, AnimatePresence } from 'motion/react';
import COVER_IMAGE_URL from "./images/photo-1.png";

// ─── Leaflet Map Component ───────────────────────────────────────────────────
function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = (window as any).L;
      const isMobile = window.innerWidth < 768;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([LAT, LNG], isMobile ? 13 : 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      const customIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:#7D9D85;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(125,157,133,0.5)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([LAT, LNG], { icon: customIcon })
        .addTo(map)
        .bindPopup('<b style="color:#2D5538">กู่แก้ววิทยุ FM 93.00</b><br>อำเภอกู่แก้ว อุดรธานี')
        .openPopup();
      mapInstanceRef.current = map;
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STREAM_URL = "https://uk5freenew.listen2myradio.com/live.mp3?typeportmount=s1_13082_stream_820118366";
const UNLOCK_URL = "https://fm93kukeawradio.radio12345.com/";
const LAT = 17.170219;
const LNG = 103.160999;
const MAPS_LINK = `https://www.google.com/maps?q=${LAT},${LNG}`;
const SHOPEE_URL = "https://collshp.com/adthachai943/category/3857411?view=storefront";

type Page = 'home' | 'contact';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showUnlockFrame, setShowUnlockFrame] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [unlockLoaded, setUnlockLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intentionalStopRef = useRef(false);
  const retryCountRef = useRef(0);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RETRIES = 3;
  const STALL_WAIT_MS = 8000;
  const LOAD_TIMEOUT_MS = 45000;

  const loadStream = () => {
    if (!audioRef.current) return;
    audioRef.current.src = `${STREAM_URL}&t=${Date.now()}`;
    audioRef.current.load();
  };

  const clearStallTimer = () => {
    if (stallTimerRef.current) { clearTimeout(stallTimerRef.current); stallTimerRef.current = null; }
  };

  const showFailureModal = () => {
    setIsPlaying(false);
    setIsLoading(false);
    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current++;
      setTimeout(() => {
        if (!intentionalStopRef.current) {
          setIsLoading(true);
          loadStream();
          audioRef.current?.play().catch(() => showFailureModal());
        }
      }, 2000);
    } else {
      setShowSimModal(true);
    }
  };

  const handleCanPlay = () => {
    clearStallTimer();
    if (!intentionalStopRef.current) {
      setIsLoading(false);
    }
  };

  const handlePlaying = () => {
    clearStallTimer();
    setIsLoading(false);
    setIsPlaying(true);
  };

  const handleStall = () => {
    if (intentionalStopRef.current) return;
    clearStallTimer();
    stallTimerRef.current = setTimeout(() => {
      if (!intentionalStopRef.current) showFailureModal();
    }, STALL_WAIT_MS);
  };

  const handleError = () => {
    if (!intentionalStopRef.current) showFailureModal();
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.oncanplay = handleCanPlay;
    audioRef.current.onplaying = handlePlaying;
    audioRef.current.onstalled = handleStall;
    audioRef.current.onwaiting = handleStall;
    audioRef.current.onerror = handleError;
    audioRef.current.preload = "none";
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const consent = localStorage.getItem('kukaew_cookie_consent');
    if (!consent) setShowCookieConsent(true);
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      clearStallTimer();
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      intentionalStopRef.current = true;
      clearStallTimer();
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      setIsPlaying(false);
      setIsLoading(false);
      retryCountRef.current = 0;
      setTimeout(() => { intentionalStopRef.current = false; }, 500);
    } else {
      intentionalStopRef.current = false;
      retryCountRef.current = 0;
      setIsLoading(true);
      setShowClosedModal(false);
      setShowSimModal(false);

      if (!unlockLoaded) {
        await new Promise(res => setTimeout(res, 3000));
      }

      loadingTimeoutRef.current = setTimeout(() => {
        if (!audioRef.current || audioRef.current.paused) showFailureModal();
      }, LOAD_TIMEOUT_MS);

      loadStream();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; }
        })
        .catch(err => {
          if (err.name !== 'AbortError') showFailureModal();
        });
    }
  };

  const retryAfterUnlock = () => {
    setShowSimModal(false);
    setShowUnlockFrame(false);
    retryCountRef.current = 0;
    setTimeout(() => togglePlay(), 1000);
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  const adjustVolume = (amount: number) => {
    setVolume(prev => {
      const next = Math.min(1, Math.max(0, prev + amount));
      if (next > 0) setIsMuted(false);
      return next;
    });
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('kukaew_cookie_consent', 'accepted');
    setShowCookieConsent(false);
  };

  const navigateTo = (p: Page) => {
    setPage(p);
    setMobileMenuOpen(false);
  };

  // ─── Waveform bars data (staggered heights) ─────────────────────────────
  const barHeights = [14, 28, 18, 36, 22, 40, 16, 32, 24, 38, 12, 30, 20, 34];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F6] font-sans">

      {/* ─── INJECT PREMIUM STYLES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900;1,14..32,300&display=swap');

        * { font-family: 'Inter', 'Sarabun', sans-serif; }

        :root {
          --green: #7D9D85;
          --green-dark: #5E8067;
          --green-deeper: #3D6B4F;
          --green-glow: rgba(125,157,133,0.35);
          --bg: #F7F8F6;
          --surface: #FFFFFF;
          --text: #1A2318;
        }

        .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }

        .play-glow {
          box-shadow: 0 0 0 0 var(--green-glow);
          transition: box-shadow 0.3s ease;
        }
        .play-glow.active {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 var(--green-glow), 0 8px 32px rgba(125,157,133,0.4); }
          50% { box-shadow: 0 0 0 20px transparent, 0 8px 48px rgba(125,157,133,0.6); }
        }

        .glass-premium {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        }

        .nav-link {
          position: relative;
          font-weight: 600;
          font-size: 0.875rem;
          transition: color 0.2s;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.02em;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #7D9D85;
          border-radius: 1px;
          transition: width 0.25s ease;
        }
        .nav-link.active { color: white; }
        .nav-link.active::after { width: 100%; }
        .nav-link:hover:not(.active) { color: rgba(255,255,255,0.85); }

        .badge-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: #ff6b6b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .badge-live .dot {
          width: 6px; height: 6px;
          background: #ef4444;
          border-radius: 50%;
          animation: blink 1.2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .contact-card {
          background: white;
          border: 1px solid rgba(74,93,79,0.08);
          border-radius: 20px;
          padding: 24px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(74,93,79,0.12);
        }

        .footer-dark {
          background: #4A7055;
        }
      `}</style>

      {/* Hidden iframe unlock */}
      <iframe
        src={UNLOCK_URL}
        title="bg-unlock"
        onLoad={() => setUnlockLoaded(true)}
        sandbox="allow-scripts allow-same-origin"
        style={{ position: 'fixed', top: -9999, left: -9999, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />

      <audio
        ref={audioRef}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onStalled={handleStall}
        onWaiting={handleStall}
        onError={handleError}
        preload="none"
      />

      {/* ─── PREMIUM HEADER ─── */}
      <header style={{ background: '#7D9D85', borderBottom: '1px solid rgba(255,255,255,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20">
              <img src={iconKaew} alt="Kukaew" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none tracking-wider">KUKAEW RADIO</div>
              <div className="text-white/40 text-[10px] tracking-widest mt-0.5 font-medium">FM 93.00 MHz</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-10">
            <button onClick={() => navigateTo('home')} className={`nav-link ${page === 'home' ? 'active' : ''}`}>หน้าแรก</button>
            <button onClick={() => navigateTo('contact')} className={`nav-link ${page === 'contact' ? 'active' : ''}`}>ติดต่อโฆษณา</button>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(125,157,133,0.15)', border: '1px solid rgba(125,157,133,0.2)' }}>
              <Users size={12} className="text-green-400" />
              <span className="text-xs font-semibold text-white/70">1,254</span>
            </div>
            <div className="badge-live">
              <span className="dot" />
              LIVE
            </div>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ borderTop: '1px solid rgba(255,255,255,0.15)', background: '#7D9D85' }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                <button onClick={() => navigateTo('home')} className={`text-left py-3 px-4 rounded-xl font-semibold text-sm transition-all ${page === 'home' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                  หน้าแรก
                </button>
                <button onClick={() => navigateTo('contact')} className={`text-left py-3 px-4 rounded-xl font-semibold text-sm transition-all ${page === 'contact' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                  ติดต่อโฆษณา
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── PAGES ─── */}
      <AnimatePresence mode="wait">

        {/* ═══ HOME PAGE ═══ */}
        {page === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col">

            {/* HERO PLAYER — Dark forest stage */}
            <section className="relative overflow-hidden noise-bg" style={{ background: 'linear-gradient(135deg, #6B9070 0%, #7D9D85 50%, #8FAF96 100%)', minHeight: '520px' }}>

              {/* Ambient radial glows */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7D9D85 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a0c4a9 0%, transparent 70%)' }} />
              </div>

              <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col md:flex-row items-center gap-10 md:gap-16">

                {/* Cover Art */}
                <div className="flex-shrink-0 relative group">
                  {/* Outer glow ring when playing */}
                  <motion.div
                    animate={isPlaying ? { scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] } : { scale: 1, opacity: 0 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-[-12px] rounded-[36px]"
                    style={{ background: 'radial-gradient(circle, rgba(125,157,133,0.4) 0%, transparent 70%)' }}
                  />
                  <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-[28px] overflow-hidden shadow-2xl" style={{ border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
                    <img src={COVER_IMAGE_URL} alt="DJ Cover" className="w-full h-full object-cover" />
                    {/* Overlay shimmer */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
                    {/* Like button */}
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{ background: isLiked ? '#ef4444' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                      aria-label="ถูกใจ"
                    >
                      <Heart size={18} fill={isLiked ? 'white' : 'none'} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-6 text-white w-full">

                  {/* Track info */}
                  <div className="text-center md:text-left">
                    <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                      <div className="badge-live"><span className="dot" />LIVE ON AIR</div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">กู่แก้ววิทยุ</h2>
                    <p className="text-white/50 text-sm mt-1 tracking-wider font-medium">FM 93.00 MHz · เพลงลูกทุ่ง · หมอลำ</p>
                  </div>

                  {/* Waveform visualizer */}
                  <div className="flex items-end gap-[3px] h-10">
                    {barHeights.map((h, i) => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? { height: [4, h, h * 0.5, h * 0.8, 4] } : { height: 3 }}
                        transition={isPlaying ? { duration: 1.2, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' } : { duration: 0.4 }}
                        className="rounded-full flex-shrink-0"
                        style={{ width: '3px', background: `rgba(125,157,133,${isPlaying ? 0.9 : 0.3})` }}
                      />
                    ))}
                  </div>

                  {/* Transport controls */}
                  <div className="flex items-center gap-5">
                    <button className="text-white/30 hover:text-white/60 transition-colors" aria-label="สุ่มเพลง">
                      <Shuffle size={18} />
                    </button>
                    <button className="text-white/40 hover:text-white/70 transition-colors" aria-label="เพลงก่อนหน้า">
                      <SkipBack size={22} fill="currentColor" />
                    </button>

                    {/* Main play button */}
                    <button
                      onClick={togglePlay}
                      className={`play-glow relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${isPlaying ? 'active' : ''}`}
                      style={{ background: 'linear-gradient(135deg, #8FAF96 0%, #7D9D85 100%)', boxShadow: isPlaying ? '0 8px 32px rgba(125,157,133,0.5)' : '0 4px 16px rgba(0,0,0,0.3)' }}
                      aria-label={isPlaying ? 'หยุด' : 'เล่น'}
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : isPlaying ? (
                        <Pause size={28} fill="white" className="text-white" />
                      ) : (
                        <Play size={28} fill="white" className="text-white ml-1" />
                      )}
                    </button>

                    <button className="text-white/40 hover:text-white/70 transition-colors" aria-label="เพลงถัดไป">
                      <SkipForward size={22} fill="currentColor" />
                    </button>
                    <button className="text-white/30 hover:text-white/60 transition-colors" aria-label="เล่นซ้ำ">
                      <Repeat size={18} />
                    </button>
                  </div>

                  {/* Volume control */}
                  <div className="flex items-center gap-3 w-full max-w-[240px]">
                    <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors flex-shrink-0" aria-label={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}>
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolume(v);
                          if (v > 0) setIsMuted(false);
                        }}
                        className="volume-slider w-full"
                        style={{
                          background: `linear-gradient(to right, #7D9D85 0%, #7D9D85 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) 100%)`
                        }}
                      />
                    </div>
                    <span className="text-white/40 text-xs font-bold w-8 text-right tabular-nums">
                      {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── FEATURE CARDS STRIP ─── */}
            <section className="py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Card 1 - Frequency */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="contact-card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(125,157,133,0.15), rgba(74,93,79,0.1))' }}>
                    <RadioIcon size={22} style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--green)' }}>ความถี่</p>
                    <p className="font-black text-xl" style={{ color: '#2D5538' }}>FM 93.00</p>
                    <p className="text-xs text-gray-400">MHz · ออกอากาศ 24 ชม.</p>
                  </div>
                </motion.div>

                {/* Card 2 - Listeners */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="contact-card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(125,157,133,0.15), rgba(74,93,79,0.1))' }}>
                    <Users size={22} style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--green)' }}>ผู้ฟัง</p>
                    <p className="font-black text-xl" style={{ color: '#2D5538' }}>1,254+</p>
                    <p className="text-xs text-gray-400">ผู้ฟังออนไลน์ขณะนี้</p>
                  </div>
                </motion.div>

                {/* Card 3 - Signal */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="contact-card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(125,157,133,0.15), rgba(74,93,79,0.1))' }}>
                    <Signal size={22} style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--green)' }}>สัญญาณ</p>
                    <p className="font-black text-xl" style={{ color: '#2D5538' }}>ยอดเยี่ยม</p>
                    <p className="text-xs text-gray-400">HD Quality · No Ads</p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ─── ABOUT SECTION ─── */}
            <section className="py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
              <div className="rounded-[24px] overflow-hidden" style={{ background: 'white', border: '1px solid rgba(74,93,79,0.08)' }}>
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--green)' }}>เกี่ยวกับเรา</p>
                    <h3 className="text-2xl font-black mb-4" style={{ color: '#2D5538' }}>เสียงแห่งจิตวิญญาณอีสาน</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">
                      กู่แก้ววิทยุ FM 93.00 MHz คือสถานีวิทยุชุมชนที่นำเสนอเพลงหมอลำ ลูกทุ่งอีสาน และข่าวสารท้องถิ่น ครอบคลุมพื้นที่อำเภอกู่แก้ว จังหวัดอุดรธานี และบริเวณใกล้เคียง พร้อมออกอากาศออนไลน์ให้ฟังได้ทั่วโลก
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(125,157,133,0.1)', color: '#5E8067' }}>หมอลำ</span>
                      <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(125,157,133,0.1)', color: '#5E8067' }}>ลูกทุ่ง</span>
                      <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(125,157,133,0.1)', color: '#5E8067' }}>ข่าวชุมชน</span>
                      <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(125,157,133,0.1)', color: '#5E8067' }}>ออนไลน์ 24/7</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-4 min-w-[180px]">
                    <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--bg)' }}>
                      <p className="text-3xl font-black" style={{ color: 'var(--green)' }}>93.0</p>
                      <p className="text-xs text-gray-400 font-semibold tracking-wider">MHz FM</p>
                    </div>
                    <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--bg)' }}>
                      <p className="text-3xl font-black" style={{ color: 'var(--green)' }}>24/7</p>
                      <p className="text-xs text-gray-400 font-semibold tracking-wider">ออกอากาศ</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="footer-dark text-white mt-auto">
              <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Brand */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
                      <img src={iconKaew} alt="Kukaew" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div>
                      <div className="font-bold text-base tracking-wide">KUKAEW RADIO</div>
                      <div className="text-white/40 text-xs">FM 93.00 MHz</div>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">
                    นำเสนอเสียงเพลงแห่งจิตวิญญาณอีสานแท้ๆ ทั้งหมอลำ ลูกทุ่ง และบรรยากาศชุมชน
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="font-bold text-sm tracking-wider uppercase text-white/60 mb-5">ติดต่อเรา</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-white/60">
                      <Phone size={15} style={{ color: 'var(--green)' }} />
                      0819853404
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white/60">
                      <MapPin size={15} style={{ color: 'var(--green)' }} />
                      อำเภอกู่แก้ว, จังหวัดอุดรธานี
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white/60">
                      <User size={15} style={{ color: 'var(--green)' }} />
                      จ่าเยี่ยม คนโก้
                    </li>
                  </ul>
                </div>

                {/* Social */}
                <div>
                  <h3 className="font-bold text-sm tracking-wider uppercase text-white/60 mb-5">ติดตามเรา</h3>
                  <div className="flex gap-3 mb-6">
                    <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Facebook size={18} className="text-white/70" />
                    </a>
                    <a href="https://s.shopee.co.th/30lJC2Kxaa?share_channel_code=6" target="_blank" rel="noopener noreferrer" aria-label="Shopee"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src="https://cdn.simpleicons.org/shopee/FFFFFF" alt="Shopee" className="w-4 h-4 opacity-70" />
                    </a>
                    <a href="#" aria-label="Youtube" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Youtube size={18} className="text-white/70" />
                    </a>
                  </div>
                  <button onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: '#7D9D85', color: 'white' }}>
                    <Megaphone size={15} />
                    ลงโฆษณา
                  </button>
                </div>
              </div>

              <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
                  <p>© 2024 กู่แก้ววิทยุ FM 93.00 MHz. สงวนลิขสิทธิ์</p>
                  <div className="flex gap-6">
                    <a href="#" className="hover:text-white/60 transition-colors">นโยบายความเป็นส่วนตัว</a>
                    <a href="#" className="hover:text-white/60 transition-colors">ข้อกำหนดการใช้งาน</a>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {/* ═══ CONTACT PAGE ═══ */}
        {page === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>

            {/* Page Hero */}
            <div className="noise-bg relative overflow-hidden py-14 px-4 md:px-8"
              style={{ background: 'linear-gradient(135deg, #6B9070 0%, #7D9D85 100%)' }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[40%] h-full opacity-10" style={{ background: 'radial-gradient(circle at 80% 50%, #7D9D85 0%, transparent 70%)' }} />
              </div>
              <div className="relative z-10 max-w-5xl mx-auto">
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--green)' }}>Get In Touch</p>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">ติดต่อโฆษณา</h1>
                <p className="text-white/50 text-sm">สถานีวิทยุกู่แก้วเรดิโอ FM 93.00 MHz · อุดรธานี</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-10 space-y-8">

              {/* Contact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="contact-card flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(125,157,133,0.15), rgba(74,93,79,0.08))' }}>
                    <User size={26} style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--green)' }}>ผู้จัดการสถานี</p>
                    <p className="font-bold text-lg" style={{ color: '#2D5538' }}>จ่าเยี่ยม คนโก้</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="contact-card flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(125,157,133,0.15), rgba(74,93,79,0.08))' }}>
                    <Phone size={26} style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--green)' }}>โทรศัพท์</p>
                    <a href="tel:0819853404" className="font-bold text-lg hover:underline" style={{ color: '#2D5538' }}>081-985-3404</a>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="contact-card flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(125,157,133,0.15), rgba(74,93,79,0.08))' }}>
                    <MapPin size={26} style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--green)' }}>ที่ตั้ง</p>
                    <p className="font-bold text-base" style={{ color: '#2D5538' }}>อำเภอกู่แก้ว</p>
                    <p className="text-gray-400 text-sm">จังหวัดอุดรธานี</p>
                  </div>
                </motion.div>
              </div>

              {/* Map */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="rounded-[24px] overflow-hidden" style={{ border: '1px solid rgba(74,93,79,0.08)' }}>
                <div className="h-[300px] md:h-[380px]">
                  <LeafletMap />
                </div>
                <div className="p-5 flex items-center justify-between" style={{ background: 'white' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(125,157,133,0.1)' }}>
                      <MapPin size={16} style={{ color: 'var(--green)' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#2D5538' }}>กู่แก้ววิทยุ FM 93.00</p>
                      <p className="text-xs text-gray-400">อำเภอกู่แก้ว อุดรธานี</p>
                    </div>
                  </div>
                  <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:opacity-80"
                    style={{ background: '#7D9D85', color: 'white' }}>
                    <Navigation size={13} />
                    นำทาง
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Footer same as home */}
            <footer className="footer-dark text-white mt-8">
              <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10">
                      <img src={iconKaew} alt="Kukaew" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">KUKAEW RADIO FM 93.00</span>
                  </div>
                  <p className="text-xs text-white/30">© 2024 กู่แก้ววิทยุ. สงวนลิขสิทธิ์</p>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── SIM MODAL ─── */}
      <AnimatePresence>
        {showSimModal && !showUnlockFrame && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSimModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative z-10 bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(125,157,133,0.12)' }}>
                <Wifi size={32} style={{ color: 'var(--green)' }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: '#2D5538' }}>การเชื่อมต่อผิดพลาด</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                หากมีปัญหาการรับสัญญาณวิทยุ กรุณากดปุ่มด้านล่างเพื่อเปิดรับสัญญาณ แล้วกลับมากด <strong style={{ color: 'var(--green)' }}>ลองใหม่</strong>
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setShowUnlockFrame(true)}
                  className="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #8FAF96, #7D9D85)' }}>
                  เปิดรับสัญญาณ
                </button>
                <button onClick={() => setShowSimModal(false)}
                  className="w-full py-3.5 rounded-2xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── UNLOCK FRAME ─── */}
      <AnimatePresence>
        {showUnlockFrame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(125,157,133,0.12)' }}>
                  <Globe size={16} style={{ color: 'var(--green)' }} />
                </div>
                <span className="text-xs text-gray-400 truncate max-w-[140px] hidden sm:block">{UNLOCK_URL}</span>
              </div>
              <button onClick={() => setShowUnlockFrame(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                <X size={16} />
              </button>
            </div>
            <iframe src={UNLOCK_URL} className="flex-1 w-full border-none bg-white" title="Unlock SIM Stream" />
            <div className="px-5 py-4 bg-white border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowUnlockFrame(false)}
                className="flex-1 py-3 rounded-2xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                ยกเลิก
              </button>
              <button onClick={retryAfterUnlock}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8FAF96, #7D9D85)' }}>
                รับสัญญาณแล้ว ลองใหม่
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CLOSED MODAL ─── */}
      <AnimatePresence>
        {showClosedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowClosedModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative z-10 bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(125,157,133,0.12)' }}>
                <RadioIcon size={32} style={{ color: 'var(--green)' }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: '#2D5538' }}>ขออภัย</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                ขณะนี้สถานีอยู่ในช่วงเวลาปิดสถานี<br />กรุณาติดตามรับฟังใหม่อีกครั้งในภายหลัง
              </p>
              <button onClick={() => setShowClosedModal(false)}
                className="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7D9D85, #5E8067)' }}>
                ตกลง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── COOKIE CONSENT ─── */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[110]">
            <div className="bg-white rounded-[24px] p-6 shadow-2xl" style={{ border: '1px solid rgba(74,93,79,0.1)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(125,157,133,0.1)' }}>
                  <Globe size={20} style={{ color: 'var(--green)' }} />
                </div>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: '#2D5538' }}>การใช้คุกกี้ (Cookies)</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้งาน</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAcceptCookies}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7D9D85, #5E8067)' }}>
                  ยอมรับทั้งหมด
                </button>
                <button onClick={() => setShowCookieConsent(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                  ตั้งค่า
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FLOATING SHOPEE BUTTON ─── */}
      <a href={SHOPEE_URL} target="_blank" rel="noopener noreferrer"
        className="fixed left-4 z-[90] group"
        style={{ top: '38%', transform: 'translateY(-50%)' }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: '#EE4D2D', boxShadow: '0 4px 20px rgba(238,77,45,0.45)', border: '3px solid white' }}>
          <ShoppingBasket size={24} className="text-white" />
          <span className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping" />
        </motion.div>
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none"
          style={{ background: '#4A7055' }}>
          🛍️ ร้านค้า Shopee
        </div>
      </a>

    </div>
  );
}
