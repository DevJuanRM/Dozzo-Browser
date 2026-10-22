import React, { useState, useEffect } from 'react';
import {
  Search,
  Shield,
  TrendingUp,
  Bot,
  MessageSquare,
  BookOpen,
  Lock,
  ArrowUpRight,
  ChevronDown,
  Globe,
  Sparkles,
  Zap,
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Image as ImageIcon,
  Palette,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { YoutubeIcon, GithubIcon } from './Icons';
import { SEARCH_ENGINES, getSearchUrl, getEngine } from '../utils/searchEngines';

const ABSTRACT_WALLPAPERS = [
  {
    id: 'aurora',
    name: 'Obsidian Aurora',
    background: 'radial-gradient(ellipse at 15% 20%, rgba(139, 92, 246, 0.22) 0%, transparent 45%), radial-gradient(ellipse at 85% 80%, rgba(6, 182, 212, 0.18) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%), #000000'
  },
  {
    id: 'cyber',
    name: 'Cyber Gold & Emerald',
    background: 'radial-gradient(circle at 50% -10%, rgba(240, 185, 11, 0.20) 0%, transparent 55%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.16) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.12) 0%, transparent 45%), #000000'
  },
  {
    id: 'crimson',
    name: 'Midnight Velvet',
    background: 'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.18) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.16) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgba(249, 115, 22, 0.10) 0%, transparent 50%), #000000'
  },
  {
    id: 'abyss',
    name: 'Ocean Abyss',
    background: 'radial-gradient(ellipse at 50% 100%, rgba(14, 165, 233, 0.22) 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), #000000'
  }
];

export default function NewTabPage({
  onNavigate,
  searchEngine = 'duckduckgo',
  onChangeSearchEngine,
  blockedCount,
  onOpenBinance
}) {
  const [query, setQuery] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('Bienvenido');
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);

  // Wallpaper System State
  const [wallpaperMode, setWallpaperMode] = useState(() => localStorage.getItem('dozzo_wallpaper_mode') || 'oled');
  const [wallpaperIndex, setWallpaperIndex] = useState(() => parseInt(localStorage.getItem('dozzo_wallpaper_idx') || '0', 10));

  // Live Weather State
  const [weather, setWeather] = useState({
    temp: '21°C',
    condition: 'Despejado',
    city: 'Bogotá',
    wind: '12 km/h',
    code: 0,
    loading: false
  });

  // Crypto Ticker State
  const [cryptoData, setCryptoData] = useState([
    { symbol: 'BTC', price: '$84,250', change: '+2.45%', isPositive: true },
    { symbol: 'ETH', price: '$2,680', change: '+1.80%', isPositive: true },
    { symbol: 'SOL', price: '$182', change: '+4.90%', isPositive: true },
    { symbol: 'BNB', price: '$645', change: '-0.30%', isPositive: false },
    { symbol: 'XRP', price: '$1.42', change: '+3.15%', isPositive: true }
  ]);

  const currentEngine = getEngine(searchEngine);

  // Live Clock & Dynamic Greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(
        now.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })
      );
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) setGreeting('Buenos días');
      else if (hour >= 12 && hour < 19) setGreeting('Buenas tardes');
      else setGreeting('Buenas noches');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Real Live Weather (Open-Meteo Free API)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fallback default coordinates (Bogotá: 4.6097, -74.0817) or detect
        let lat = 4.6097;
        let lon = -74.0817;
        let cityName = 'Bogotá';

        // Check timezone to adjust default city
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes('Madrid') || tz.includes('Europe')) {
          lat = 40.4168; lon = -3.7038; cityName = 'Madrid';
        } else if (tz.includes('New_York') || tz.includes('Miami')) {
          lat = 25.7617; lon = -80.1918; cityName = 'Miami';
        } else if (tz.includes('Mexico')) {
          lat = 19.4326; lon = -99.1332; cityName = 'CDMX';
        } else if (tz.includes('Buenos_Aires')) {
          lat = -34.6037; lon = -58.3816; cityName = 'Buenos Aires';
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        if (res.ok) {
          const data = await res.json();
          const curr = data.current_weather;
          if (curr) {
            const code = curr.weathercode;
            let condition = 'Despejado';
            if (code >= 1 && code <= 3) condition = 'Parcialmente Nublado';
            else if (code >= 45 && code <= 48) condition = 'Niebla';
            else if (code >= 51 && code <= 67) condition = 'Lluvia Ligera';
            else if (code >= 71 && code <= 77) condition = 'Nieve';
            else if (code >= 80 && code <= 82) condition = 'Chubascos';
            else if (code >= 95) condition = 'Tormenta';

            setWeather({
              temp: `${Math.round(curr.temperature)}°C`,
              condition,
              city: cityName,
              wind: `${Math.round(curr.windspeed)} km/h`,
              code,
              loading: false
            });
          }
        }
      } catch (e) {
        console.warn('Weather fetch warning:', e);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 mins
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Crypto Ticker
  useEffect(() => {
    const fetchQuickCrypto = async () => {
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22,%22BNBUSDT%22,%22XRPUSDT%22]'
        );
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((item) => ({
            symbol: item.symbol.replace('USDT', ''),
            price: `$${parseFloat(item.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 1 })}`,
            change: `${parseFloat(item.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(item.priceChangePercent).toFixed(2)}%`,
            isPositive: parseFloat(item.priceChangePercent) >= 0
          }));
          setCryptoData(mapped);
        }
      } catch (e) {}
    };
    fetchQuickCrypto();
    const interval = setInterval(fetchQuickCrypto, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate wallpapers every 50 seconds if abstract mode is active
  useEffect(() => {
    if (wallpaperMode === 'abstract') {
      const timer = setInterval(() => {
        setWallpaperIndex((prev) => {
          const next = (prev + 1) % ABSTRACT_WALLPAPERS.length;
          localStorage.setItem('dozzo_wallpaper_idx', String(next));
          return next;
        });
      }, 50000);
      return () => clearInterval(timer);
    }
  }, [wallpaperMode]);

  const toggleWallpaperMode = () => {
    const nextMode = wallpaperMode === 'oled' ? 'abstract' : 'oled';
    setWallpaperMode(nextMode);
    localStorage.setItem('dozzo_wallpaper_mode', nextMode);
  };

  const cycleWallpaper = (e) => {
    e.stopPropagation();
    const next = (wallpaperIndex + 1) % ABSTRACT_WALLPAPERS.length;
    setWallpaperIndex(next);
    localStorage.setItem('dozzo_wallpaper_idx', String(next));
    if (wallpaperMode !== 'abstract') {
      setWallpaperMode('abstract');
      localStorage.setItem('dozzo_wallpaper_mode', 'abstract');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const target = query.trim();
    if (!target) return;

    const isUrl =
      /^https?:\/\//i.test(target) ||
      /^localhost(:[0-9]+)?/i.test(target) ||
      /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(target);

    if (isUrl) {
      onNavigate(target.startsWith('http') ? target : `https://${target}`);
    } else {
      const searchUrl = getSearchUrl(searchEngine, target);
      onNavigate(searchUrl);
    }
  };

  const shortcuts = [
    {
      title: 'YouTube',
      badge: '100% Sin Anuncios',
      url: 'https://www.youtube.com',
      icon: <YoutubeIcon size={26} color="#FF0000" />,
      color: 'rgba(255, 0, 0, 0.14)'
    },
    {
      title: 'Binance',
      badge: 'Spot & Futuros',
      url: 'https://www.binance.com',
      icon: <TrendingUp size={26} color="#F0B90B" />,
      color: 'rgba(240, 185, 11, 0.14)'
    },
    {
      title: 'Spotify Web',
      badge: 'Música & Podcasts',
      url: 'https://open.spotify.com',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#1ED760">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.497 17.306c-.216.353-.674.465-1.027.25-2.825-1.728-6.38-2.119-10.569-1.163-.404.092-.806-.16-.898-.564-.092-.404.16-.806.564-.898 4.582-1.047 8.52-.604 11.68 1.348.353.216.465.674.25 1.027zm1.468-3.262c-.272.443-.852.584-1.295.312-3.235-1.988-8.167-2.564-11.994-1.401-.497.151-1.026-.134-1.177-.631-.151-.497.134-1.026.631-1.177 4.379-1.33 9.816-.688 13.523 1.59.443.272.584.852.312 1.307zm.126-3.41c-3.878-2.303-10.278-2.515-13.987-1.388-.595.181-1.229-.155-1.41-.75-.181-.595.155-1.229.75-1.41 4.264-1.295 11.325-1.043 15.795 1.611.536.318.712 1.012.394 1.548-.318.536-1.012.712-1.542.389z" />
        </svg>
      ),
      color: 'rgba(30, 215, 96, 0.14)'
    },
    {
      title: 'ChatGPT',
      badge: 'IA Asistente',
      url: 'https://chatgpt.com',
      icon: <Bot size={26} color="#10A37F" />,
      color: 'rgba(16, 163, 127, 0.14)'
    },
    {
      title: 'GitHub',
      badge: 'Repositorios',
      url: 'https://github.com',
      icon: <GithubIcon size={26} color="var(--text-primary)" />,
      color: 'rgba(255, 255, 255, 0.08)'
    },
    {
      title: 'Reddit',
      badge: 'Comunidades',
      url: 'https://reddit.com',
      icon: <MessageSquare size={26} color="#FF4500" />,
      color: 'rgba(255, 69, 0, 0.14)'
    },
    {
      title: 'Wikipedia',
      badge: 'Enciclopedia',
      url: 'https://es.wikipedia.org',
      icon: <BookOpen size={26} color="var(--text-secondary)" />,
      color: 'rgba(148, 163, 184, 0.12)'
    },
    {
      title: 'X / Twitter',
      badge: 'Tendencias',
      url: 'https://x.com',
      icon: (
        <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>𝕏</span>
      ),
      color: 'rgba(255, 255, 255, 0.12)'
    }
  ];

  const currentWallpaper = ABSTRACT_WALLPAPERS[wallpaperIndex] || ABSTRACT_WALLPAPERS[0];
  const activeBackground = wallpaperMode === 'abstract' ? currentWallpaper.background : '#000000';

  return (
    <div
      style={{
        ...styles.container,
        background: activeBackground,
        transition: 'background 0.8s ease-in-out'
      }}
    >
      <div style={styles.dashboardContainer} className="custom-scrollbar">
        {/* Top Header Row: Weather Pill (Left) + Clock/Greeting (Center) + Status Badge (Right) */}
        <div style={styles.headerRow}>
          {/* Live Weather Widget */}
          <div style={styles.weatherCard} title="Clima en vivo actualizado">
            <div style={styles.weatherIconBox}>
              {weather.code >= 51 ? (
                <CloudRain size={18} color="#38BDF8" />
              ) : weather.code >= 1 ? (
                <Cloud size={18} color="#94A3B8" />
              ) : (
                <Sun size={18} color="#F59E0B" />
              )}
            </div>
            <div>
              <div style={styles.weatherTempRow}>
                <span style={styles.weatherTemp}>{weather.temp}</span>
                <span style={styles.weatherCity}>{weather.city}</span>
              </div>
              <div style={styles.weatherDescRow}>
                <span>{weather.condition}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{weather.wind}</span>
              </div>
            </div>
          </div>

          {/* Central Clock & Dynamic Greeting */}
          <div style={styles.clockCenter}>
            <div style={styles.greetingText}>{greeting}</div>
            <div style={styles.clockDisplay}>{timeStr || '12:00'}</div>
            <div style={styles.dateDisplay}>{dateStr}</div>
          </div>

          {/* Privacy Security Summary Pill */}
          <div style={styles.securityPill}>
            <div style={styles.secShieldDot}>
              <Shield size={14} color="#10B981" />
            </div>
            <div>
              <div style={styles.secTitle}>Dozzo Shield Activo</div>
              <div style={styles.secCount}>{blockedCount} bloqueados</div>
            </div>
          </div>
        </div>

        {/* Spacious High-Gloss Omnibar Search Form */}
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <div style={styles.searchBar}>
            {/* Interactive Engine Selector Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={styles.engineSelectBtn}
                onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
                title="Cambiar motor de búsqueda"
              >
                <span style={styles.engineName}>{currentEngine.name}</span>
                <ChevronDown size={13} style={{ opacity: 0.7 }} />
              </button>

              {isEngineMenuOpen && (
                <div style={styles.engineDropdown} className="glass-panel animate-slide-down">
                  <div style={styles.engineDropdownTitle}>Motores de Búsqueda</div>
                  {SEARCH_ENGINES.map((eng) => (
                    <div
                      key={eng.id}
                      style={{
                        ...styles.engineOption,
                        backgroundColor: searchEngine === eng.id ? 'var(--bg-hover)' : 'transparent'
                      }}
                      onClick={() => {
                        onChangeSearchEngine(eng.id);
                        setIsEngineMenuOpen(false);
                      }}
                    >
                      <span style={{ fontWeight: searchEngine === eng.id ? '700' : '500', color: '#ffffff' }}>
                        {eng.name}
                      </span>
                      {searchEngine === eng.id && <div style={styles.activeDot} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder={`Buscar con ${currentEngine.name} o escribir URL...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.searchInput}
              autoFocus
            />

            <button type="submit" style={styles.searchSubmitBtn} title="Buscar">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Live Crypto Spot Ticker Strip */}
        <div style={styles.cryptoStrip}>
          <div style={styles.cryptoHeader} onClick={onOpenBinance} title="Abrir Crypto Hub con Binance, Coinbase, OKX">
            <div style={styles.livePulse} />
            <span>Binance Live</span>
            <ArrowUpRight size={13} />
          </div>

          <div style={styles.cryptoCards}>
            {cryptoData.map((coin) => (
              <div
                key={coin.symbol}
                style={styles.cryptoCard}
                onClick={onOpenBinance}
                title={`Ver detalles de ${coin.symbol}`}
              >
                <span style={styles.coinSymbol}>{coin.symbol}</span>
                <span style={styles.coinPrice}>{coin.price}</span>
                <span
                  style={{
                    ...styles.coinChange,
                    color: coin.isPositive ? '#10B981' : '#EF4444'
                  }}
                >
                  {coin.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Elegant Pro Shortcuts Grid (Expanded 4-Column Layout) */}
        <div style={styles.shortcutsGrid}>
          {shortcuts.map((sc) => (
            <div
              key={sc.title}
              style={styles.shortcutCard}
              onClick={() => onNavigate(sc.url)}
              title={`Ir a ${sc.title}`}
            >
              <div style={{ ...styles.shortcutIconBox, backgroundColor: sc.color }}>
                {sc.icon}
              </div>
              <div style={styles.shortcutTitle}>{sc.title}</div>
              <div style={styles.shortcutBadge}>{sc.badge}</div>
            </div>
          ))}
        </div>

        {/* Bottom Privacy Guarantee Card */}
        <div style={styles.shieldBanner}>
          <div style={styles.shieldLeft}>
            <div style={styles.shieldIconWrap}>
              <Shield size={20} color="#10B981" />
            </div>
            <div>
              <div style={styles.shieldTitle}>Escudo Dozzo 100% Blindado</div>
              <div style={styles.shieldSubtitle}>
                Cero telemetría externa • YouTube libre de anuncios • Criptografía moderna
              </div>
            </div>
          </div>
          <div style={styles.shieldStatsRight}>
            <span style={styles.shieldCountNumber}>{blockedCount}</span>
            <span style={styles.shieldCountLabel}>Anuncios y rastreadores evitados</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom-Right Wallpaper & Theme Switcher */}
      <div style={styles.wallpaperFloatingWidget}>
        <button
          style={{
            ...styles.wallpaperModeBtn,
            background: wallpaperMode === 'abstract' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)'
          }}
          onClick={toggleWallpaperMode}
          title={wallpaperMode === 'abstract' ? 'Cambiar a Negro Puro OLED' : 'Activar Fondos Abstractos'}
        >
          {wallpaperMode === 'abstract' ? <Palette size={14} color="var(--accent)" /> : <ImageIcon size={14} />}
          <span>{wallpaperMode === 'abstract' ? currentWallpaper.name : 'Negro OLED Plano'}</span>
        </button>

        {wallpaperMode === 'abstract' && (
          <button
            style={styles.cycleWallpaperBtn}
            onClick={cycleWallpaper}
            title="Siguiente fondo abstracto"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  dashboardContainer: {
    width: '100%',
    maxWidth: '1080px',
    padding: '30px 24px 60px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px'
  },
  headerRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px'
  },
  weatherCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    minWidth: '170px'
  },
  weatherIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  weatherTempRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px'
  },
  weatherTemp: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#ffffff'
  },
  weatherCity: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  weatherDescRow: {
    fontSize: '10.5px',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '4px',
    marginTop: '2px'
  },
  clockCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  greetingText: {
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '2.5px',
    marginBottom: '2px'
  },
  clockDisplay: {
    fontSize: '52px',
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: '-1.5px',
    lineHeight: '1'
  },
  dateDisplay: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
    marginTop: '4px'
  },
  securityPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    minWidth: '170px'
  },
  secShieldDot: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(16, 185, 129, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff'
  },
  secCount: {
    fontSize: '10.5px',
    color: '#10B981',
    fontWeight: '600',
    marginTop: '1px'
  },
  searchForm: {
    width: '100%',
    maxWidth: '820px'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: '18px',
    padding: '6px 8px 6px 14px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.25s ease'
  },
  engineSelectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700'
  },
  engineName: {
    color: '#ffffff'
  },
  engineDropdown: {
    position: 'absolute',
    top: '46px',
    left: '0',
    width: '190px',
    background: 'rgba(18, 18, 18, 0.96)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8)',
    zIndex: 100
  },
  engineDropdownTitle: {
    fontSize: '10.5px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    padding: '4px 8px',
    letterSpacing: '0.5px'
  },
  engineOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  },
  activeDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '400',
    letterSpacing: '0.2px',
    padding: '0 14px'
  },
  searchSubmitBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px var(--accent-glow)',
    transition: 'transform 0.15s ease'
  },
  cryptoStrip: {
    width: '100%',
    maxWidth: '820px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 18px',
    borderRadius: '14px',
    background: 'rgba(240, 185, 11, 0.05)',
    border: '1px solid rgba(240, 185, 11, 0.2)',
    flexWrap: 'wrap',
    gap: '10px'
  },
  cryptoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#F0B90B',
    cursor: 'pointer'
  },
  livePulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 8px #10B981'
  },
  cryptoCards: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  cryptoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '12.5px',
    padding: '4px 10px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    transition: 'background 0.15s ease'
  },
  coinSymbol: {
    fontWeight: '700',
    color: '#ffffff'
  },
  coinPrice: {
    fontFamily: 'JetBrains Mono, monospace',
    color: 'var(--text-secondary)'
  },
  coinChange: {
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '700',
    fontSize: '11px'
  },
  shortcutsGrid: {
    width: '100%',
    maxWidth: '820px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px'
  },
  shortcutCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 10px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  shortcutIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px'
  },
  shortcutTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center'
  },
  shortcutBadge: {
    fontSize: '10.5px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    marginTop: '3px',
    textAlign: 'center'
  },
  shieldBanner: {
    width: '100%',
    maxWidth: '820px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
    flexWrap: 'wrap',
    gap: '14px'
  },
  shieldLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  shieldIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(16, 185, 129, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shieldTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#ffffff'
  },
  shieldSubtitle: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    marginTop: '3px'
  },
  shieldStatsRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  shieldCountNumber: {
    fontSize: '22px',
    fontWeight: '800',
    fontFamily: 'JetBrains Mono, monospace',
    color: '#10B981'
  },
  shieldCountLabel: {
    fontSize: '10.5px',
    color: 'var(--text-muted)'
  },
  wallpaperFloatingWidget: {
    position: 'fixed',
    bottom: '18px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    zIndex: 40
  },
  wallpaperModeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(16px)',
    color: '#ffffff',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
    transition: 'all 0.2s ease'
  },
  cycleWallpaperBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(16px)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};
