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

// ─── CCTV Camera Data ────────────────────────────────────────────────────────
const CCTV_CAMERAS = [
  { name: 'วงเวียนกรมหลวงประจักษ์ศิลปาคม SPD', lat: 17.4138, lng: 102.7872 },
  { name: 'แยกสุครัทรา ด้านถนนสุครัทรา', lat: 17.4101, lng: 102.7856 },
  { name: 'แยกอาชีวศึกษา ด้านถนนประชารักษา', lat: 17.4155, lng: 102.7903 },
  { name: 'แยกอาชีวศึกษา ด้านถนนเพาะนิยม', lat: 17.4160, lng: 102.7895 },
  { name: 'แยกเรือนจำ ถนนหมากแข้ง', lat: 17.4080, lng: 102.7820 },
  { name: 'แยกจุดกลับรถหน้าตลาดเมืองทองขาออก', lat: 17.4200, lng: 102.7930 },
  { name: 'แยกตลาดไทยอีสานแยกถนนสุสการ', lat: 17.4175, lng: 102.7845 },
  { name: 'แยกปากซอยประชาสันติ', lat: 17.4090, lng: 102.7865 },
  { name: 'แยกหน้าโรงเรียนอุดรคริสเตียน', lat: 17.4120, lng: 102.7880 },
  { name: 'แยกหน้าโรงเรียนอุดรพิทยานุกูล ถนนโพศรี', lat: 17.4145, lng: 102.7920 },
  { name: 'แยกชลประทาน', lat: 17.4060, lng: 102.7840 },
  { name: 'แยกริเบต', lat: 17.4185, lng: 102.7860 },
  { name: 'แยกหน้าสถานีรถไฟ', lat: 17.4035, lng: 102.7870 },
  { name: 'แยกโพธิ์ศรี ด้านถนนโพธิ์ศรี', lat: 17.4130, lng: 102.7910 },
  { name: 'แยกโพธิ์ศรี ด้านถนนอธิบดี', lat: 17.4125, lng: 102.7905 },
  { name: 'แยกหน้าโรงพยาบาลอุดรธานี', lat: 17.4050, lng: 102.7890 },
  { name: 'แยกหน้าศาลากลางจังหวัด', lat: 17.4170, lng: 102.7940 },
  { name: 'แยกถนนทหาร-ถนนอุดรดุษฎี', lat: 17.4110, lng: 102.7830 },
];

// ─── Traffic Viewer Component ─────────────────────────────────────────────────
const UDON_CAMERAS = [
  { name: 'วงเวียนกรมหลวงประจักษ์ศิลปาคม SPD',          label: 'อุดรธานี - วงเวียนกรมหลวงประจักษ์ศิลปาคม SPD' },
  { name: 'แยกเซ็นทรัล',                                  label: 'อุดรธานี - แยกเซ็นทรัล' },
  { name: 'แยกหน้าสถานีรถไฟ',                             label: 'อุดรธานี - แยกหน้าสถานีรถไฟ' },
  { name: 'แยกสถานีรถไฟ ถนนประจักษ์',                     label: 'อุดรธานี - แยกสถานีรถไฟ ถนนประจักษ์' },
  { name: 'แยกคอกม้า',                                    label: 'อุดรธานี - แยกคอกม้า' },
  { name: 'แยกอาชีวศึกษา ด้านถนนประชารักษา',              label: 'อุดรธานี - แยกอาชีวศึกษา ด้านถนนประชารักษา' },
  { name: 'แยกอาชีวศึกษา ด้านถนนเพาะนิยม',               label: 'อุดรธานี - แยกอาชีวศึกษา ด้านถนนเพาะนิยม' },
  { name: 'แยกหน้าโรงเรียนอุดรพิทยานุกูล ถนนโพศรี',      label: 'อุดรธานี - แยกหน้าโรงเรียนอุดรพิทยานุกูล ถนนโพศรี' },
  { name: 'แยก VT แหนมเนือง',                             label: 'อุดรธานี - แยก VTแหนมเนือง' },
  { name: 'แยกต้อยลาบเป็ด',                               label: 'อุดรธานี - แยกต้อยลาบเป็ด' },
];

function TrafficViewer() {
  const [selected, setSelected] = useState(UDON_CAMERAS[0]);
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pendingLabel = useRef<string>(UDON_CAMERAS[0].label);

  // inject dropdown selection into iframe
  const injectSelect = (label: string) => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return false;
      const sel = doc.querySelector('select') as HTMLSelectElement | null;
      if (!sel) return false;
      const opt = Array.from(sel.options).find(o => o.text.trim() === label || o.value.trim() === label);
      if (!opt) return false;
      sel.value = opt.value;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } catch { return false; }
  };

  // on iframe load: wait for JS init, then inject
  const handleLoad = () => {
    setReady(false);
    setTimeout(() => {
      const ok = injectSelect(pendingLabel.current);
      setReady(ok);
    }, 1200);
  };

  // when user picks camera
  const handleSelect = (cam: typeof UDON_CAMERAS[0]) => {
    setSelected(cam);
    pendingLabel.current = cam.label;
    if (ready) {
      injectSelect(cam.label);
    } else {
      // iframe not ready — reload with query hint
      if (iframeRef.current) {
        iframeRef.current.src = `https://khonkaenlink.info/cctv/?cam=${encodeURIComponent(cam.label)}`;
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-6 py-5 max-w-7xl mx-auto w-full">

      {/* Camera list sidebar */}
      <div className="md:w-64 lg:w-72 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          <span className="font-bold text-[13px]" style={{ color: 'var(--color-text-primary)' }}>เลือกจุดที่ต้องการดู</span>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--color-green-100)', color: 'var(--color-brand)' }}>
            {UDON_CAMERAS.length} จุด
          </span>
        </div>

        <div className="overflow-y-auto flex-1">
          {UDON_CAMERAS.map((cam, i) => {
            const active = selected.label === cam.label;
            return (
              <button key={i} onClick={() => handleSelect(cam)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 transition-all"
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: active ? 'var(--color-green-100)' : 'transparent',
                  borderLeft: active ? '3px solid var(--color-brand)' : '3px solid transparent',
                }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: active ? 'var(--color-brand)' : '#22c55e' }} />
                <span className="text-[12.5px] leading-snug"
                  style={{ color: active ? 'var(--color-brand)' : 'var(--color-text-primary)', fontWeight: active ? 600 : 400 }}>
                  {cam.name}
                </span>
                {active && (
                  <svg className="ml-auto flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Video panel */}
      <div className="flex-1 flex flex-col gap-2 min-h-[400px]">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          <span className="font-bold text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{selected.name}</span>
          <span className="badge-live ml-2"><span className="dot" />LIVE</span>
        </div>

        <div className="flex-1 overflow-hidden"
          style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)', minHeight: '400px', background: '#111', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <iframe
              ref={iframeRef}
              src={`https://khonkaenlink.info/cctv/?cam=${encodeURIComponent(UDON_CAMERAS[0].label)}`}
              title="CCTV อุดรธานี"
              onLoad={handleLoad}
              style={{
                border: 'none',
                display: 'block',
                width: '100%',
                height: 'calc(100% + 320px)',
                marginTop: '-160px',
              }}
              allowFullScreen
            />
          </div>
        </div>

        <p className="text-[11px] text-center" style={{ color: 'var(--color-text-secondary)' }}>
          ข้อมูลจาก ·{' '}
          <a href="https://khonkaenlink.info/cctv/" target="_blank" rel="noopener noreferrer"
            className="underline hover:opacity-70 transition-opacity" style={{ color: 'var(--color-brand)' }}>
            khonkaenlink.info
          </a>
        </p>
      </div>
    </div>
  );
}


// ─── Traffic Map Component ────────────────────────────────────────────────────
function TrafficMap() {
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
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
        .setView([17.4138, 102.7872], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);

      const camIcon = L.divIcon({
        html: `<div style="width:30px;height:30px;background:#22c55e;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(34,197,94,0.5)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </div>`,
        className: '', iconSize: [30, 30], iconAnchor: [15, 15],
      });

      CCTV_CAMERAS.forEach(cam => {
        L.marker([cam.lat, cam.lng], { icon: camIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:Sarabun,sans-serif;min-width:180px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="width:8px;height:8px;background:#22c55e;border-radius:50%;display:inline-block;flex-shrink:0"></span>
              <b style="font-size:12px;color:#1C261C">${cam.name}</b>
            </div>
            <a href="https://www.udoncity.go.th/frontend/web/cctv/map" target="_blank"
              style="font-size:11px;color:#7D9D85;text-decoration:none;display:flex;align-items:center;gap:3px;margin-top:4px">
              ดูกล้อง CCTV สด →
            </a>
          </div>`);
      });

      mapInstanceRef.current = map;
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full" style={{ minHeight: '480px' }} />;
}

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
        .bindPopup('<b style="color:var(--color-text-primary)">กู่แก้วเรดิโอ FM 93.00</b><br>อำเภอกู่แก้ว อุดรธานี')
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

type Page = 'home' | 'contact' | 'traffic';

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

      {/* ─── DESIGN SYSTEM TOKENS ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sarabun:wght@300;400;500;600;700;800&display=swap');

        /* ── Primitive Tokens ── */
        :root {
          --color-green-100: #EAF2EC;
          --color-green-200: #C8DFCc;
          --color-green-400: #8FAF96;
          --color-green-500: #7D9D85;
          --color-green-600: #6A8870;
          --color-green-700: #557060;
          --color-green-900: #2D4A35;
          --color-neutral-50:  #F5F7F5;
          --color-neutral-100: #ECF0EC;
          --color-neutral-200: #D6DDD6;
          --color-neutral-400: #8E9E8E;
          --color-neutral-700: #3D4D3D;
          --color-neutral-900: #1C261C;
          --color-white: #FFFFFF;
          --color-error: #DC2626;
          --color-error-bg: rgba(220,38,38,0.12);
          --color-error-border: rgba(220,38,38,0.25);
        }

        /* ── Semantic Tokens ── */
        :root {
          --color-brand:        var(--color-green-500);
          --color-brand-hover:  var(--color-green-600);
          --color-brand-light:  var(--color-green-100);
          --color-bg:           var(--color-neutral-50);
          --color-surface:      var(--color-white);
          --color-border:       var(--color-neutral-200);
          --color-text-primary: var(--color-neutral-900);
          --color-text-secondary: var(--color-neutral-400);
          --color-header-bg:    var(--color-green-500);
          --color-footer-bg:    var(--color-green-700);
          --color-hero-from:    #6B9472;
          --color-hero-to:      #8FAF96;
        }

        /* ── Component Tokens ── */
        :root {
          --radius-sm:   8px;
          --radius-md:   16px;
          --radius-lg:   24px;
          --radius-xl:   32px;
          --radius-full: 9999px;
          --shadow-card: 0 2px 12px rgba(28,38,28,0.06), 0 1px 3px rgba(28,38,28,0.04);
          --shadow-card-hover: 0 8px 32px rgba(28,38,28,0.10), 0 2px 8px rgba(28,38,28,0.06);
          --shadow-play: 0 8px 32px rgba(125,157,133,0.45);
          --transition-base: 180ms ease;
        }

        * { box-sizing: border-box; font-family: 'Inter', 'Sarabun', ui-sans-serif, sans-serif; }
        body { background: var(--color-bg); color: var(--color-text-primary); }

        /* ── Noise texture overlay ── */
        .has-noise::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        /* ── Navigation ── */
        .nav-link {
          position: relative;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.025em;
          color: rgba(255,255,255,0.65);
          transition: color var(--transition-base);
          padding-bottom: 2px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          width: 0; height: 2px;
          background: rgba(255,255,255,0.9);
          border-radius: 1px;
          transition: width 220ms ease;
        }
        .nav-link.active { color: #fff; }
        .nav-link.active::after { width: 100%; }
        .nav-link:hover:not(.active) { color: rgba(255,255,255,0.88); }
        .nav-link:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 4px; border-radius: 3px; }

        /* ── Live badge ── */
        .badge-live {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px;
          background: var(--color-error-bg);
          border: 1px solid var(--color-error-border);
          border-radius: var(--radius-full);
          font-size: 10px; font-weight: 700;
          color: #f87171;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .badge-live .dot {
          width: 5px; height: 5px;
          background: var(--color-error);
          border-radius: 50%;
          animation: blink 1.4s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

        /* ── Play button glow ── */
        .btn-play {
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }
        .btn-play:hover { transform: scale(1.04); }
        .btn-play:active { transform: scale(0.96); }
        .btn-play.is-playing {
          animation: play-pulse 2.4s ease-in-out infinite;
        }
        @keyframes play-pulse {
          0%,100% { box-shadow: var(--shadow-play); }
          50%      { box-shadow: 0 8px 48px rgba(125,157,133,0.65), 0 0 0 12px rgba(125,157,133,0.1); }
        }
        .btn-play:focus-visible { outline: 3px solid rgba(255,255,255,0.7); outline-offset: 3px; }

        /* ── Volume slider ── */
        .vol-slider {
          -webkit-appearance: none; appearance: none;
          height: 3px; border-radius: 2px; outline: none; cursor: pointer;
        }
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 13px; height: 13px; border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer; transition: transform var(--transition-base);
        }
        .vol-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .vol-slider:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 2px; }

        /* ── Cards ── */
        .stat-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          box-shadow: var(--shadow-card);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-green-200);
        }

        .contact-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          box-shadow: var(--shadow-card);
        }
        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-green-200);
        }

        /* ── Icon circle ── */
        .icon-circle {
          display: flex; align-items: center; justify-content: center;
          background: var(--color-green-100);
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        /* ── Footer ── */
        .site-footer { background: var(--color-footer-bg); }

        /* ── Section divider ── */
        .section-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--color-brand);
          margin-bottom: 8px;
        }

        /* ── Pill tag ── */
        .pill-tag {
          display: inline-flex; align-items: center;
          padding: 5px 14px;
          background: var(--color-green-100);
          color: var(--color-green-700);
          border-radius: var(--radius-full);
          font-size: 12px; font-weight: 600;
          transition: background var(--transition-base);
        }
        .pill-tag:hover { background: var(--color-green-200); }

        /* ── Social icon button ── */
        .social-btn {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.12);
          transition: background var(--transition-base), transform var(--transition-base);
        }
        .social-btn:hover { background: rgba(255,255,255,0.18); transform: translateY(-1px); }
        .social-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 3px; border-radius: 50%; }

        /* ── CTA button ── */
        .btn-cta {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: var(--radius-full);
          color: #fff; font-size: 13px; font-weight: 600;
          transition: background var(--transition-base), transform var(--transition-base);
          cursor: pointer;
        }
        .btn-cta:hover { background: rgba(255,255,255,0.22); transform: translateY(-1px); }
        .btn-cta:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 3px; border-radius: 999px; }

        /* ── Map nav button ── */
        .btn-map-nav {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: var(--radius-full);
          background: var(--color-brand); color: #fff;
          font-size: 12px; font-weight: 700;
          transition: background var(--transition-base), transform var(--transition-base);
        }
        .btn-map-nav:hover { background: var(--color-brand-hover); transform: translateY(-1px); }
        .btn-map-nav:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 3px; border-radius: 999px; }
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

      {/* ─── HEADER ─── */}
      <header style={{ background: 'var(--color-header-bg)' }} className="sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-[60px] flex items-center gap-6">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/25 shadow-sm">
              <img src={iconKaew} alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <div className="text-white font-bold text-[13px] leading-none tracking-widest">KUKAEW RADIO</div>
              <div className="text-white/50 text-[9px] tracking-widest mt-0.5 font-medium uppercase">FM 93.00 MHz</div>
            </div>
          </div>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-10" role="navigation" aria-label="เมนูหลัก">
            <button onClick={() => navigateTo('home')} className={`nav-link ${page === 'home' ? 'active' : ''}`}>หน้าแรก</button>
            <button onClick={() => navigateTo('traffic')} className={`nav-link ${page === 'traffic' ? 'active' : ''}`}>ดูการจราจร</button>
            <button onClick={() => navigateTo('contact')} className={`nav-link ${page === 'contact' ? 'active' : ''}`}>ติดต่อโฆษณา</button>
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white/65"
              style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Users size={11} className="opacity-60" />
              1,254 ผู้ฟัง
            </div>
            <div className="badge-live"><span className="dot" aria-hidden="true" />LIVE</div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid rgba(255,255,255,0.13)', background: 'var(--color-green-600)' }}>
              <div className="px-4 py-3 flex flex-col gap-0.5">
                <button onClick={() => navigateTo('home')}
                  className={`text-left py-2.5 px-4 rounded-xl font-semibold text-[13px] transition-all ${page === 'home' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/08'}`}>
                  หน้าแรก
                </button>
                <button onClick={() => navigateTo('traffic')}
                  className={`text-left py-2.5 px-4 rounded-xl font-semibold text-[13px] transition-all ${page === 'traffic' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/08'}`}>
                  ดูการจราจร
                </button>
                <button onClick={() => navigateTo('contact')}
                  className={`text-left py-2.5 px-4 rounded-xl font-semibold text-[13px] transition-all ${page === 'contact' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/08'}`}>
                  ติดต่อโฆษณา
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ─── PAGES ─── */}
      <AnimatePresence mode="wait">

        {/* ═══ HOME PAGE ═══ */}
        {page === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex-1 flex flex-col">

            {/* ── HERO PLAYER ── */}
            <section className="has-noise relative overflow-hidden"
              style={{ background: 'linear-gradient(150deg, var(--color-hero-from) 0%, var(--color-green-500) 55%, var(--color-hero-to) 100%)', minHeight: '500px' }}>

              {/* Soft light blooms */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-30%] right-[-5%] w-[55%] h-[75%] rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-20%] left-[-8%] w-[40%] h-[55%] rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(107,148,114,0.4) 0%, transparent 70%)' }} />
              </div>

              <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-20">

                {/* ── Cover art ── */}
                <div className="flex-shrink-0 relative">
                  <motion.div
                    animate={isPlaying ? { scale: [1, 1.07, 1], opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute rounded-[32px] pointer-events-none"
                    style={{ inset: '-14px', background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 65%)' }}
                  />
                  <div className="relative w-52 h-52 md:w-60 md:h-60 rounded-[28px] overflow-hidden"
                    style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 0 0 1.5px rgba(255,255,255,0.18)' }}>
                    <img src={COVER_IMAGE_URL} alt="ภาพปก กู่แก้วเรดิโอ" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 55%)' }} />
                    {/* Like */}
                    <button onClick={() => setIsLiked(!isLiked)}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                      style={{ background: isLiked ? '#ef4444' : 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                      aria-label={isLiked ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                      aria-pressed={isLiked}>
                      <Heart size={16} fill={isLiked ? 'white' : 'none'} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* ── Controls ── */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-5 text-white w-full">

                  {/* Badge + title */}
                  <div className="text-center md:text-left space-y-2">
                    <div className="flex justify-center md:justify-start">
                      <div className="badge-live"><span className="dot" aria-hidden="true" />LIVE ON AIR</div>
                    </div>
                    <h1 className="text-[2.6rem] md:text-5xl font-black tracking-tight leading-[1.05] text-white">
                      กู่แก้วเรดิโอ
                    </h1>
                    <p className="text-white/55 text-[13px] tracking-widest font-medium uppercase">
                      FM 93.00 MHz &nbsp;·&nbsp; หมอลำ &nbsp;·&nbsp; ลูกทุ่ง
                    </p>
                  </div>

                  {/* Waveform */}
                  <div className="flex items-end gap-[3px] h-9" aria-hidden="true">
                    {barHeights.map((h, i) => (
                      <motion.div key={i}
                        animate={isPlaying ? { height: [3, h, h * 0.45, h * 0.75, 3] } : { height: 2 }}
                        transition={isPlaying ? { duration: 1.1, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' } : { duration: 0.35 }}
                        className="rounded-full flex-shrink-0"
                        style={{ width: '3px', background: isPlaying ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}
                      />
                    ))}
                  </div>

                  {/* Transport */}
                  <div className="flex items-center gap-4 md:gap-5">
                    <button className="text-white/30 hover:text-white/55 transition-colors" aria-label="สุ่มเพลง">
                      <Shuffle size={17} />
                    </button>
                    <button className="text-white/40 hover:text-white/70 transition-colors" aria-label="ก่อนหน้า">
                      <SkipBack size={21} fill="currentColor" />
                    </button>

                    {/* Play / Pause — PRIMARY ACTION */}
                    <button onClick={togglePlay}
                      className={`btn-play w-[68px] h-[68px] rounded-full flex items-center justify-center ${isPlaying ? 'is-playing' : ''}`}
                      style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 6px 24px rgba(0,0,0,0.18)' }}
                      aria-label={isLoading ? 'กำลังโหลด' : isPlaying ? 'หยุดเล่น' : 'เล่น'}>
                      {isLoading ? (
                        <div className="w-6 h-6 border-[2.5px] rounded-full animate-spin"
                          style={{ borderColor: 'var(--color-green-500)', borderTopColor: 'transparent' }} />
                      ) : isPlaying ? (
                        <Pause size={26} fill="var(--color-green-600)" style={{ color: 'var(--color-green-600)' }} />
                      ) : (
                        <Play size={26} fill="var(--color-green-600)" style={{ color: 'var(--color-green-600)', marginLeft: '3px' }} />
                      )}
                    </button>

                    <button className="text-white/40 hover:text-white/70 transition-colors" aria-label="ถัดไป">
                      <SkipForward size={21} fill="currentColor" />
                    </button>
                    <button className="text-white/30 hover:text-white/55 transition-colors" aria-label="เล่นซ้ำ">
                      <Repeat size={17} />
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-3 w-full max-w-[220px]">
                    <button onClick={toggleMute}
                      className="text-white/50 hover:text-white transition-colors flex-shrink-0"
                      aria-label={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}>
                      {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input type="range" min="0" max="1" step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if (v > 0) setIsMuted(false); }}
                      className="vol-slider flex-1"
                      aria-label="ระดับเสียง"
                      style={{ background: `linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.85) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)` }}
                    />
                    <span className="text-white/40 text-[11px] font-bold w-7 text-right tabular-nums" aria-live="polite">
                      {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── STAT STRIP ── */}
            <section className="py-8 px-4 md:px-8" style={{ background: 'var(--color-bg)' }}>
              <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                  className="stat-card flex items-center gap-4">
                  <div className="icon-circle w-11 h-11">
                    <RadioIcon size={20} style={{ color: 'var(--color-brand)' }} />
                  </div>
                  <div>
                    <p className="section-label">ความถี่</p>
                    <p className="text-[22px] font-black leading-none" style={{ color: 'var(--color-text-primary)' }}>FM 93.00</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>ออกอากาศตลอด 24 ชั่วโมง</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
                  className="stat-card flex items-center gap-4">
                  <div className="icon-circle w-11 h-11">
                    <Users size={20} style={{ color: 'var(--color-brand)' }} />
                  </div>
                  <div>
                    <p className="section-label">ผู้ฟังออนไลน์</p>
                    <p className="text-[22px] font-black leading-none" style={{ color: 'var(--color-text-primary)' }}>1,254+</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>กำลังรับฟังอยู่ขณะนี้</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                  className="stat-card flex items-center gap-4">
                  <div className="icon-circle w-11 h-11">
                    <Signal size={20} style={{ color: 'var(--color-brand)' }} />
                  </div>
                  <div>
                    <p className="section-label">คุณภาพสัญญาณ</p>
                    <p className="text-[22px] font-black leading-none" style={{ color: 'var(--color-text-primary)' }}>HD</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>ไม่มีโฆษณาขัดจังหวะ</p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ── ABOUT STRIP ── */}
            <section className="px-4 md:px-8 pb-10" style={{ background: 'var(--color-bg)' }}>
              <div className="max-w-5xl mx-auto">
                <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
                  <div className="p-7 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 md:items-center">
                    <div className="flex-1 min-w-0">
                      <p className="section-label">เกี่ยวกับสถานี</p>
                      <h2 className="text-xl font-bold mb-2 leading-snug" style={{ color: 'var(--color-text-primary)' }}>เสียงแห่งจิตวิญญาณอีสาน</h2>
                      <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        กู่แก้วเรดิโอ FM 93.00 MHz คือสถานีวิทยุชุมชนที่นำเสนอเพลงหมอลำ ลูกทุ่งอีสาน และข่าวสารท้องถิ่น
                        ครอบคลุมอำเภอกู่แก้ว จังหวัดอุดรธานี พร้อมออกอากาศออนไลน์ให้ฟังได้ทั่วโลก
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['หมอลำ', 'ลูกทุ่ง', 'ข่าวชุมชน', 'ออนไลน์ 24/7'].map(t => (
                          <span key={t} className="pill-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                    {/* Stat blocks */}
                    <div className="flex gap-4 flex-shrink-0">
                      {[['93.0', 'MHz'], ['24/7', 'ออกอากาศ']].map(([val, lbl]) => (
                        <div key={lbl} className="w-[88px] rounded-[14px] py-4 px-3 text-center flex flex-col gap-1"
                          style={{ background: 'var(--color-green-100)' }}>
                          <span className="text-2xl font-black leading-none" style={{ color: 'var(--color-brand)' }}>{val}</span>
                          <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-green-600)' }}>{lbl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="site-footer text-white mt-auto">
              <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Brand */}
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/15">
                      <img src={iconKaew} alt="" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div>
                      <div className="font-bold text-[13px] tracking-widest">KUKAEW RADIO</div>
                      <div className="text-white/40 text-[10px] tracking-wider">FM 93.00 MHz</div>
                    </div>
                  </div>
                  <p className="text-white/50 text-[13px] leading-relaxed">
                    นำเสนอเสียงเพลงแห่งจิตวิญญาณอีสานแท้ๆ ทั้งหมอลำ ลูกทุ่ง และบรรยากาศชุมชน
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/45 mb-4">ติดต่อเรา</h3>
                  <ul className="space-y-3">
                    {[
                      { icon: <Phone size={14} />, text: '081-985-3404' },
                      { icon: <MapPin size={14} />, text: 'อำเภอกู่แก้ว, อุดรธานี' },
                      { icon: <User size={14} />, text: 'จ่าเยี่ยม คนโก้' },
                    ].map(({ icon, text }) => (
                      <li key={text} className="flex items-center gap-2.5 text-[13px] text-white/55">
                        <span style={{ color: 'var(--color-green-400)' }}>{icon}</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social */}
                <div>
                  <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/45 mb-4">ติดตามเรา</h3>
                  <div className="flex gap-2.5 mb-5">
                    <a href="#" aria-label="Facebook" className="social-btn"><Facebook size={16} className="text-white/70" /></a>
                    <a href="https://s.shopee.co.th/30lJC2Kxaa?share_channel_code=6" target="_blank" rel="noopener noreferrer" aria-label="Shopee" className="social-btn">
                      <img src="https://cdn.simpleicons.org/shopee/FFFFFF" alt="Shopee" className="w-[15px] h-[15px] opacity-70" />
                    </a>
                    <a href="#" aria-label="Youtube" className="social-btn"><Youtube size={16} className="text-white/70" /></a>
                  </div>
                  <button onClick={() => navigateTo('contact')} className="btn-cta">
                    <Megaphone size={13} />
                    ลงโฆษณา
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-white/30">
                  <p>© 2024 กู่แก้วเรดิโอ FM 93.00 MHz. สงวนลิขสิทธิ์</p>
                  <div className="flex gap-5">
                    <a href="#" className="hover:text-white/55 transition-colors">นโยบายความเป็นส่วนตัว</a>
                    <a href="#" className="hover:text-white/55 transition-colors">ข้อกำหนดการใช้งาน</a>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {/* ═══ TRAFFIC PAGE ═══ */}
        {page === 'traffic' && (
          <motion.div key="traffic" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col" style={{ background: 'var(--color-bg)' }}>

            {/* Page Hero */}
            <div className="has-noise relative overflow-hidden py-10 px-4 md:px-8"
              style={{ background: 'linear-gradient(150deg, var(--color-hero-from) 0%, var(--color-green-500) 100%)' }}>
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 right-0 w-[45%] h-full"
                  style={{ background: 'radial-gradient(circle at 85% 40%, rgba(255,255,255,0.1) 0%, transparent 65%)' }} />
              </div>
              <div className="relative z-10 max-w-5xl mx-auto">
                <p className="section-label text-white/60">CCTV · เทศบาลนครอุดรธานี</p>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-1 leading-tight">ดูการจราจรสด</h1>
                <p className="text-white/50 text-[13px]">กล้อง CCTV จุดสำคัญในอุดรธานี · คลิกเลือกจุดที่ต้องการดู</p>
              </div>
            </div>

            {/* Split Panel */}
            <TrafficViewer />

            {/* Footer compact */}
            <footer className="site-footer text-white">
              <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/15">
                    <img src={iconKaew} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <span className="font-bold text-[12px] tracking-widest text-white/80">KUKAEW RADIO FM 93.00</span>
                </div>
                <p className="text-[11px] text-white/30">© 2024 กู่แก้วเรดิโอ. สงวนลิขสิทธิ์</p>
              </div>
            </footer>
          </motion.div>
        )}

        {/* ═══ CONTACT PAGE ═══ */}
        {page === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col" style={{ background: 'var(--color-bg)' }}>

            {/* Page Hero */}
            <div className="has-noise relative overflow-hidden py-12 px-4 md:px-8"
              style={{ background: 'linear-gradient(150deg, var(--color-hero-from) 0%, var(--color-green-500) 100%)' }}>
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 right-0 w-[45%] h-full"
                  style={{ background: 'radial-gradient(circle at 85% 40%, rgba(255,255,255,0.1) 0%, transparent 65%)' }} />
              </div>
              <div className="relative z-10 max-w-5xl mx-auto">
                <p className="section-label text-white/60">ติดต่อสถานี</p>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-1.5 leading-tight">ติดต่อโฆษณา</h1>
                <p className="text-white/50 text-[13px] tracking-wide">กู่แก้วเรดิโอ FM 93.00 MHz · อุดรธานี</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 space-y-6">

              {/* Contact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <User size={24} />, label: 'ผู้จัดการสถานี', value: 'จ่าเยี่ยม คนโก้', href: undefined },
                  { icon: <Phone size={24} />, label: 'โทรศัพท์', value: '081-985-3404', href: 'tel:0819853404' },
                  { icon: <MapPin size={24} />, label: 'ที่ตั้ง', value: 'อำเภอกู่แก้ว', sub: 'จังหวัดอุดรธานี', href: undefined },
                ].map(({ icon, label, value, sub, href }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="contact-card flex flex-col items-center text-center gap-4">
                    <div className="icon-circle w-14 h-14" style={{ borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--color-brand)' }}>{icon}</span>
                    </div>
                    <div>
                      <p className="section-label">{label}</p>
                      {href ? (
                        <a href={href} className="font-bold text-base transition-colors hover:underline"
                          style={{ color: 'var(--color-text-primary)' }}>{value}</a>
                      ) : (
                        <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                      )}
                      {sub && <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Map */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="overflow-hidden"
                style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
                <div className="h-[280px] md:h-[360px]">
                  <LeafletMap />
                </div>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="icon-circle w-9 h-9" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <MapPin size={15} style={{ color: 'var(--color-brand)' }} />
                    </div>
                    <div>
                      <p className="font-bold text-[13px]" style={{ color: 'var(--color-text-primary)' }}>กู่แก้วเรดิโอ FM 93.00</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>อำเภอกู่แก้ว อุดรธานี</p>
                    </div>
                  </div>
                  <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="btn-map-nav">
                    <Navigation size={12} />
                    นำทาง
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Footer (compact) */}
            <footer className="site-footer text-white mt-8">
              <div className="max-w-5xl mx-auto px-4 md:px-8 py-7 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/15">
                    <img src={iconKaew} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <span className="font-bold text-[12px] tracking-widest text-white/80">KUKAEW RADIO FM 93.00</span>
                </div>
                <p className="text-[11px] text-white/30">© 2024 กู่แก้วเรดิโอ. สงวนลิขสิทธิ์</p>
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
                <Wifi size={32} style={{ color: 'var(--color-brand)' }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>การเชื่อมต่อผิดพลาด</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                หากมีปัญหาการรับสัญญาณวิทยุ กรุณากดปุ่มด้านล่างเพื่อเปิดรับสัญญาณ แล้วกลับมากด <strong style={{ color: 'var(--color-brand)' }}>ลองใหม่</strong>
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
                  <Globe size={16} style={{ color: 'var(--color-brand)' }} />
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
                <RadioIcon size={32} style={{ color: 'var(--color-brand)' }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>ขออภัย</h3>
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
                  <Globe size={20} style={{ color: 'var(--color-brand)' }} />
                </div>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>การใช้คุกกี้ (Cookies)</h4>
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
