export const COLOR_FIELDS = [
  { key: "background", label: "Page background", css: "--background" },
  { key: "foreground", label: "Body text", css: "--foreground" },
  { key: "card", label: "Cards / paper", css: "--card" },
  { key: "primary", label: "Primary buttons", css: "--primary" },
  { key: "primaryForeground", label: "Text on buttons", css: "--primary-foreground" },
  { key: "accent", label: "Accent / gold", css: "--accent" },
  { key: "muted", label: "Muted surfaces", css: "--muted" },
  { key: "mutedForeground", label: "Muted text", css: "--muted-foreground" },
  { key: "ink", label: "Ink", css: "--color-ink" },
  { key: "paper", label: "Paper", css: "--color-paper" },
  { key: "cream", label: "Cream", css: "--color-cream" },
  { key: "sea", label: "Sea", css: "--color-sea" },
  { key: "seaDeep", label: "Sea deep", css: "--color-sea-deep" },
  { key: "teal", label: "Teal", css: "--color-teal" },
  { key: "aqua", label: "Aqua", css: "--color-aqua" },
  { key: "gold", label: "Gold", css: "--color-gold" },
  { key: "earth", label: "Earth", css: "--color-earth" },
  { key: "clay", label: "Clay", css: "--color-clay" },
  { key: "clayDeep", label: "Clay deep", css: "--color-clay-deep" },
  { key: "blush", label: "Blush", css: "--color-blush" },
  { key: "blushDeep", label: "Blush deep", css: "--color-blush-deep" },
  { key: "plum", label: "Plum", css: "--color-plum" },
  { key: "plumDeep", label: "Plum deep", css: "--color-plum-deep" },
  { key: "wine", label: "Wine", css: "--color-wine" },
  { key: "washLinen", label: "Wash · linen", css: "--wash-linen" },
  { key: "washClay", label: "Wash · clay", css: "--wash-clay" },
  { key: "washBlush", label: "Wash · blush", css: "--wash-blush" },
  { key: "washPlum", label: "Wash · plum", css: "--wash-plum" },
  { key: "washSea", label: "Wash · sea", css: "--wash-sea" },
  { key: "glowA", label: "Glow A", css: "--glow-a" },
  { key: "glowB", label: "Glow B", css: "--glow-b" },
  { key: "glowC", label: "Glow C", css: "--glow-c" },
] as const;

export type ColorKey = (typeof COLOR_FIELDS)[number]["key"];
export type StudioColors = Record<ColorKey, string>;

export const DEFAULT_COLORS: StudioColors = {
  background: "#f6efe4",
  foreground: "#1e221f",
  card: "#fffaf3",
  primary: "#2a756c",
  primaryForeground: "#fbf6ee",
  accent: "#d4a24a",
  muted: "#efe6d6",
  mutedForeground: "#5c6864",
  ink: "#1e221f",
  paper: "#fffaf3",
  cream: "#fbf6ee",
  sea: "#2a756c",
  seaDeep: "#1b4d47",
  teal: "#4ea89c",
  aqua: "#8ed4cb",
  gold: "#d4a24a",
  earth: "#9a5c32",
  clay: "#c45c3e",
  clayDeep: "#8e3d28",
  blush: "#c16b78",
  blushDeep: "#8a3f4c",
  plum: "#5d4a72",
  plumDeep: "#3d314c",
  wine: "#6e3340",
  washLinen: "#f0e2cc",
  washClay: "#f6ddd3",
  washBlush: "#f7e0e2",
  washPlum: "#ebe3f0",
  washSea: "#dceae7",
  glowA: "#c45c3e",
  glowB: "#d4a24a",
  glowC: "#8ed4cb",
};

export const COLOR_SWATCHES = [
  "#ffffff", "#fffaf3", "#fbf6ee", "#f6efe4", "#f0e2cc", "#efe4d2", "#e4ece8", "#dceae7",
  "#f7e0e2", "#f6ddd3", "#ebe3f0", "#f3c9ce", "#f0c4b4", "#dcc6ea", "#c9b8a0", "#b7c4c0",
  "#1e221f", "#121614", "#1a221f", "#24302c", "#2a2218", "#3a241e", "#3a2428", "#2a2230",
  "#1a2c28", "#101918", "#0b1020", "#1b1030", "#3d314c", "#4e5753", "#5c6864", "#6e3340",
  "#2a756c", "#1b4d47", "#4ea89c", "#7ebeb4", "#8ed4cb", "#0f766e", "#134e4a", "#042f2e",
  "#d4a24a", "#e0b86a", "#f5d76e", "#ffd166", "#c9a227", "#b45309", "#9a5c32", "#5c3d16",
  "#c45c3e", "#8e3d28", "#ea580c", "#f97316", "#fb7185", "#c16b78", "#8a3f4c", "#9b3d3d",
  "#5d4a72", "#7c3aed", "#a855f7", "#c084fc", "#ec4899", "#db2777", "#be185d", "#6d28d9",
  "#2563eb", "#38bdf8", "#22d3ee", "#4ade80", "#84cc16", "#facc15", "#fb923c", "#f43f5e",
  "#00ffc6", "#7dffb3", "#ffe566", "#ff7ad9", "#b388ff", "#66f6ff", "#ff6b4a", "#fff1a8",
];

export const COLOR_PRESETS: { id: string; label: string; colors: Partial<StudioColors> }[] = [
  { id: "house", label: "House (default)", colors: DEFAULT_COLORS },
  {
    id: "midnight",
    label: "Midnight gold",
    colors: {
      background: "#121614",
      foreground: "#f3ede3",
      card: "#1a221f",
      primary: "#e0b86a",
      primaryForeground: "#121614",
      accent: "#e0b86a",
      muted: "#1c2623",
      mutedForeground: "#b7c4c0",
      ink: "#f3ede3",
      paper: "#1a221f",
      cream: "#24302c",
      sea: "#7ebeb4",
      seaDeep: "#1a2c28",
      gold: "#e0b86a",
      clay: "#c45c3e",
      blush: "#c16b78",
      plum: "#c084fc",
      washLinen: "#2a2218",
      washClay: "#3a241e",
      washBlush: "#3a2428",
      washPlum: "#2a2230",
      washSea: "#1a2c28",
      glowA: "#e0b86a",
      glowB: "#c084fc",
      glowC: "#7ebeb4",
    },
  },
  {
    id: "blush",
    label: "Blush dawn",
    colors: {
      background: "#fbeaee",
      foreground: "#3a2428",
      card: "#fff7f8",
      primary: "#c16b78",
      primaryForeground: "#fff7f8",
      accent: "#d4a24a",
      sea: "#c16b78",
      gold: "#d4a24a",
      clay: "#c45c3e",
      blush: "#db2777",
      washLinen: "#f7e0e2",
      washClay: "#f6ddd3",
      washBlush: "#fce7f3",
      glowA: "#fb7185",
      glowB: "#f5d76e",
      glowC: "#f0c4b4",
    },
  },
  {
    id: "plum",
    label: "Deep plum",
    colors: {
      background: "#1b1030",
      foreground: "#f3ede3",
      card: "#2a2230",
      primary: "#c084fc",
      primaryForeground: "#1b1030",
      accent: "#e0b86a",
      sea: "#a855f7",
      gold: "#e0b86a",
      plum: "#c084fc",
      washPlum: "#3d314c",
      glowA: "#a855f7",
      glowB: "#ff7ad9",
      glowC: "#66f6ff",
    },
  },
  {
    id: "ember",
    label: "Warm ember",
    colors: {
      background: "#2a2218",
      foreground: "#f6efe4",
      card: "#3a241e",
      primary: "#ea580c",
      primaryForeground: "#fffaf3",
      accent: "#f5d76e",
      clay: "#ea580c",
      gold: "#f5d76e",
      sea: "#c45c3e",
      glowA: "#ff6b4a",
      glowB: "#ffe566",
      glowC: "#fb923c",
    },
  },
  {
    id: "glass",
    label: "Sea glass",
    colors: {
      background: "#dceae7",
      foreground: "#134e4a",
      card: "#f6fbf9",
      primary: "#0f766e",
      primaryForeground: "#f6fbf9",
      accent: "#d4a24a",
      sea: "#0f766e",
      aqua: "#66f6ff",
      glowA: "#00ffc6",
      glowB: "#66f6ff",
      glowC: "#4ade80",
    },
  },
  {
    id: "neon",
    label: "Neon glow",
    colors: {
      background: "#0b1020",
      foreground: "#fffaf3",
      card: "#151a2e",
      primary: "#ff7ad9",
      primaryForeground: "#0b1020",
      accent: "#00ffc6",
      gold: "#ffe566",
      sea: "#66f6ff",
      clay: "#ff6b4a",
      blush: "#ff7ad9",
      plum: "#b388ff",
      glowA: "#ff7ad9",
      glowB: "#00ffc6",
      glowC: "#b388ff",
    },
  },
];

export type StudioLayout = {
  hero: "cinematic" | "split" | "centered";
  photo: "left" | "right";
  spacing: "airy" | "regular" | "compact";
  corners: "round" | "soft" | "sharp";
  glow: "off" | "soft" | "strong" | "neon";
  nav: "overlay" | "solid";
  pricing: "dark" | "linen";
  width: "regular" | "wide" | "narrow";
};

export const LAYOUT_DEFAULTS: StudioLayout = {
  hero: "cinematic",
  photo: "right",
  spacing: "airy",
  corners: "round",
  glow: "soft",
  nav: "overlay",
  pricing: "dark",
  width: "regular",
};

export type StudioTheme = {
  colors: StudioColors;
  layout: StudioLayout;
};

export function mergeStudio(partial?: { colors?: Partial<StudioColors>; layout?: Partial<StudioLayout> } | null): StudioTheme {
  return {
    colors: { ...DEFAULT_COLORS, ...(partial?.colors ?? {}) },
    layout: { ...LAYOUT_DEFAULTS, ...(partial?.layout ?? {}) },
  };
}

export function studioCss(theme: StudioTheme): string {
  const c = theme.colors;
  const lines = COLOR_FIELDS.map((field) => `${field.css}: ${c[field.key]};`);
  lines.push(`--ring: ${c.primary};`);
  lines.push(`--card-foreground: ${c.foreground};`);
  lines.push(`--secondary-foreground: ${c.foreground};`);
  lines.push(`--accent-foreground: ${c.foreground};`);
  lines.push(
    `--hero-wash: radial-gradient(1100px 520px at 88% -8%, color-mix(in oklab, ${c.glowA} 28%, transparent), transparent 58%), radial-gradient(900px 480px at -8% 18%, color-mix(in oklab, ${c.glowB} 22%, transparent), transparent 55%), radial-gradient(700px 420px at 50% 110%, color-mix(in oklab, ${c.glowC} 18%, transparent), transparent 50%);`,
  );
  return `:root {\n  ${lines.join("\n  ")}\n}`;
}

export const LAYOUT_OPTIONS = {
  hero: [
    { id: "cinematic", label: "Full-screen cinematic" },
    { id: "split", label: "Split photo + words" },
    { id: "centered", label: "Centered over the photo" },
  ],
  photo: [
    { id: "left", label: "Photo starts on the left" },
    { id: "right", label: "Photo starts on the right" },
  ],
  spacing: [
    { id: "airy", label: "Airy (more space)" },
    { id: "regular", label: "Regular" },
    { id: "compact", label: "Compact" },
  ],
  corners: [
    { id: "round", label: "Soft round" },
    { id: "soft", label: "Gentle" },
    { id: "sharp", label: "Sharp" },
  ],
  glow: [
    { id: "off", label: "No glow" },
    { id: "soft", label: "Soft glow" },
    { id: "strong", label: "Strong glow" },
    { id: "neon", label: "Neon glow" },
  ],
  nav: [
    { id: "overlay", label: "Transparent over the hero" },
    { id: "solid", label: "Solid bar" },
  ],
  pricing: [
    { id: "dark", label: "Dark membership stage" },
    { id: "linen", label: "Light linen stage" },
  ],
  width: [
    { id: "regular", label: "Regular" },
    { id: "wide", label: "Wide" },
    { id: "narrow", label: "Narrow" },
  ],
} as const;
