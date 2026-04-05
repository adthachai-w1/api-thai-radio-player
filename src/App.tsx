/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Radio, Music, Settings, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STREAM_URL = "https://cdn-edge-ott.prd.go.th/radio_edge/c82e-c7ef-a290-7d29-059a.stream_aac/chunklist_w1111161940_tkcHJkZW5kdGltZT0xNzc1NDg0NTcwJnByZHN0YXJ0dGltZT0xNzc1Mzk4MTEwJnByZGhhc2g9TWJMcXUzTlZ4bXFjOUwwTlNobkR1QmVWeTIwUDlSTF9la1lsaHNtbWV6MD0=.m3u8?token=true&aes=true";

interface RadioBossMetadata {
  nowplaying?: string;
  artist?: string;
  title?: string;
  nexttrack?: string;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState<RadioBossMetadata>({
    nowplaying: "Loading station info...",
    artist: "PRD Radio",
    title: "Live Stream"
  });
  const [showSettings, setShowSettings] = useState(false);

  // Initialize HLS
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = STREAM_URL;
      }
    }
  }, []);

  // RadioBOSS API Polling
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch from our own backend which acts as a proxy/store for RadioBOSS
        const response = await fetch("/api/nowplaying");
        const data = await response.json();
        setMetadata({
          nowplaying: data.nowplaying,
          artist: data.artist,
          title: data.title
        });
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };

    const interval = setInterval(fetchMetadata, 5000);
    fetchMetadata();
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
    if (value > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMute = !isMuted;
      setIsMuted(newMute);
      videoRef.current.muted = newMute;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-3xl p-8 glow relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Radio className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight">PRD Radio</h1>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Album Art / Visualizer Placeholder */}
        <div className="aspect-square w-full rounded-2xl bg-zinc-900 mb-8 relative overflow-hidden group">
          <img 
            src="https://picsum.photos/seed/radio/800/800" 
            alt="Station Cover"
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {isPlaying && (
              <div className="flex items-end gap-1 h-12">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [12, 48, 24, 40, 16] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.6, 
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="px-2 py-1 bg-blue-500 text-[10px] font-bold uppercase tracking-widest rounded-md">Live</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={metadata.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <h2 className="text-2xl font-display font-bold mb-1 truncate">{metadata.title}</h2>
              <p className="text-zinc-400 font-medium flex items-center justify-center gap-2">
                <Music className="w-4 h-4" />
                {metadata.artist}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Progress Bar (Simulated for Radio) */}
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="h-full w-1/3 bg-blue-500 rounded-full"
            />
          </div>

          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={togglePlay}
              className="w-20 h-20 flex items-center justify-center bg-blue-500 hover:bg-blue-400 text-white rounded-full transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-4">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6 pt-6 border-t border-white/10"
            >
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                  <h3 className="text-xs font-bold uppercase text-blue-400 mb-2">RadioBOSS Setup</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed space-y-2">
                    <span>To update metadata automatically, configure RadioBOSS HTTP Request:</span>
                    <code className="block bg-black/40 p-2 rounded mt-2 text-blue-300 break-all">
                      {window.location.origin}/api/update?artist=%artist%&title=%title%
                    </code>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden Video Element for Audio */}
        <video ref={videoRef} className="hidden" />
      </motion.div>

      {/* Footer */}
      <div className="mt-8 text-zinc-500 text-sm flex items-center gap-4">
        <a href="https://prd.go.th" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
          Official Site <ExternalLink className="w-3 h-3" />
        </a>
        <span>•</span>
        <span>Powered by RadioBOSS API</span>
      </div>
    </div>
  );
}
