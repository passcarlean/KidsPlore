const ICON_EMOJI: Record<string, string> = {
  rocket:    "🚀",
  star:      "⭐",
  trophy:    "🏆",
  lock:      "🔓",
  zap:       "⚡",
  brain:     "🧠",
  flame:     "🔥",
  film:      "🎬",
  palette:   "🎨",
  globe:     "🌍",
  beaker:    "🧪",
  "arrow-up":"📈",
  medal:     "🥇",
  shield:    "🛡️",
  heart:     "❤️",
  music:     "🎵",
  atom:      "⚛️",
  cpu:       "💻",
  microscope:"🔬",
  telescope: "🔭",
  dna:       "🧬",
  calculator:"🧮",
  robot:     "🤖",
  diamond:   "💎",
};

export function iconToEmoji(icon: string): string {
  return ICON_EMOJI[icon] ?? "✨";
}
