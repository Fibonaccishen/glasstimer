import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassOrb } from "./components/GlassOrb";
import { OptionPanel } from "./components/OptionPanel";
import { CountdownDisplay } from "./components/CountdownDisplay";
import { useTimer } from "./hooks/useTimer";
import { useClickOutside } from "./hooks/useClickOutside";
import "./App.css";

type TimerMode = "idle" | "expanded" | "countdown";

function App() {
  const [mode, setMode] = useState<TimerMode>("idle");
  const { remaining, start, reset } = useTimer();
  const orbRef = useRef<HTMLDivElement>(null);

  useClickOutside(orbRef, () => {
    if (mode === "expanded") {
      setMode("idle");
    }
  });

  const handleOrbClick = useCallback(() => {
    if (mode === "idle") {
      setMode("expanded");
    } else if (mode === "countdown") {
      reset();
      setMode("idle");
    }
  }, [mode, reset]);

  const handleSelectTime = useCallback(
    (ms: number) => {
      start(ms);
      setMode("countdown");
    },
    [start]
  );

  const handleReset = useCallback(() => {
    reset();
    setMode("idle");
  }, [reset]);

  return (
    <div className="app">
      <GlassOrb isExpanded={mode === "expanded"}>
        <motion.div
          ref={orbRef}
          className="orb-inner"
          onClick={handleOrbClick}
          layout
        >
          <AnimatePresence mode="wait">
            {mode === "idle" && (
              <motion.div
                key="plus"
                className="plus-icon"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              >
                +
              </motion.div>
            )}
            {mode === "expanded" && (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <OptionPanel onSelect={handleSelectTime} />
              </motion.div>
            )}
            {mode === "countdown" && (
              <motion.div
                key="countdown"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <CountdownDisplay
                  remaining={remaining}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </GlassOrb>
    </div>
  );
}

export default App;
