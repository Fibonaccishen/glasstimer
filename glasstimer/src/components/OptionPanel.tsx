import { motion } from "framer-motion";
import "./OptionPanel.css";

interface TimeOption {
  label: string;
  value: number;
}

const options: TimeOption[] = [
  { label: "+1min", value: 60 * 1000 },
  { label: "+10min", value: 10 * 60 * 1000 },
  { label: "+1h", value: 60 * 60 * 1000 },
];

interface OptionPanelProps {
  onSelect: (ms: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 50,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function OptionPanel({ onSelect }: OptionPanelProps) {
  return (
    <motion.div
      className="option-panel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {options.map((option) => (
        <motion.button
          key={option.label}
          className="option-button"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
