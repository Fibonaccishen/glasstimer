import { useRef } from "react";
import { motion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./GlassOrb.css";

interface GlassOrbProps {
  children: React.ReactNode;
  isExpanded: boolean;
}

export function GlassOrb({ children, isExpanded }: GlassOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".orb-content")) {
      getCurrentWindow().startDragging();
    }
  };

  return (
    <motion.div
      ref={orbRef}
      className="glass-orb"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        width: isExpanded ? 280 : 56,
        height: 56,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="glass-highlight" />
      <div className="orb-content">{children}</div>
    </motion.div>
  );
}
