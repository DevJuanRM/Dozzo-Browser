import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RotateCw,
  Search,
  ExternalLink,
  ArrowUpRight,
  X,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const BROKERS = [
  {
    id: 'binance',
    name: 'Binance',
    color: '#F0B90B',
    accentBg: 'rgba(240, 185, 11, 0.15)',
    badge: 'Líder Global',
    url: 'https://www.binance.com/es/markets/spot-overview',
    pairUrl: (sym) => `https://www.binance.com/es/trade/${sym.replace('USDT', '_USDT')}`
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    color: '#0052FF',
    accentBg: 'rgba(0, 82, 255, 0.15)',
    badge: 'EE.UU. Regulado',
    url: 'https://www.coinbase.com/es/explore',
    pairUrl: (sym) => `https://www.coinbase.com/es/price/${sym.replace('USDT', '').toLowerCase()}`
  },
  {
    id: 'okx',
    name: 'OKX',
    color: '#FFFFFF',
    accentBg: 'rgba(255, 255, 255, 0.12)',
    badge: 'Web3 & Spot',
    url: 'https://www.okx.com/es/markets/prices',
    pairUrl: (sym) => `https://www.okx.com/es/trade-spot/${sym.replace('USDT', '-usdt').toLowerCase()}`
  },
  {
    id: 'bybit',
    name: 'Bybit',
    color: '#F7A600',
    accentBg: 'rgba(247, 166, 0, 0.15)',
    badge: 'Derivados & Spot',
    url: 'https://www.bybit.com/es-ES/trade/spot',
    pairUrl: (sym) => `https://www.bybit.com/es-ES/trade/spot/${sym.replace('USDT', '/USDT')}`
  },
  {
    id: 'kraken',
    name: 'Kraken',
    color: '#8A63FF',
    accentBg: 'rgba(138, 99, 255, 0.15)',
    badge: 'Seguridad Máxima',
    url: 'https://www.kraken.com/es/prices',
    pairUrl: (sym) => `https://www.kraken.com/es/prices/${sym.replace('USDT', '').toLowerCase()}`
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    color: '#F7931A',
    accentBg: 'rgba(247, 147, 26, 0.15)',
    badge: 'Spot Primario',
    url: 'https://www.binance.com/es/trade/BTC_USDT',
    pairUrl: () => `https://www.binance.com/es/trade/BTC_USDT`
  }
];

export function BrokerIcon({ brokerId = 'binance', size = 15 }) {
  switch (brokerId) {
    case 'btc':
      return (
        <div
          style={{
            width: size + 2,
            height: size + 2,
            borderRadius: '50%',
            background: '#F7931A',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.round(size * 0.72)}px`,
            fontWeight: '900',
            lineHeight: 1
          }}
        >
          ₿
        </div>
      );
    case 'coinbase':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#0052FF">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6.5C8.96 6.5 6.5 8.96 6.5 12C6.5 15.04 8.96 17.5 12 17.5C15.04 17.5 17.5 15.04 17.5 12C17.5 8.96 15.04 6.5 12 6.5ZM10 13.5V10.5H14V13.5H10Z" fill="#ffffff" />
        </svg>
      );
    case 'okx':
      return (
        <div
          style={{
            width: size + 2,
            height: size - 1,
            borderRadius: '3px',
            background: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.round(size * 0.52)}px`,
            fontWeight: '900',
            letterSpacing: '-0.5px'
          }}
        >
          OKX
        </div>
      );
    case 'bybit':
      return (
        <div
          style={{
            width: size + 2,
            height: size - 1,
            borderRadius: '3px',
            background: '#F7A600',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.round(size * 0.52)}px`,
            fontWeight: '900'
          }}
        >
          BY
        </div>
      );
    case 'kraken':
      return (
        <div
          style={{
            width: size + 2,
            height: size + 2,
            borderRadius: '50%',
            background: '#8A63FF',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.round(size * 0.65)}px`,
            fontWeight: '900',
            lineHeight: 1
          }}
        >
          🐙
        </div>
      );
    case 'binance':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#F0B90B">
          <path d="M12 2L6.5 7.5L8.6 9.6L12 6.2L15.4 9.6L17.5 7.5L12 2ZM2 12L7.5 6.5L9.6 8.6L6.2 12L9.6 15.4L7.5 17.5L2 12ZM12 22L17.5 16.5L15.4 14.4L12 17.8L8.6 14.4L6.5 16.5L12 22ZM22 12L16.5 17.5L14.4 15.4L17.8 12L14.4 8.6L16.5 6.5L22 12ZM12 9.5L9.5 12L12 14.5L14.5 12L12 9.5Z" />
        </svg>
      );
  }
}

// Comprehensive Metadata for Crypto, Stablecoins & Fiat currencies
export const COIN_METADATA = {
  // Stablecoins & Major Currencies
  USDT: { name: 'Tether USD', icon: '₮', color: '#26A17B', tag: 'Stablecoin' },
  USDC: { name: 'USD Coin', icon: '$', color: '#2775CA', tag: 'Stablecoin' },
  EUR: { name: 'Euro', icon: '€', color: '#003399', tag: 'Divisa Fiat' },
  GBP: { name: 'Libra Esterlina', icon: '£', color: '#9B51E0', tag: 'Divisa Fiat' },
  BRL: { name: 'Real Brasileño', icon: 'R$', color: '#009B3A', tag: 'Divisa Fiat' },
  TRY: { name: 'Lira Turca', icon: '₺', color: '#E30A17', tag: 'Divisa Fiat' },
  FDUSD: { name: 'First Digital USD', icon: '$', color: '#1EBA78', tag: 'Stablecoin' },
  DAI: { name: 'Dai Stablecoin', icon: '◈', color: '#F4B731', tag: 'Stablecoin' },

  // Top Cryptocurrencies
  BTC: { name: 'Bitcoin', icon: '₿', color: '#F7931A', tag: 'Layer 1' },
  ETH: { name: 'Ethereum', icon: 'Ξ', color: '#627EEA', tag: 'Smart Contracts' },
  SOL: { name: 'Solana', icon: '◎', color: '#14F195', tag: 'DeFi & Web3' },
  BNB: { name: 'BNB Chain', icon: '⚡', color: '#F3BA2F', tag: 'Exchange / L1' },
  XRP: { name: 'XRP Ripple', icon: '✕', color: '#23292F', tag: 'Pagos Globales' },
  DOGE: { name: 'Dogecoin', icon: 'Ð', color: '#C2A633', tag: 'Meme Coin' },
  ADA: { name: 'Cardano', icon: '₳', color: '#0033AD', tag: 'PoS Blockchain' },
  AVAX: { name: 'Avalanche', icon: '▲', color: '#E84142', tag: 'Subnets' },
  SUI: { name: 'Sui Network', icon: '💧', color: '#4DA2FF', tag: 'Move Layer 1' },
  NEAR: { name: 'NEAR Protocol', icon: 'Ⓝ', color: '#000000', tag: 'AI & Sharding' },
  LINK: { name: 'Chainlink', icon: '⬡', color: '#375BD2', tag: 'Oráculos' },
  PEPE: { name: 'Pepe', icon: '🐸', color: '#4CAF50', tag: 'Meme Coin' },
  SHIB: { name: 'Shiba Inu', icon: '🐕', color: '#FFA409', tag: 'Ecosistema' },
  DOT: { name: 'Polkadot', icon: '●', color: '#E6007A', tag: 'Interoperabilidad' },
  LTC: { name: 'Litecoin', icon: 'Ł', color: '#345D9D', tag: 'Pagos Rápidos' },
  TRX: { name: 'TRON', icon: 'TRX', color: '#FF0013', tag: 'Pagos & Red USDT' },
  TON: { name: 'The Open Network', icon: '💎', color: '#0088CC', tag: 'Telegram Web3' },
  RENDER: { name: 'Render Token', icon: '⚡', color: '#E53E3E', tag: 'GPU & AI' },
  FET: { name: 'Artificial Superintelligence', icon: '🧠', color: '#10B981', tag: 'Alianza IA' },
  INJ: { name: 'Injective', icon: '🥷', color: '#00D1FF', tag: 'DeFi L1' },
  TIA: { name: 'Celestia', icon: '✦', color: '#7B2CBF', tag: 'Modular' },
  ATOM: { name: 'Cosmos', icon: '⚛', color: '#2E3148', tag: 'IBC Hub' },
  UNI: { name: 'Uniswap', icon: '🦄', color: '#FF007A', tag: 'DEX Líder' },
  AAVE: { name: 'Aave', icon: '👻', color: '#B6509E', tag: 'Préstamos DeFi' },
  OP: { name: 'Optimism', icon: '🔴', color: '#FF0420', tag: 'Ethereum L2' },
  ARB: { name: 'Arbitrum', icon: '🔷', color: '#28A0F0', tag: 'Ethereum L2' },
  APT: { name: 'Aptos', icon: '▲', color: '#000000', tag: 'Move L1' },
  POL: { name: 'Polygon Ecosystem', icon: '🟣', color: '#8247E5', tag: 'ZK Rollups' },
  HBAR: { name: 'Hedera', icon: 'ℏ', color: '#000000', tag: 'Enterprise DLT' },
  FIL: { name: 'Filecoin', icon: '⨎', color: '#0090FF', tag: 'Storage' },
  ICP: { name: 'Internet Computer', icon: '∞', color: '#29ABE2', tag: 'Cloud Web3' },
  FTM: { name: 'Sonic (Fantom)', icon: '👻', color: '#1969FF', tag: 'Ultra Rápido' }
};

export function parseSymbol(symbol) {
  let base = symbol;
  let quote = 'USDT';
  if (symbol.endsWith('USDT')) {
    base = symbol.replace('USDT', '');
    quote = 'USDT';
  } else if (symbol.endsWith('USDC')) {
    base = symbol.replace('USDC', '');
    quote = 'USDC';
  } else if (symbol.endsWith('EUR')) {
    base = symbol.replace('EUR', '');
    quote = 'EUR';
  } else if (symbol.endsWith('FDUSD')) {
    base = symbol.replace('FDUSD', '');
    quote = 'FDUSD';
  } else if (symbol.endsWith('BTC')) {
    base = symbol.replace('BTC', '');
    quote = 'BTC';
  }
  return { base, quote };
}

// Mini SVG Sparkline generator
function MiniSparkline({ isPositive }) {
  const points = isPositive
    ? '0,18 10,16 20,19 30,12 40,14 50,8 60,11 70,4 80,2'
    : '0,2 10,5 20,4 30,12 40,9 50,16 60,14 70,19 80,18';
  const color = isPositive ? '#10B981' : '#EF4444';

  return (
    <svg width="64" height="22" style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

const DEFAULT_POPULAR = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'AVAXUSDT',
  'SUIUSDT',
  'NEARUSDT',
  'LINKUSDT',
  'PEPEUSDT',
  'SHIBUSDT',
  'DOTUSDT',
  'EURUSDT',
  'LTCUSDT',
  'TRXUSDT',
  'TONUSDT',
  'RENDERUSDT',
  'FETUSDT'
];

export default function BinanceWidget({
  isOpen,
  onClose,
  onOpenTradePair,
  selectedBrokerId = 'binance',
  onSelectBroker
}) {
  const [activeBrokerId, setActiveBrokerId] = useState(selectedBrokerId);
  const [allTickers, setAllTickers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (selectedBrokerId) {
      setActiveBrokerId(selectedBrokerId);
    }
  }, [selectedBrokerId]);

  const activeBroker = BROKERS.find((b) => b.id === activeBrokerId) || BROKERS[0];

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      // Filter for liquid traded pairs
      const liquidPairs = data.filter((t) => {
        if (!t.symbol) return false;
        return (
          (t.symbol.endsWith('USDT') || t.symbol.endsWith('USDC') || t.symbol.endsWith('EUR')) &&
          parseFloat(t.volume || '0') > 0
        );
      });

      // Sort by 24h dollar volume descending
      liquidPairs.sort((a, b) => parseFloat(b.quoteVolume || '0') - parseFloat(a.quoteVolume || '0'));

      setAllTickers(liquidPairs);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Crypto API fallback to cached rates:', err);
      // Fallback data
      setAllTickers([
        { symbol: 'BTCUSDT', lastPrice: '84250.00', priceChange: '1240.50', priceChangePercent: '1.45', highPrice: '85100.00', lowPrice: '82900.00', volume: '34820.5', quoteVolume: '2933000000' },
        { symbol: 'ETHUSDT', lastPrice: '2680.40', priceChange: '22.80', priceChangePercent: '0.85', highPrice: '2720.00', lowPrice: '2610.00', volume: '284200.0', quoteVolume: '761000000' },
        { symbol: 'SOLUSDT', lastPrice: '182.20', priceChange: '7.40', priceChangePercent: '4.20', highPrice: '185.00', lowPrice: '172.50', volume: '984500.0', quoteVolume: '179000000' },
        { symbol: 'BNBUSDT', lastPrice: '645.80', priceChange: '-1.95', priceChangePercent: '-0.30', highPrice: '652.00', lowPrice: '638.00', volume: '112000.0', quoteVolume: '72300000' },
        { symbol: 'XRPUSDT', lastPrice: '1.42', priceChange: '0.03', priceChangePercent: '2.15', highPrice: '1.45', lowPrice: '1.38', volume: '4820000.0', quoteVolume: '6840000' },
        { symbol: 'DOGEUSDT', lastPrice: '0.195', priceChange: '-0.002', priceChangePercent: '-1.20', highPrice: '0.205', lowPrice: '0.191', volume: '12400000.0', quoteVolume: '2418000' },
        { symbol: 'ADAUSDT', lastPrice: '0.78', priceChange: '0.008', priceChangePercent: '1.05', highPrice: '0.81', lowPrice: '0.76', volume: '3820000.0', quoteVolume: '2979000' },
        { symbol: 'AVAXUSDT', lastPrice: '29.50', priceChange: '-0.63', priceChangePercent: '-2.10', highPrice: '30.80', lowPrice: '28.90', volume: '840000.0', quoteVolume: '24780000' },
        { symbol: 'SUIUSDT', lastPrice: '3.15', priceChange: '0.17', priceChangePercent: '5.80', highPrice: '3.25', lowPrice: '2.95', volume: '2410000.0', quoteVolume: '7590000' },
        { symbol: 'NEARUSDT', lastPrice: '5.85', priceChange: '0.19', priceChangePercent: '3.40', highPrice: '6.05', lowPrice: '5.60', volume: '1420000.0', quoteVolume: '8307000' },
        { symbol: 'LINKUSDT', lastPrice: '18.40', priceChange: '0.62', priceChangePercent: '3.48', highPrice: '18.90', lowPrice: '17.60', volume: '890000.0', quoteVolume: '16376000' },
        { symbol: 'PEPEUSDT', lastPrice: '0.0000095', priceChange: '0.0000008', priceChangePercent: '8.40', highPrice: '0.0000099', lowPrice: '0.0000085', volume: '18400000000', quoteVolume: '174800000' },
        { symbol: 'SHIBUSDT', lastPrice: '0.0000178', priceChange: '-0.0000003', priceChangePercent: '-1.65', highPrice: '0.0000185', lowPrice: '0.0000172', volume: '8400000000', quoteVolume: '149520000' },
        { symbol: 'DOTUSDT', lastPrice: '6.95', priceChange: '0.14', priceChangePercent: '2.05', highPrice: '7.10', lowPrice: '6.75', volume: '1240000.0', quoteVolume: '8618000' },
        { symbol: 'EURUSDT', lastPrice: '1.0850', priceChange: '0.0025', priceChangePercent: '0.23', highPrice: '1.0875', lowPrice: '1.0820', volume: '48200000.0', quoteVolume: '52297000' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCryptoData();
      const interval = setInterval(fetchCryptoData, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Comprehensive Multi-Currency & Crypto Search Filter
  const displayedTickers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      // Default view: Prioritize popular pairs first, then top volume
      const popular = allTickers.filter((t) => DEFAULT_POPULAR.includes(t.symbol));
      popular.sort((a, b) => DEFAULT_POPULAR.indexOf(a.symbol) - DEFAULT_POPULAR.indexOf(b.symbol));

      const remaining = allTickers.filter((t) => !DEFAULT_POPULAR.includes(t.symbol)).slice(0, 15);
      return [...popular, ...remaining];
    }

    // Filter across all Binance pairs
    const matches = allTickers.filter((t) => {
      const { base, quote } = parseSymbol(t.symbol);
      const meta = COIN_METADATA[base];
      return (
        t.symbol.toLowerCase().includes(q) ||
        base.toLowerCase().includes(q) ||
        quote.toLowerCase().includes(q) ||
        (meta && meta.name.toLowerCase().includes(q)) ||
        (meta && meta.tag.toLowerCase().includes(q))
      );
    });

    let results = matches.slice(0, 40);

    // If user searched for USDT or Tether, explicitly provide Tether USD as row #1
    if (q === 'usdt' || q === 'tether' || q === 'dolar' || q === 'usd') {
      const tetherRow = {
        symbol: 'USDTUSDT',
        isNativeTether: true,
        lastPrice: '1.0000',
        priceChange: '0.0000',
        priceChangePercent: '0.00',
        highPrice: '1.0005',
        lowPrice: '0.9998',
        volume: '48500000000',
        quoteVolume: '48500000000'
      };
      results = [tetherRow, ...results.filter((x) => x.symbol !== 'USDTUSDT')];
    }

    return results;
  }, [allTickers, search]);

  if (!isOpen) return null;

  const handleOpenCoin = (symbol) => {
    const cleanSym = symbol === 'USDTUSDT' ? 'USDT' : symbol;
    const url = activeBroker.pairUrl(cleanSym);
    if (onOpenTradePair) onOpenTradePair(url);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.drawer}
        className="glass-panel animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.brandRow}>
            <div style={{ ...styles.brokerBadgeIcon, background: activeBroker.accentBg, borderColor: activeBroker.color }}>
              <TrendingUp size={16} color={activeBroker.color} />
            </div>
            <div>
              <div style={styles.title}>Crypto Markets & Brokers Hub</div>
              <div style={styles.subtitle}>
                Precios y Variación 24h en tiempo real vía <span style={{ color: activeBroker.color, fontWeight: '700' }}>{activeBroker.name}</span>
              </div>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              style={{ ...styles.actionBtn, transform: loading ? 'rotate(180deg)' : 'none' }}
              onClick={fetchCryptoData}
              disabled={loading}
              title="Actualizar cotizaciones"
            >
              <RotateCw size={14} />
            </button>
            <button style={styles.actionBtn} onClick={onClose} title="Cerrar Hub">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Multi-Broker Selector Tabs */}
        <div style={styles.brokerTabsRow}>
          {BROKERS.map((broker) => {
            const isSelected = broker.id === activeBrokerId;
            return (
              <button
                key={broker.id}
                style={{
                  ...styles.brokerTab,
                  ...(isSelected ? {
                    background: broker.accentBg,
                    borderColor: broker.color,
                    color: broker.color,
                    boxShadow: `0 0 10px ${broker.accentBg}`
                  } : {})
                }}
                onClick={() => {
                  setActiveBrokerId(broker.id);
                  if (onSelectBroker) onSelectBroker(broker.id);
                }}
              >
                <BrokerIcon brokerId={broker.id} size={13} />
                <span>{broker.name}</span>
                {isSelected && <span style={styles.brokerMiniBadge}>{broker.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Search Bar with Currency & Token Support */}
        <div style={styles.searchBox}>
          <Search size={14} color="var(--text-muted)" style={{ marginLeft: '10px' }} />
          <input
            type="text"
            placeholder="Buscar criptomoneda o divisa (USDT, EUR, BTC, PEPE, SOL, ETH...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            autoFocus
          />
          {search && (
            <button style={styles.clearSearchBtn} onClick={() => setSearch('')} title="Limpiar búsqueda">
              &times;
            </button>
          )}
        </div>

        {/* Status / Results Count */}
        <div style={styles.statusRow}>
          <span>
            {search ? `Resultados para "${search}": ${displayedTickers.length} pares` : 'Principales Criptomonedas y Divisas'}
          </span>
          {lastUpdated && (
            <span style={styles.lastUpdatedText}>
              Actualizado: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>

        {/* Live Cryptos List */}
        <div style={styles.tickersList} className="custom-scrollbar">
          {displayedTickers.length === 0 ? (
            <div style={styles.emptyMsg}>
              No se encontraron pares o divisas con "{search}". Prueba con USDT, EUR, BTC, SOL o PEPE.
            </div>
          ) : (
            displayedTickers.map((t) => {
              const { base, quote } = parseSymbol(t.symbol);
              const meta = COIN_METADATA[base] || {
                name: base,
                icon: base.slice(0, 1),
                color: 'var(--accent)',
                tag: 'Criptomoneda'
              };

              const changePercent = parseFloat(t.priceChangePercent || '0');
              const isPositive = changePercent >= 0;
              const price = parseFloat(t.lastPrice || '0');
              const changeAmount = parseFloat(t.priceChange || '0');

              // Formatted price with proper decimals
              const formattedPrice =
                price >= 1
                  ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : price.toFixed(price < 0.0001 ? 7 : 4);

              // Formatted change amount in dollars
              const formattedChangeAmount =
                Math.abs(changeAmount) >= 1
                  ? Math.abs(changeAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : Math.abs(changeAmount).toFixed(price < 0.0001 ? 7 : 4);

              const high = parseFloat(t.highPrice || '0');
              const low = parseFloat(t.lowPrice || '0');
              const formattedHigh = high >= 1 ? high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : high.toFixed(4);
              const formattedLow = low >= 1 ? low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : low.toFixed(4);

              const quoteVolNumber = parseFloat(t.quoteVolume || '0');
              const volFormatted =
                quoteVolNumber >= 1e9
                  ? `$${(quoteVolNumber / 1e9).toFixed(2)}B`
                  : quoteVolNumber >= 1e6
                  ? `$${(quoteVolNumber / 1e6).toFixed(1)}M`
                  : `$${Math.round(quoteVolNumber).toLocaleString()}`;

              return (
                <div
                  key={t.symbol}
                  style={styles.tickerCard}
                  onClick={() => handleOpenCoin(t.symbol)}
                  title={`Abrir ${meta.name} (${t.symbol}) en ${activeBroker.name}`}
                >
                  {/* Left: Coin Emblem & Name */}
                  <div style={styles.coinLeft}>
                    <div style={{ ...styles.coinIcon, backgroundColor: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}44` }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={styles.coinSymbolRow}>
                        <span style={styles.coinCode}>{base}</span>
                        <span style={styles.pairQuote}>/{quote}</span>
                      </div>
                      <div style={styles.coinFullName}>
                        {meta.name} <span style={styles.coinTagDot}>•</span> <span style={styles.coinTag}>{meta.tag}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Sparkline & High / Low range today */}
                  <div style={styles.sparklineCol}>
                    <MiniSparkline isPositive={isPositive} />
                    <div style={styles.rangeText}>
                      <span>Mín: ${formattedLow}</span>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <span>Máx: ${formattedHigh}</span>
                    </div>
                  </div>

                  {/* Right: Live Price & Explicit Daily Gain / Loss (¿Cuánto subió hoy?) */}
                  <div style={styles.coinRight}>
                    <div style={styles.coinPrice}>${formattedPrice}</div>
                    <div
                      style={{
                        ...styles.changeBadge,
                        backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)',
                        color: isPositive ? '#10B981' : '#EF4444',
                        border: isPositive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)'
                      }}
                    >
                      {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      <span>
                        {isPositive ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`} hoy
                      </span>
                      <span style={styles.changeAmountText}>
                        ({isPositive ? `+$${formattedChangeAmount}` : `-$${formattedChangeAmount}`})
                      </span>
                    </div>
                    <span style={styles.volText}>24h Vol: {volFormatted}</span>
                  </div>

                  {/* Action Link Arrow */}
                  <div style={styles.openArrow}>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Exchange CTA */}
        <div style={styles.footer}>
          <button
            style={{
              ...styles.exchangeBtn,
              background: activeBroker.color,
              color: activeBroker.id === 'okx' ? '#000000' : activeBroker.id === 'binance' ? '#000000' : '#ffffff'
            }}
            onClick={() => {
              if (onOpenTradePair) onOpenTradePair(activeBroker.url);
              onClose();
            }}
          >
            <span>Ir a {activeBroker.name} Exchange</span>
            <ExternalLink size={14} style={{ marginLeft: '6px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
    animation: 'fadeIn 0.2s ease'
  },
  drawer: {
    width: '540px',
    maxWidth: '100vw',
    height: '100%',
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border-hover)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.85)',
    zIndex: 1001
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  brokerBadgeIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid'
  },
  title: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '0.2px'
  },
  subtitle: {
    fontSize: '11.5px',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  actionBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  brokerTabsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border-subtle)',
    overflowX: 'auto',
    scrollbarWidth: 'none'
  },
  brokerTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  brokerMiniBadge: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '1px 5px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'inherit'
  },
  searchBox: {
    margin: '12px 16px 6px 16px',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-hover)',
    borderRadius: '10px',
    height: '38px',
    position: 'relative'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '12.5px',
    padding: '0 10px'
  },
  clearSearchBtn: {
    padding: '0 10px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '16px',
    cursor: 'pointer'
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 18px 8px 18px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  lastUpdatedText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '10px',
    opacity: 0.8
  },
  tickersList: {
    flex: 1,
    overflowY: 'auto',
    padding: '6px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  emptyMsg: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '12px',
    padding: '36px 16px',
    lineHeight: '1.6'
  },
  tickerCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  coinLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '135px'
  },
  coinIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '800',
    flexShrink: 0
  },
  coinSymbolRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '3px'
  },
  coinCode: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#ffffff'
  },
  pairQuote: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  coinFullName: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  coinTagDot: {
    opacity: 0.4
  },
  coinTag: {
    fontSize: '9.5px',
    color: 'var(--text-muted)'
  },
  sparklineCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '0 8px'
  },
  rangeText: {
    fontSize: '9.5px',
    color: 'var(--text-muted)',
    fontFamily: 'JetBrains Mono, monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  coinRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '3px',
    minWidth: '130px'
  },
  coinPrice: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'JetBrains Mono, monospace'
  },
  changeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    fontFamily: 'JetBrains Mono, monospace',
    whiteSpace: 'nowrap'
  },
  changeAmountText: {
    fontSize: '9px',
    opacity: 0.85
  },
  volText: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    fontFamily: 'JetBrains Mono, monospace'
  },
  openArrow: {
    color: 'var(--text-muted)',
    opacity: 0.6,
    marginLeft: '6px'
  },
  footer: {
    padding: '12px 18px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(0, 0, 0, 0.3)'
  },
  exchangeBtn: {
    width: '100%',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '13px',
    letterSpacing: '0.2px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.18s ease'
  }
};
