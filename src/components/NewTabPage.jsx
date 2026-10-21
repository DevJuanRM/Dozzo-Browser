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
  Sparkles,
  Zap
} from 'lucide-react';
import { YoutubeIcon, GithubIcon } from './Icons';

export default function NewTabPage({
  onNavigate,
  searchEngine,
  onChangeSearchEngine,
  blockedCount,
  onOpenBinance
}) {
  const [query, setQuery] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('Bienvenido');
  const [cryptoData, setCryptoData] = useState([
    { symbol: 'BTC', price: '$68,420', change: '+3.45%', isPositive: true },
    { symbol: 'ETH', price: '$2,640', change: '+2.10%', isPositive: true },
    { symbol: 'BNB', price: '$625', change: '+4.80%', isPositive: true },
    { symbol: 'SOL', price: '$174', change: '+5.60%', isPositive: true }
  ]);

  // Live Clock & Dynamic Greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
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

  // Fetch quick live crypto prices from Binance
  useEffect(() => {
    const fetchQuickCrypto = async () => {
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22BNBUSDT%22,%22SOLUSDT%22]'
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
    const interval = setInterval(fetchQuickCrypto, 10000);
    return () => clearInterval(interval);
  }, []);

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
      let searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(target)}`;
      if (searchEngine === 'brave') {
        searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(target)}`;
      } else if (searchEngine === 'startpage') {
        searchUrl = `https://www.startpage.com/sp/search?query=${encodeURIComponent(target)}`;
      }
      onNavigate(searchUrl);
    }
  };

  const shortcuts = [
    {
      title: 'YouTube',
      badge: '100% Sin Anuncios',
      url: 'https://www.youtube.com',
      icon: <YoutubeIcon size={28} color="#FF0000" />,
      color: 'rgba(255, 0, 0, 0.12)'
    },
    {
      title: 'Binance',
      badge: 'Spot & Futuros',
      url: 'https://www.binance.com',
      icon: <TrendingUp size={26} color="#F0B90B" />,
      color: 'rgba(240, 185, 11, 0.14)'
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
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.innerWrapper}>
        {/* Clock & Greeting Hero */}
        <div style={styles.headerHero}>
          <div style={styles.greetingText}>{greeting}</div>
          <div style={styles.clock}>{timeStr || '12:00'}</div>
          <div style={styles.date}>{dateStr}</div>
        </div>

        {/* Spacious Privacy Search Bar */}
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <div style={styles.searchBar}>
            <div style={styles.searchEngineBadge} title="Búsqueda privada protegida">
              <Lock size={14} color="var(--success)" />
              <span>Privado</span>
            </div>

            <input
              type="text"
              placeholder={`Buscar en ${searchEngine === 'brave' ? 'Brave Search' : 'DuckDuckGo'} o escribir URL...`}
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

        {/* Binance Live Crypto Strip */}
        <div style={styles.cryptoStrip}>
          <div style={styles.cryptoHeader} onClick={onOpenBinance} title="Abrir panel completo de Binance">
            <div style={styles.livePulse} />
            <TrendingUp size={15} color="#F0B90B" />
            <span>Binance Live</span>
            <ArrowUpRight size={13} color="#F0B90B" />
          </div>

          <div style={styles.cryptoCards}>
            {cryptoData.map((coin) => (
              <div
                key={coin.symbol}
                style={styles.cryptoCard}
                onClick={() => onNavigate(`https://www.binance.com/es/trade/${coin.symbol}_USDT`)}
                title={`Operar ${coin.symbol}/USDT en Binance`}
              >
                <span style={styles.coinSymbol}>{coin.symbol}</span>
                <span style={styles.coinPrice}>{coin.price}</span>
                <span
                  style={{
                    ...styles.coinChange,
                    color: coin.isPositive ? 'var(--success)' : 'var(--danger)'
                  }}
                >
                  {coin.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacious Quick Shortcuts Grid */}
        <div style={styles.shortcutsGrid}>
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              style={styles.shortcutCard}
              onClick={() => onNavigate(sc.url)}
              title={sc.url}
            >
              <div style={{ ...styles.shortcutIconBox, backgroundColor: sc.color }}>
                {sc.icon}
              </div>
              <div style={styles.shortcutTitle}>{sc.title}</div>
              <div style={styles.shortcutBadge}>{sc.badge}</div>
            </div>
          ))}
        </div>

        {/* Privacy & Adblock Banner */}
        <div style={styles.shieldBanner}>
          <div style={styles.shieldLeft}>
            <div style={styles.shieldIconWrap}>
              <Shield size={22} color="var(--success)" />
            </div>
            <div>
              <div style={styles.shieldTitle}>Escudo Dozzo 100% Activo</div>
              <div style={styles.shieldSubtitle}>
                Cero telemetría externa • YouTube libre de anuncios • Búsquedas privadas
              </div>
            </div>
          </div>
          <div style={styles.shieldStatsRight}>
            <span style={styles.shieldCountNumber}>{blockedCount}</span>
            <span style={styles.shieldCountLabel}>Anuncios y rastreadores bloqueados</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 15%, rgba(240, 185, 11, 0.06) 0%, var(--bg-primary) 65%)',
    padding: '48px 32px',
    userSelect: 'none'
  },
  innerWrapper: {
    width: '100%',
    maxWidth: '880px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px'
  },
  headerHero: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  greetingText: {
    fontSize: '15px',
    fontWeight: '400',
    color: 'var(--text-muted)',
    letterSpacing: '0.8px',
    textTransform: 'uppercase'
  },
  clock: {
    fontSize: '68px',
    fontWeight: '300',
    letterSpacing: '-1px',
    color: 'var(--text-primary)',
    lineHeight: 1
  },
  date: {
    fontSize: '15px',
    fontWeight: '400',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize'
  },
  searchForm: {
    width: '100%',
    maxWidth: '720px'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    height: '56px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-hover)',
    borderRadius: '16px',
    padding: '0 10px 0 16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.28)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  searchEngineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--success)',
    background: 'var(--success-glow)',
    padding: '5px 10px',
    borderRadius: '8px',
    marginRight: '12px'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontWeight: '400',
    letterSpacing: '0.2px'
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
    boxShadow: '0 2px 8px var(--accent-glow)',
    transition: 'transform 0.15s ease'
  },
  cryptoStrip: {
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 18px',
    borderRadius: '14px',
    background: 'rgba(240, 185, 11, 0.05)',
    border: '1px solid rgba(240, 185, 11, 0.2)'
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
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 8px var(--success)'
  },
  cryptoCards: {
    display: 'flex',
    gap: '16px'
  },
  cryptoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '12.5px',
    padding: '4px 10px',
    borderRadius: '8px',
    transition: 'background 0.15s ease'
  },
  coinSymbol: {
    fontWeight: '700',
    color: 'var(--text-primary)'
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
    maxWidth: '720px',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '14px'
  },
  shortcutCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '18px 8px',
    borderRadius: '16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  shortcutIconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px'
  },
  shortcutTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textAlign: 'center'
  },
  shortcutBadge: {
    fontSize: '10px',
    fontWeight: '400',
    color: 'var(--text-muted)',
    marginTop: '3px',
    textAlign: 'center'
  },
  shieldBanner: {
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
    borderRadius: '16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
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
    background: 'var(--success-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shieldTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  shieldSubtitle: {
    fontSize: '12px',
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
    fontWeight: '700',
    fontFamily: 'JetBrains Mono, monospace',
    color: 'var(--success)'
  },
  shieldCountLabel: {
    fontSize: '10.5px',
    color: 'var(--text-muted)'
  }
};
