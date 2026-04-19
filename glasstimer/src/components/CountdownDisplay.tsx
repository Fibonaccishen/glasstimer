import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { formatTime, getAccentColor } from "../utils/time";
import "./CountdownDisplay.css";

interface CountdownDisplayProps {
  remaining: number;
  onReset: () => void;
}

export function CountdownDisplay({ remaining, onReset }: CountdownDisplayProps) {
  const { value, unit } = formatTime(remaining);
  const [prevValue, setPrevValue] = useState(value);
  const accentColor = getAccentColor(remaining);
  const isDone = remaining <= 0;

  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <motion.div
      className="countdown-display"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        boxShadow: `0 0 20px ${accentColor}, 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        borderColor: accentColor,
      }}
      onClick={onReset}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="glass-highlight" />
      <AnimatePresence mode="popLayout">
        {isDone ? (
          <motion.span
            key="done"
            className="done-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Done!
          </motion.span>
        ) : (
          <motion.div
            key="countdown"
            className="countdown-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <span className="countdown-value">{value}</span>
            <span className="countdown-unit">{unit}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
