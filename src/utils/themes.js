// 10 Curated Modern Color Themes for Dozzo Browser
export const CURATED_THEMES = [
  {
    id: 'obsidian-aurora',
    name: 'Obsidian Aurora',
    type: 'dark',
    primaryColor: '#0a0a0f',
    accentColor: '#a855f7',
    badge: 'Oscuro'
  },
  {
    id: 'binance-gold',
    name: 'Binance Gold',
    type: 'dark',
    primaryColor: '#090805',
    accentColor: '#F0B90B',
    badge: 'Oscuro'
  },
  {
    id: 'midnight-cyber',
    name: 'Midnight Cyber',
    type: 'dark',
    primaryColor: '#070c14',
    accentColor: '#06B6D4',
    badge: 'Oscuro'
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    type: 'dark',
    primaryColor: '#0f101a',
    accentColor: '#f43f5e',
    badge: 'Oscuro'
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    type: 'dark',
    primaryColor: '#060b08',
    accentColor: '#10B981',
    badge: 'Oscuro'
  },
  {
    id: 'sunset-royale',
    name: 'Sunset Royale',
    type: 'dark',
    primaryColor: '#100b10',
    accentColor: '#F97316',
    badge: 'Oscuro'
  },
  {
    id: 'titanium-space',
    name: 'Titanium Space',
    type: 'dark',
    primaryColor: '#121316',
    accentColor: '#94A3B8',
    badge: 'Oscuro'
  },
  {
    id: 'mac-snow',
    name: 'Mac Snow',
    type: 'light',
    primaryColor: '#ffffff',
    accentColor: '#0f172a',
    badge: 'Claro'
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    type: 'light',
    primaryColor: '#eef4fb',
    accentColor: '#2563EB',
    badge: 'Claro'
  },
  {
    id: 'latte-champagne',
    name: 'Latte Champagne',
    type: 'light',
    primaryColor: '#f7f4ee',
    accentColor: '#B48324',
    badge: 'Claro'
  }
];

export function getTheme(id) {
  return CURATED_THEMES.find((t) => t.id === id) || CURATED_THEMES[0];
}

export function getNextTheme(currentId) {
  const idx = CURATED_THEMES.findIndex((t) => t.id === currentId);
  const nextIdx = (idx + 1) % CURATED_THEMES.length;
  return CURATED_THEMES[nextIdx];
}
