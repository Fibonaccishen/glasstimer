export function formatTime(ms: number): { value: string; unit: string } {
  const totalSeconds = Math.floor(ms / 1000);

  if (totalSeconds < 60) {
    return {
      value: totalSeconds.toString().padStart(2, "0"),
      unit: "s",
    };
  } else {
    const minutes = Math.floor(totalSeconds / 60);
    return {
      value: minutes.toString().padStart(2, "0"),
      unit: "m",
    };
  }
}

export function getAccentColor(ms: number): string {
  if (ms <= 0) return "rgba(255, 255, 255, 0.3)";
  if (ms < 10_000) return "var(--accent-red)";
  if (ms < 60_000) return "var(--accent-yellow)";
  if (ms < 300_000) return "var(--accent-green)";
  return "var(--accent-calm)";
}
