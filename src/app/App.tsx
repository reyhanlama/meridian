import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StarField } from "./components/StarField";
import { Globe } from "./components/Globe";
import type { GlobePin } from "./components/Globe";
import { Header } from "./components/Header";
import { Tracklist } from "./components/Tracklist";
import { Interstitial } from "./components/Interstitial";
import { Player } from "./components/Player";
import { AudioEngine } from "./components/AudioEngine";

type Phase = "map" | "loading" | "player";

const MAX_PINS = 8;

export default function App() {
  const [pins, setPins] = useState<GlobePin[]>([]);
  const [phase, setPhase] = useState<Phase>("map");
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const pinIdCounter = useRef(0);

  useEffect(() => {
    return () => {
      audioEngineRef.current.dispose();
    };
  }, []);

  const handlePinDrop = useCallback((pin: GlobePin) => {
    pinIdCounter.current += 1;
    const newPin = { ...pin, id: pinIdCounter.current };
    setPins((prev) => [...prev, newPin]);
    audioEngineRef.current.playPinTone(newPin.musicalRegion);
  }, []);

  const handlePinRemove = useCallback((pinId: number) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId));
  }, []);

  const handleClearAll = useCallback(() => {
    setPins([]);
  }, []);

  const handleCompose = useCallback(() => {
    setPhase("loading");
    audioEngineRef.current.renderComposition(pins.map((p) => p.musicalRegion)).catch(console.error);
  }, [pins]);

  const handleLoadingComplete = useCallback(() => {
    setPhase("player");
  }, []);

  const handleReset = useCallback(() => {
    audioEngineRef.current.stop();
    setPhase("map");
    setPins([]);
    pinIdCounter.current = 0;
  }, []);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ backgroundColor: "#070a0f" }}
    >
      {/* Map phase */}
      {phase === "map" && (
        <>
          <StarField />
          <Globe
            pins={pins}
            maxPins={MAX_PINS}
            onPinDrop={handlePinDrop}
            onPinRemove={handlePinRemove}
          />
          <Header
            pinCount={pins.length}
            maxPins={MAX_PINS}
            onCompose={handleCompose}
            onClear={handleClearAll}
          />
          <Tracklist pins={pins} onPinRemove={handlePinRemove} />

          {/* Compose button -- fixed just above tracklist bar, visible at 3+ pins */}
          <AnimatePresence>
            {pins.length >= 3 && pins.length < MAX_PINS && (
              <motion.div
                className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
                style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.5 }}
              >
                <motion.button
                  onClick={handleCompose}
                  className="flex items-center gap-2 px-5 py-2.5 cursor-pointer pointer-events-auto"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    color: "#fff",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.3s ease",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  <span style={{ fontSize: 14 }}>&#9654;</span>
                  Compose Track
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instruction hint when no pins placed */}
          <AnimatePresence>
            {pins.length === 0 && (
              <motion.div
                className="fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center"
                style={{ bottom: "calc(40px + env(safe-area-inset-bottom))" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Click anywhere on the globe to drop a pin
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prominent centered CTA when all 8 pins placed */}
          <AnimatePresence>
            {pins.length >= MAX_PINS && (
              <motion.div
                className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3"
                style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.6 }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  All pins placed
                </span>
                <motion.button
                  onClick={handleCompose}
                  className="flex items-center gap-3 px-8 py-3 cursor-pointer"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    color: "#fff",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    textTransform: "uppercase",
                    backdropFilter: "blur(12px)",
                    transition: "all 0.3s ease",
                  }}
                  whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                >
                  <span style={{ fontSize: 15 }}>&#9654;</span>
                  Compose Track
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle mid-progress hint */}
          <AnimatePresence>
            {pins.length > 0 && pins.length < 3 && (
              <motion.div
                className="fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center"
                style={{ bottom: "calc(40px + env(safe-area-inset-bottom))" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {3 - pins.length} more {3 - pins.length === 1 ? "pin" : "pins"} to unlock compose
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Loading interstitial */}
      <AnimatePresence>
        {phase === "loading" && (
          <Interstitial pins={pins} audioEngine={audioEngineRef.current} onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {/* Player */}
      <AnimatePresence>
        {phase === "player" && (
          <Player
            pins={pins}
            audioEngine={audioEngineRef.current}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 0) translateY(8px); }
          to { opacity: 1; transform: translate(-50%, 0) translateY(0); }
        }
      `}</style>
    </div>
  );
}
