import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  pinCount: number;
  maxPins: number;
  onCompose: () => void;
  onClear?: () => void;
}

export function Header({ pinCount, maxPins, onCompose, onClear }: HeaderProps) {
  const canCompose = pinCount >= 3;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5"
      style={{ background: "linear-gradient(to bottom, #070a0fee 0%, #070a0f88 60%, transparent 100%)" }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <div className="flex items-center gap-4 sm:gap-8">
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontSize: 24,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          Meridian
        </h1>
        <div className="flex flex-col gap-0.5">
          <motion.span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
            key={pinCount}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {pinCount} of {maxPins} pins
          </motion.span>
          {/* Pin progress dots */}
          <div className="flex gap-1">
            {Array.from({ length: maxPins }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: i < pinCount ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Clear all button */}
        <AnimatePresence>
          {pinCount > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              onClick={onClear}
              className="px-4 py-2.5 cursor-pointer"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.35)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4,
                textTransform: "uppercase",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              Clear All
            </motion.button>
          )}
        </AnimatePresence>
        {/* Compose button removed — now lives above the tracklist in App.tsx */}
      </div>
    </motion.header>
  );
}