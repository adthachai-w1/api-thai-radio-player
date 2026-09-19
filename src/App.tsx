import { useState, useRef, useEffect } from 'react';
import iconKaew from './images/icon-kaew.png';
import photo1 from './images/photo-1.png';
import { cameras } from './cameras';

const STREAM_URL = 'https://uk5freenew.listen2myradio.com/live.mp3?typeportmount=s1_13082_stream_820118366';
const BAR_HEIGHTS = [14, 28, 18, 36, 22, 40, 16, 32, 24, 38, 12, 30, 20, 34];

type Page = 'home' | 'traffic' | 'contact';

function navBtnStyle(active: boolean): React.CSSProperties {
  return active
    ? { padding: '9px 16px', borderRadius: 999, border: 'none', background: '#fff', color: '#659287', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }
    : { padding: '9px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.35)', background: 'transparent', color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' };
}

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
  const [camStatus, setCamStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [showShopeeButton, setShowShopeeButton] = useState(true);
  const [cameraFilter, setCameraFilter] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalStopRef = useRef(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    let consent: string | null = null;
    try { consent = localStorage.getItem('kukaew_cookie_consent'); } catch (e) {}
    if (!consent) setShowCookieConsent(true);
    return () => {
      if (hlsRef.current) { try { hlsRef.current.destroy(); } catch (e) {} }
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      const a = audioRef.current;
      if (a) { a.pause(); a.src = ''; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page === 'traffic' && !hlsRef.current && camStatus !== 'playing') {
      loadCamera(cameras[selectedCameraIndex].stream);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const clearStall = () => {
    if (stallTimerRef.current) { clearTimeout(stallTimerRef.current); stallTimerRef.current = null; }
  };

  const handleCanPlay = () => clearStall();
  const handlePlaying = () => { clearStall(); setIsLoading(false); setIsPlaying(true); };
  const handleStall = () => {
    if (intentionalStopRef.current) return;
    clearStall();
    stallTimerRef.current = setTimeout(() => {
      if (!intentionalStopRef.current) { setIsPlaying(false); setIsLoading(false); setShowErrorModal(true); }
    }, 8000);
  };
  const handleError = () => {
    if (!intentionalStopRef.current) { setIsPlaying(false); setIsLoading(false); setShowErrorModal(true); }
  };

  const loadStream = () => {
    const a = audioRef.current;
    if (!a) return;
    a.src = STREAM_URL + '&t=' + Date.now();
    a.load();
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      intentionalStopRef.current = true;
      clearStall();
      a.pause(); a.src = ''; a.load();
      setIsPlaying(false); setIsLoading(false);
      setTimeout(() => { intentionalStopRef.current = false; }, 400);
    } else {
      intentionalStopRef.current = false;
      setIsLoading(true); setShowErrorModal(false);
      loadStream();
      a.play().then(() => {
        setIsPlaying(true); setIsLoading(false);
      }).catch((err) => {
        if (err.name !== 'AbortError') { setIsPlaying(false); setIsLoading(false); setShowErrorModal(true); }
      });
    }
  };

  const retryPlay = () => { setShowErrorModal(false); setTimeout(() => togglePlay(), 300); };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.volume = next ? 0 : volume;
      return next;
    });
  };

  const adjustVolume = (amt: number) => {
    setVolume((v) => {
      const next = Math.min(1, Math.max(0, v + amt));
      if (audioRef.current) audioRef.current.volume = next;
      if (next > 0 && isMuted) setIsMuted(false);
      return next;
    });
  };

  const acceptCookies = () => {
    try { localStorage.setItem('kukaew_cookie_consent', 'accepted'); } catch (e) {}
    setShowCookieConsent(false);
  };

  const loadCamera = (streamUrl: string) => {
    setCamStatus('loading');
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) { try { hlsRef.current.destroy(); } catch (e) {} hlsRef.current = null; }

    const init = () => {
      const Hls = (window as any).Hls;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(Hls.Events.ERROR, (_e: any, d: any) => { if (d.fatal) setCamStatus('error'); });
        video.onplaying = () => setCamStatus('playing');
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(() => {});
        video.onplaying = () => setCamStatus('playing');
        video.onerror = () => setCamStatus('error');
      } else {
        setCamStatus('error');
      }
    };

    if ((window as any).Hls) { init(); }
    else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
      s.onload = init;
      s.onerror = () => setCamStatus('error');
      document.head.appendChild(s);
    }
  };

  const onCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = cameras.findIndex((c) => c.stream === e.target.value);
    if (idx >= 0) { setSelectedCameraIndex(idx); loadCamera(cameras[idx].stream); }
  };

  const cam = cameras[selectedCameraIndex];
  const filteredCameras = cameraFilter
    ? cameras.filter((c) => c.name.toLowerCase().includes(cameraFilter.toLowerCase()))
    : cameras;
  const playStatusText = isLoading ? 'กำลังเชื่อมต่อ...' : isPlaying ? 'กำลังเล่นอยู่' : 'แตะปุ่มเพื่อฟังสด';
  const volumePercentText = (isMuted ? 0 : Math.round(volume * 100)) + '%';
  const isMutedOrZero = isMuted || volume === 0;
  const isUnmutedWithVolume = !isMuted && volume > 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F7F4ED', color: '#23261F' }}>
      <audio
        ref={audioRef}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onStalled={handleStall}
        onWaiting={handleStall}
        onError={handleError}
        preload="none"
      />

      {/* HEADER */}
      <header style={{ background: '#659287', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0, background: '#fff' }}>
              <img src={iconKaew} alt="โลโก้สถานี" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>กู่แก้วเรดิโอ</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 12, letterSpacing: '0.03em' }}>FM 93.00 MHz</div>
            </div>
          </div>

          <a href="tel:0819853404" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#659287', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 999, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            081-985-3404
          </a>

          <nav aria-label="เมนูหลัก" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', flex: '1 1 100%', order: 3 }}>
            <button onClick={() => setPage('home')} style={navBtnStyle(page === 'home')}>หน้าแรก</button>
            <button onClick={() => setPage('traffic')} style={navBtnStyle(page === 'traffic')}>ดูกล้องจราจร</button>
            <button onClick={() => setPage('contact')} style={navBtnStyle(page === 'contact')}>ติดต่อเรา</button>
          </nav>
        </div>
      </header>

      {/* HOME */}
      {page === 'home' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg,#F0F6EC 0%,#DCEBDD 100%)', padding: '14px 16px' }}>
            <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '60%', height: '130%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(101,146,135,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="kk-hero-wrap" style={{ position: 'relative', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>

              {/* Desktop-only intro column */}
              <div className="kk-hero-desktop-intro">
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: '#3E5E56', textTransform: 'uppercase' }}>วิทยุชุมชนออนไลน์</p>
                <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem,3vw,2.1rem)', fontWeight: 800, lineHeight: 1.4, color: '#2F4A43' }}>ฟังหมอลำ ลูกทุ่งอีสาน<br />สดทุกวัน ตลอด 24 ชั่วโมง</h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#4A6F65', maxWidth: 340 }}>กู่แก้วเรดิโอ FM 93.00 MHz ส่งตรงจากอำเภอกู่แก้ว จังหวัดอุดรธานี ให้ฟังได้ทุกที่ทั่วโลก</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #B1D3B9', borderRadius: 999, padding: '8px 16px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#659287" strokeWidth="2"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" /></svg>
                  <span style={{ color: '#2F4A43', fontWeight: 700, fontSize: 14 }}>FM 93.00 · ครอบคลุมอำเภอกู่แก้ว</span>
                </div>
              </div>

              {/* Player card */}
              <div className="kk-hero-image" style={{ width: 340, maxWidth: '92%', background: '#659287', borderRadius: 20, padding: 16, boxShadow: '0 16px 36px rgba(101,146,135,0.35)', flexShrink: 0 }}>
                <div className="kk-hero-photo">
                  <img src={photo1} alt="ภาพสถานีกู่แก้วเรดิโอ" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
                  <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, lineHeight: 1.15, color: '#fff' }}>กู่แก้วเรดิโอ</h1>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#E6F2DD' }}>FM 93.00 MHz · หมอลำ · ลูกทุ่ง</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.16)', borderRadius: 999, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: 6, height: 6, background: '#FF5B4C', borderRadius: '50%', animation: 'kk-blink 1.4s ease-in-out infinite', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>กำลังออกอากาศสด</span>
                  </div>
                </div>

                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#E6F2DD', textAlign: 'left' }}>{playStatusText}</p>

                <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.25)', marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: '#B1D3B9', animation: isPlaying ? 'kk-wave 1.6s ease-in-out infinite' : 'none', opacity: isPlaying ? 1 : 0.4 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <button onClick={togglePlay} aria-label={isPlaying ? 'หยุดเล่น' : 'เล่น'} className="kk-play-btn" style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                    {isLoading ? (
                      <div style={{ width: 26, height: 26, border: '3px solid #E6F2DD', borderTopColor: '#659287', borderRadius: '50%', animation: 'kk-spin 0.8s linear infinite' }} />
                    ) : isPlaying ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#659287"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#659287" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={toggleMute} aria-label="เปิด/ปิดเสียง" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
                    {isMutedOrZero ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                    ) : isUnmutedWithVolume ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                    ) : null}
                  </button>
                  <button onClick={() => adjustVolume(-0.1)} aria-label="ลดเสียง" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}>–</button>
                  <span style={{ flex: 1, color: '#E6F2DD', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{volumePercentText}</span>
                  <button onClick={() => adjustVolume(0.1)} aria-label="เพิ่มเสียง" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}>+</button>
                </div>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section style={{ padding: '26px 20px', background: '#F7F4ED' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
              {[
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#659287" strokeWidth="2"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" /></svg>, label: 'ความถี่', value: 'FM 93.00', sub: 'ออกอากาศตลอด 24 ชั่วโมง' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#659287" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, label: 'ผู้ฟังออนไลน์', value: '1,254+', sub: 'กำลังรับฟังอยู่ขณะนี้' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#659287" strokeWidth="2"><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" /></svg>, label: 'คุณภาพสัญญาณ', value: 'HD', sub: 'ไม่มีโฆษณาขัดจังหวะ' },
              ].map((stat, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #E6E1D6', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#E6F2DD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stat.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6B7263', fontWeight: 600 }}>{stat.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 19, fontWeight: 800, color: '#23261F' }}>{stat.value}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7263' }}>{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ABOUT */}
          <section style={{ padding: '0 20px 32px', background: '#F7F4ED' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', background: '#fff', border: '1px solid #E6E1D6', borderRadius: 18, padding: 24 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#659287', textTransform: 'uppercase' }}>เกี่ยวกับสถานี</p>
              <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 800, color: '#23261F' }}>เสียงแห่งจิตวิญญาณอีสาน</h2>
              <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.65, color: '#3D4335', maxWidth: 680 }}>
                กู่แก้วเรดิโอ FM 93.00 MHz คือสถานีวิทยุชุมชนที่นำเสนอเพลงหมอลำ ลูกทุ่งอีสาน และข่าวสารท้องถิ่น
                ครอบคลุมอำเภอกู่แก้ว จังหวัดอุดรธานี พร้อมออกอากาศออนไลน์ให้ฟังได้ทั่วโลก
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['หมอลำ', 'ลูกทุ่ง', 'ข่าวชุมชน', 'ออนไลน์ 24/7'].map((tag) => (
                  <span key={tag} style={{ background: '#E6F2DD', color: '#4A6F65', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 999 }}>{tag}</span>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TRAFFIC */}
      {page === 'traffic' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F7F4ED' }}>
          <section style={{ background: 'linear-gradient(160deg,#659287 0%,#88BDA4 100%)', padding: '26px 20px' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
              <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>CCTV · เทศบาลนครอุดรธานี</p>
              <h1 style={{ margin: '0 0 4px', color: '#fff', fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800 }}>ดูการจราจรสด</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>เลือกจุดกล้อง CCTV ที่ต้องการดูจากรายการด้านล่าง</p>
            </div>
          </section>

          <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', padding: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #E6E1D6', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #E6E1D6' }}>
                <label htmlFor="kk-cam-search" style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#23261F' }}>ค้นหาจุดกล้อง</label>
                <input
                  id="kk-cam-search"
                  type="text"
                  value={cameraFilter}
                  onChange={(e) => setCameraFilter(e.target.value)}
                  placeholder="พิมพ์ชื่อแยก/ถนน..."
                  style={{ width: '100%', fontSize: 14, padding: '10px 14px', border: '2px solid #E6E1D6', borderRadius: 12, color: '#23261F', background: '#F7F4ED', marginBottom: 10 }}
                />
                <label htmlFor="kk-cam-select" style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#23261F' }}>เลือกจุดกล้อง ({filteredCameras.length} จุด)</label>
                <select id="kk-cam-select" value={cam.stream} onChange={onCameraChange} style={{ width: '100%', fontSize: 14, fontWeight: 600, padding: '11px 14px', border: '2px solid #E6E1D6', borderRadius: 12, color: '#23261F', background: '#F7F4ED' }}>
                  {filteredCameras.map((c) => (
                    <option key={c.stream} value={c.stream}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#111', borderRadius: 16, overflow: 'hidden' }}>
                  <video ref={videoRef} muted autoPlay playsInline style={{ display: camStatus === 'playing' ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  {camStatus === 'loading' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, border: '4px solid rgba(255,255,255,0.15)', borderTopColor: '#fff', borderRadius: '50%', animation: 'kk-spin 0.8s linear infinite' }} />
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>กำลังเชื่อมต่อ...</p>
                    </div>
                  )}
                  {camStatus === 'error' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>กล้องออฟไลน์ ลองเลือกจุดอื่น</p>
                    </div>
                  )}
                </div>
                <p style={{ textAlign: 'center', margin: '14px 0 0', fontSize: 17, fontWeight: 700, color: '#23261F' }}>{cam.name}</p>
                <p style={{ textAlign: 'center', margin: '2px 0 0', fontSize: 13, color: '#6B7263' }}>สัญญาณจาก · เทศบาลนครอุดรธานี</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT */}
      {page === 'contact' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F7F4ED' }}>
          <section style={{ background: 'linear-gradient(160deg,#659287 0%,#88BDA4 100%)', padding: '26px 20px' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
              <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>ติดต่อสถานี</p>
              <h1 style={{ margin: '0 0 4px', color: '#fff', fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800 }}>ติดต่อโฆษณา</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>กู่แก้วเรดิโอ FM 93.00 MHz · อุดรธานี</p>
            </div>
          </section>

          <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              <div style={{ background: '#fff', border: '1px solid #E6E1D6', borderRadius: 16, padding: 18, textAlign: 'center' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#E6F2DD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#659287" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#6B7263', textTransform: 'uppercase' }}>ผู้จัดการสถานี</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#23261F' }}>จ่าเยี่ยม คนโก้</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #E6E1D6', borderRadius: 16, padding: 18, textAlign: 'center' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#E6F2DD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#659287" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#6B7263', textTransform: 'uppercase' }}>โทรศัพท์</p>
                <a href="tel:0819853404" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#88BDA4', color: '#2F4A43', fontWeight: 800, fontSize: 15, padding: '9px 18px', borderRadius: 12, textDecoration: 'none' }}>081-985-3404</a>
              </div>
              <div style={{ background: '#fff', border: '1px solid #E6E1D6', borderRadius: 16, padding: 18, textAlign: 'center' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#E6F2DD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#659287" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#6B7263', textTransform: 'uppercase' }}>ที่ตั้ง</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#23261F', lineHeight: 1.5 }}>อำเภอกู่แก้ว<br />จังหวัดอุดรธานี</p>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E6E1D6', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ height: 220 }}>
                <iframe title="แผนที่สถานี" src="https://maps.google.com/maps?q=17.170219,103.160999&z=14&output=embed" style={{ width: '100%', height: '100%', border: 0 }} loading="lazy" />
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#23261F' }}>กู่แก้วเรดิโอ FM 93.00</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7263' }}>อำเภอกู่แก้ว อุดรธานี</p>
                </div>
                <a href="https://www.google.com/maps?q=17.170219,103.160999" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#88BDA4', color: '#2F4A43', fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 999, textDecoration: 'none' }}>นำทาง</a>
              </div>
            </div>

            <div style={{ background: '#E6F2DD', border: '1px solid #B1D3B9', borderRadius: 16, padding: 20 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#23261F' }}>สนใจลงโฆษณากับเรา?</h3>
              <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.65, color: '#3D4335' }}>สถานีวิทยุกู่แก้วเรดิโอ FM 93.00 MHz ให้บริการโฆษณาทางวิทยุครอบคลุมพื้นที่อำเภอกู่แก้วและใกล้เคียง ติดต่อสอบถามอัตราค่าโฆษณาและแพ็กเกจพิเศษได้โดยตรง</p>
              <a href="tel:0819853404" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#88BDA4', color: '#2F4A43', fontWeight: 800, fontSize: 14, padding: '11px 20px', borderRadius: 12, textDecoration: 'none' }}>โทร 081-985-3404</a>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#2F4A43', color: '#fff', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={iconKaew} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>กู่แก้วเรดิโอ</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 300 }}>นำเสนอเสียงเพลงแห่งจิตวิญญาณอีสานแท้ๆ ทั้งหมอลำ ลูกทุ่ง และบรรยากาศชุมชน</p>
          </div>
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>ติดต่อเรา</h3>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>081-985-3404</p>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>อำเภอกู่แก้ว, อุดรธานี</p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>จ่าเยี่ยม คนโก้</p>
          </div>
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>ติดตามเรา</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="#" aria-label="Facebook" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99h-2.5v-2.88h2.5V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.88h-2.34v6.99A10 10 0 0 0 22 12z" /></svg>
              </a>
              <a href="https://s.shopee.co.th/30lJC2Kxaa?share_channel_code=6" target="_blank" rel="noopener noreferrer" aria-label="Shopee" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://cdn.simpleicons.org/shopee/FFFFFF" alt="" style={{ width: 15, height: 15 }} />
              </a>
              <a href="#" aria-label="Youtube" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M23.5 6.2s-.2-1.6-.9-2.4c-.9-1-1.9-1-2.4-1C16.8 2.5 12 2.5 12 2.5h0s-4.8 0-8.2.3c-.5.1-1.5.1-2.4 1-.7.8-.9 2.4-.9 2.4S.3 8.1.3 10v1.9c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.4c.9 1 2 1 2.6 1.1 1.9.2 8 .3 8 .3s4.8 0 8.2-.4c.5-.1 1.5-.1 2.4-1 .7-.8.9-2.4.9-2.4s.2-1.9.2-3.8V10c0-1.9-.2-3.8-.2-3.8zM9.6 14.9V7.3l6.6 3.8-6.6 3.8z" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>© 2024 กู่แก้วเรดิโอ FM 93.00 MHz. สงวนลิขสิทธิ์</p>
        </div>
      </footer>

      {/* SHOPEE FLOATING BUTTON */}
      {showShopeeButton && (
        <div style={{ position: 'fixed', left: 16, top: 132, zIndex: 60 }}>
          <a href="https://s.shopee.co.th/30lJC2Kxaa?share_channel_code=6" target="_blank" rel="noopener noreferrer" aria-label="ร้านค้า Shopee" style={{ width: 48, height: 48, borderRadius: '50%', background: '#EE4D2D', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 16px rgba(238,77,45,0.4)', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
          </a>
          <button onClick={() => setShowShopeeButton(false)} aria-label="ปิดปุ่มร้านค้า" style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#fff', border: '2px solid #E6E1D6', color: '#6B7263', fontSize: 12, fontWeight: 800, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>×</button>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setShowErrorModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 22, padding: 24, maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 16px 44px rgba(0,0,0,0.28)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FBEAE8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#23261F' }}>ฟังไม่ได้ในขณะนี้</h3>
            <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.6, color: '#6B7263' }}>ขออภัย ระบบไม่สามารถเชื่อมต่อสัญญาณได้ กรุณาลองใหม่อีกครั้ง</p>
            <button onClick={retryPlay} style={{ width: '100%', padding: 12, border: 'none', borderRadius: 12, background: '#88BDA4', color: '#2F4A43', fontWeight: 800, fontSize: 14, marginBottom: 8, cursor: 'pointer' }}>ลองใหม่</button>
            <button onClick={() => setShowErrorModal(false)} style={{ width: '100%', padding: 12, border: 'none', borderRadius: 12, background: '#F0EEE7', color: '#6B7263', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ปิด</button>
          </div>
        </div>
      )}

      {/* COOKIE CONSENT */}
      {showCookieConsent && (
        <div style={{ position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 90, maxWidth: 420, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 18, boxShadow: '0 10px 32px rgba(0,0,0,0.16)', border: '1px solid #E6E1D6' }}>
            <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.55, color: '#23261F' }}><strong>การใช้คุกกี้:</strong> เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้งาน</p>
            <button onClick={acceptCookies} style={{ width: '100%', padding: 11, border: 'none', borderRadius: 12, background: '#88BDA4', color: '#2F4A43', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>ยอมรับ</button>
          </div>
        </div>
      )}
    </div>
  );
}
