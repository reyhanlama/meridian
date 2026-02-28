import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { GlobePin } from "./Globe";
import { generateStory } from "./storyGenerator";
import { generateAlbumMeta } from "./albumTitle";
import type { AudioEngine } from "./AudioEngine";

interface InterstitialProps {
  pins: GlobePin[];
  audioEngine: AudioEngine;
  onComplete: () => void;
}

export function Interstitial({ pins, audioEngine, onComplete }: InterstitialProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const audioStartedRef = useRef(false);

  const storyLines = useMemo(() => generateStory(pins), [pins]);
  const meta = useMemo(() => generateAlbumMeta(pins), [pins]);

  const LINE_DELAY = 1800;   // ms between each line reveal
  const TITLE_PAUSE = 1200;  // pause before title appears
  const TITLE_HOLD = 2200;   // how long title stays before transitioning
  const FADE_DURATION = 600;

  // Poll for audio render completion and start playback quietly
  useEffect(() => {
    const poll = setInterval(() => {
      if (audioEngine.hasBuffer() && !audioStartedRef.current) {
        audioStartedRef.current = true;
        // Start playback at near-silence
        audioEngine.setVolume(0.05);
        audioEngine.play(0);
        clearInterval(poll);
      }
    }, 100);

    return () => clearInterval(poll);
  }, [audioEngine]);

  // Gradually ramp volume as lines are revealed
  useEffect(() => {
    if (!audioStartedRef.current) return;
    if (visibleLines === 0) return;

    // Volume ramps from ~0.05 to ~0.6 across story lines, then to 1.0 at title
    const progress = visibleLines / storyLines.length;
    const targetVol = 0.05 + progress * 0.55;
    audioEngine.setVolume(targetVol, 1.5);
  }, [visibleLines, storyLines.length, audioEngine]);

  // Ramp to full volume when title appears
  useEffect(() => {
    if (showTitle && audioStartedRef.current) {
      audioEngine.setVolume(1.0, 1.8);
    }
  }, [showTitle, audioEngine]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Reveal story lines one by one
    for (let i = 0; i < storyLines.length; i++) {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, i * LINE_DELAY)
      );
    }

    // After all lines shown, pause, then show title
    const titleTime = storyLines.length * LINE_DELAY + TITLE_PAUSE;
    timers.push(
      setTimeout(() => setShowTitle(true), titleTime)
    );

    // After title holds, fade out and complete
    const exitTime = titleTime + TITLE_HOLD;
    timers.push(
      setTimeout(() => setFadeOut(true), exitTime)
    );
    timers.push(
      setTimeout(onComplete, exitTime + FADE_DURATION)
    );

    return () => timers.forEach(clearTimeout);
  }, [storyLines, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      style={{
        backgroundColor: "#070a0f",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeOut ? FADE_DURATION / 1000 : 0.6 }}
    >
      {/* Story lines — accumulate, don't replace */}
      <div
        className="flex flex-col items-center gap-0"
        style={{ maxWidth: 620, minHeight: 260 }}
      >
        <AnimatePresence>
          {!showTitle && storyLines.slice(0, visibleLines).map((line, i) => {
            // Newer lines are brighter, older ones dim progressively
            const age = visibleLines - 1 - i;
            const alpha = age === 0 ? 0.85 : Math.max(0.15, 0.5 - age * 0.08);
            return (
              <motion.p
                key={`line-${i}`}
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  color: `rgba(255,255,255,${alpha})`,
                  textAlign: "center",
                  lineHeight: 1.7,
                  transition: "color 0.8s ease",
                }}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {line}
              </motion.p>
            );
          })}
        </AnimatePresence>

        {/* Title reveal */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Thin divider */}
              <motion.div
                style={{
                  width: 60,
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  marginBottom: 28,
                }}
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.h1
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(32px, 6vw, 60px)",
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                  lineHeight: 1.1,
                }}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
              >
                {meta.title}
              </motion.h1>

              {/* Subtitle route */}
              <motion.span
                className="mt-4"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {meta.subtitle}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-12">
        {storyLines.map((_, i) => (
          <motion.div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: i < visibleLines ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)",
              transition: "background-color 0.4s ease",
            }}
          />
        ))}
        {/* Title dot */}
        <motion.div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: showTitle ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.08)",
            transition: "background-color 0.4s ease",
            marginLeft: 4,
          }}
        />
      </div>

      {/* Composing label */}
      {!showTitle && (
        <motion.span
          className="mt-4"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Composing
        </motion.span>
      )}
    </motion.div>
  );
}
