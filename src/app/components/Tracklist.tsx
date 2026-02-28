import { motion, AnimatePresence } from "motion/react";
import type { GlobePin } from "./Globe";
import { getRegionLabel } from "./AudioEngine";

interface TracklistProps {
  pins: GlobePin[];
  onPinRemove?: (pinId: number) => void;
}

export function Tracklist({ pins, onPinRemove }: TracklistProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-8 py-4"
      style={{
        background: "linear-gradient(to top, #070a0fee 0%, #070a0f88 60%, transparent 100%)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
    >
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginRight: 8,
          flexShrink: 0,
        }}
      >
        Track
      </span>
      <div className="flex items-center gap-2 overflow-x-auto">
        <AnimatePresence>
          {pins.map((pin, i) => (
            <motion.button
              key={pin.id}
              className="flex items-center gap-2 px-3 py-1.5 shrink-0 cursor-pointer group"
              style={{
                background: `${pin.color}10`,
                border: `1px solid ${pin.color}30`,
                borderRadius: 3,
              }}
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              onClick={() => onPinRemove?.(pin.id)}
              title={`Click to remove ${pin.city || pin.country}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${pin.color}88`;
                e.currentTarget.style.background = `${pin.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${pin.color}30`;
                e.currentTarget.style.background = `${pin.color}10`;
              }}
            >
              <div
                className="w-2 h-2 rotate-45"
                style={{ backgroundColor: pin.color }}
              />
              <div className="flex flex-col">
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.55)",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                  }}
                >
                  {pin.city || pin.country}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 8,
                    color: pin.color + "88",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textAlign: "left",
                  }}
                >
                  {getRegionLabel(pin.musicalRegion)}
                </span>
              </div>
              {/* Remove indicator on hover */}
              <span
                className="opacity-0 group-hover:opacity-100"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  marginLeft: 2,
                  transition: "opacity 0.2s ease",
                }}
              >
                &times;
              </span>
              {i < pins.length - 1 && (
                <span
                  style={{
                    color: "rgba(255,255,255,0.15)",
                    marginLeft: 4,
                    fontSize: 10,
                  }}
                >
                  &rarr;
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      {pins.length === 0 && (
        <motion.span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.15)",
            letterSpacing: "0.06em",
          }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Click anywhere on the globe to begin
        </motion.span>
      )}
    </motion.div>
  );
}
