import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Download, Link } from "lucide-react";
import type { GlobePin } from "./Globe";
import type { AudioEngine } from "./AudioEngine";
import { getRegionLabel } from "./AudioEngine";
import { generateAlbumMeta } from "./albumTitle";

interface PlayerProps {
  pins: GlobePin[];
  audioEngine: AudioEngine;
  onReset: () => void;
}

export function Player({ pins, audioEngine, onReset }: PlayerProps) {
  const [progress, setProgress] = useState(0);
  const [playerState, setPlayerState] = useState<"playing" | "paused" | "ended">("playing");
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [hoverPct, setHoverPct] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const animRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasSizeRef = useRef({ w: 320, h: 120 });
  const progressBarRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const draggingRef = useRef(false);

  const uniqueRegions = useMemo(
    () => [...new Set(pins.map((p) => p.musicalRegion))],
    [pins]
  );

  const meta = useMemo(() => generateAlbumMeta(pins), [pins]);
  const sectionDuration = audioEngine.duration / pins.length;

  // Continue playback
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      // Ensure volume is at full (interstitial may have been ramping)
      audioEngine.setVolume(1.0);
      // If not already playing (edge case), start it
      if (!audioEngine.getIsPlaying()) {
        audioEngine.play(0);
      }
    }
  }, [audioEngine]);

  const pctFromClientX = useCallback((clientX: number) => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  // Waveform + progress loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const dpr = window.devicePixelRatio || 1;

    const setupCanvas = () => {
      const containerWidth = canvasContainerRef.current?.getBoundingClientRect().width ?? 320;
      const w = Math.max(280, Math.min(560, containerWidth));
      canvasSizeRef.current = { w, h: 120 };
      canvas.width = w * dpr;
      canvas.height = 120 * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = "120px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupCanvas();
    window.addEventListener("resize", setupCanvas);

    let running = true;

    const draw = () => {
      if (!running) return;
      const { w, h } = canvasSizeRef.current;

      const analyser = audioEngine.getAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 64;
      const dataArray = new Uint8Array(bufferLength);
      if (analyser) analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, w, h);

      const barCount = 40;
      const barWidth = w / barCount - 2;
      const gap = 2;
      const maxBin = Math.floor(bufferLength * 0.6);

      for (let i = 0; i < barCount; i++) {
        const t = i / (barCount - 1);
        const dataIdx = Math.min(Math.floor(Math.pow(t, 2.5) * maxBin), bufferLength - 1);
        let sum = 0;
        const spread = 2;
        let count = 0;
        for (let j = Math.max(0, dataIdx - spread); j <= Math.min(bufferLength - 1, dataIdx + spread); j++) {
          sum += dataArray[j];
          count++;
        }
        const value = analyser ? (sum / count) / 255 : 0;
        const boosted = Math.pow(value, 0.7);
        const barHeight = Math.max(2, boosted * h * 0.9);

        const colorIdx = Math.floor((i / barCount) * pins.length);
        const color = pins[Math.min(colorIdx, pins.length - 1)]?.color || "#fff";

        ctx.fillStyle = color + "cc";
        const x = i * (barWidth + gap);
        const y = h / 2 - barHeight / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (!draggingRef.current) {
        const p = audioEngine.getProgress();
        setProgress(p);

        const currentTime = p * audioEngine.duration;
        setActiveSection(Math.min(Math.floor(currentTime / sectionDuration), pins.length - 1));

        const enginePaused = audioEngine.getIsPaused();
        const enginePlaying = audioEngine.getIsPlaying();
        if (enginePaused) {
          setPlayerState("paused");
        } else if (enginePlaying) {
          setPlayerState("playing");
        } else if (p >= 0.99) {
          setPlayerState("ended");
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", setupCanvas);
    };
  }, [audioEngine, pins, sectionDuration]);

  const seekToClientX = useCallback((clientX: number) => {
    const pct = pctFromClientX(clientX);
    const seekTime = pct * audioEngine.duration;
    audioEngine.seek(seekTime);
    setProgress(pct);
    setPlayerState("playing");
  }, [audioEngine, pctFromClientX]);

  const handleBarMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    seekToClientX(e.clientX);

    const onMouseMove = (ev: MouseEvent) => {
      ev.preventDefault();
      const pct = pctFromClientX(ev.clientX);
      setProgress(pct);
      const seekTime = pct * audioEngine.duration;
      audioEngine.seek(seekTime);
    };

    const onMouseUp = (ev: MouseEvent) => {
      draggingRef.current = false;
      setIsDragging(false);
      const pct = pctFromClientX(ev.clientX);
      const seekTime = pct * audioEngine.duration;
      audioEngine.seek(seekTime);
      setProgress(pct);
      setPlayerState("playing");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [audioEngine, pctFromClientX, seekToClientX]);

  const handleBarMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setHoverPct(pctFromClientX(e.clientX));
  }, [pctFromClientX]);

  const handleBarTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    draggingRef.current = true;
    setIsDragging(true);
    const pct = pctFromClientX(touch.clientX);
    setHoverPct(pct);
    seekToClientX(touch.clientX);
  }, [pctFromClientX, seekToClientX]);

  const handleBarTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingRef.current) return;
    const touch = e.touches[0];
    const pct = pctFromClientX(touch.clientX);
    setHoverPct(pct);
    setProgress(pct);
    audioEngine.seek(pct * audioEngine.duration);
  }, [audioEngine, pctFromClientX]);

  const handleBarTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    draggingRef.current = false;
    setIsDragging(false);
    const pct = pctFromClientX(touch.clientX);
    audioEngine.seek(pct * audioEngine.duration);
    setProgress(pct);
    setPlayerState("playing");
  }, [audioEngine, pctFromClientX]);

  const handlePauseResume = useCallback(() => {
    audioEngine.togglePause();
  }, [audioEngine]);

  const handleDownload = () => {
    const slug = meta.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    audioEngine.downloadWAV(`meridian-${slug}.wav`);
  };

  const handleReset = () => {
    audioEngine.stop();
    onReset();
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch {
      // user cancelled share or clipboard unavailable
    }
  };

  const formatTime = (pct: number) => {
    const secs = Math.floor(pct * audioEngine.duration);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const pauseLabel =
    playerState === "ended" ? "\u25B6 Replay" :
    playerState === "paused" ? "\u25B6 Play" :
    "\u23F8 Pause";

  const showScrubber = isHoveringBar || isDragging;

  const btnBase: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#fff",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 4,
    transition: "all 0.3s ease",
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{
        backgroundColor: "#070a0f",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Eyebrow */}
      <motion.span
        style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {pins.length} Points, {uniqueRegions.length} Region{uniqueRegions.length !== 1 ? "s" : ""}
      </motion.span>

      {/* Poetic title */}
      <motion.h2
        className="mt-4"
        style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
          fontSize: "clamp(28px, 5vw, 52px)", color: "#fff",
          letterSpacing: "-0.02em", textAlign: "center",
          lineHeight: 1.1, maxWidth: 500,
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {meta.title}
      </motion.h2>

      {/* Epigraph */}
      <motion.p
        className="mt-3"
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: "italic",
          fontSize: 14,
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
          maxWidth: 380,
          lineHeight: 1.5,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.6 }}
      >
        {meta.epigraph}
      </motion.p>

      {/* Live waveform */}
      <motion.div
        className="mt-10 w-full"
        style={{ maxWidth: 560 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <div ref={canvasContainerRef} style={{ width: "100%" }}>
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>
      </motion.div>

      {/* Seekable progress bar */}
      <motion.div
        className="mt-4 flex items-center gap-3 w-full"
        style={{ maxWidth: 560 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
          minWidth: 28, textAlign: "right",
        }}>
          {formatTime(progress)}
        </span>

        <div
          ref={progressBarRef}
          onMouseDown={handleBarMouseDown}
          onMouseEnter={() => setIsHoveringBar(true)}
          onMouseLeave={() => { if (!isDragging) setIsHoveringBar(false); }}
          onMouseMove={handleBarMouseMove}
          onTouchStart={handleBarTouchStart}
          onTouchMove={handleBarTouchMove}
          onTouchEnd={handleBarTouchEnd}
          style={{
            flex: 1,
            height: 24,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            position: "relative",
            userSelect: "none",
          }}
        >
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            height: showScrubber ? 6 : 3,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            transition: "height 0.15s ease",
          }}>
            {showScrubber && (
              <div style={{
                position: "absolute", height: "100%",
                width: `${hoverPct * 100}%`,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 4, pointerEvents: "none",
              }} />
            )}
            <div style={{
              position: "absolute", height: "100%",
              width: `${Math.min(progress * 100, 100)}%`,
              background: `linear-gradient(to right, ${pins.map((p) => p.color).join(", ")})`,
              borderRadius: 4,
            }} />
          </div>
          {showScrubber && (
            <div style={{
              position: "absolute",
              left: `${Math.min(progress * 100, 100)}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 14, height: 14,
              borderRadius: "50%",
              backgroundColor: "#fff",
              boxShadow: "0 0 8px rgba(255,255,255,0.5)",
              pointerEvents: "none", zIndex: 2,
            }} />
          )}
        </div>

        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
          minWidth: 28,
        }}>
          {formatDuration(audioEngine.duration)}
        </span>
      </motion.div>

      {/* Hover time tooltip */}
      {showScrubber && progressBarRef.current && (
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            left:
              progressBarRef.current.getBoundingClientRect().left +
              hoverPct * progressBarRef.current.getBoundingClientRect().width,
            top: progressBarRef.current.getBoundingClientRect().top - 8,
            transform: "translateX(-50%)",
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.5)",
            background: "rgba(10,14,24,0.9)",
            padding: "2px 6px",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            letterSpacing: "0.06em",
            zIndex: 10,
          }}
        >
          {formatTime(hoverPct)}
        </div>
      )}

      {/* Pin route dots */}
      <motion.div
        className="flex items-center gap-3 mt-8 flex-wrap justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        {pins.map((pin, i) => {
          const isActive = activeSection === i;
          return (
            <div key={pin.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="rounded-full"
                  style={{
                    width: isActive ? 12 : 10,
                    height: isActive ? 12 : 10,
                    backgroundColor: pin.color,
                    boxShadow: isActive ? `0 0 14px ${pin.color}88` : `0 0 8px ${pin.color}44`,
                    opacity: isActive ? 1 : 0.5,
                    transition: "all 0.3s ease",
                  }}
                />
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 8,
                  color: isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase", textAlign: "center", maxWidth: 70,
                  transition: "color 0.3s ease",
                }}>
                  {pin.city || pin.country}
                </span>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 7,
                  color: isActive ? pin.color + "aa" : pin.color + "44",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  transition: "color 0.3s ease",
                }}>
                  {getRegionLabel(pin.musicalRegion)}
                </span>
              </div>
              {i < pins.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, marginBottom: 20 }}>
                  →
                </span>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="flex items-center gap-3 mt-10 flex-wrap justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        <button
          onClick={handlePauseResume}
          className="px-5 py-3 cursor-pointer"
          style={btnBase}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        >
          {pauseLabel}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-3 cursor-pointer"
          style={btnBase}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        >
          <Download size={13} strokeWidth={1.5} />
          Download
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-5 py-3 cursor-pointer"
          style={btnBase}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        >
          <Link size={13} strokeWidth={1.5} />
          {linkCopied ? "Copied!" : "Share"}
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-3 cursor-pointer"
          style={{
            ...btnBase,
            color: "rgba(255,255,255,0.4)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          }}
        >
          New Composition
        </button>
      </motion.div>
    </motion.div>
  );
}