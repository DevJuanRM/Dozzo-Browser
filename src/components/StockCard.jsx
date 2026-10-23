import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Search, X } from 'lucide-react';

/**
 * StockCard component strictly styled in neutral grayscale frosted glass.
 * - NO Buy button
 * - Lato font for all numbers (clean, rounded, high contrast)
 * - Ultra-translucent glassmorphism with high-end backdrop blur
 */
export const StockCard = React.forwardRef(
  ({ className = '', style = {}, logoSrc, ticker, name, price, change, onClick, ...props }, ref) => {
    const isPositiveChange = change >= 0;

    // Format price with European/comma format using rounded Lato typography
    const formattedPrice = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

    const formattedChange = `${Math.abs(change).toFixed(2)}%`;

    return (
      <motion.div
        ref={ref}
        whileHover={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          transition: { duration: 0.16 }
        }}
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 14px',
          background: 'rgba(255, 255, 255, 0.045)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.085)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.38)',
          color: '#ffffff',
          userSelect: 'none',
          boxSizing: 'border-box',
          fontFamily: "'Lato', sans-serif",
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
          cursor: 'pointer',
          ...style
        }}
        className={className}
        {...props}
      >
        {/* Left Section: Logo and Ticker Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${name} logo`}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#ffffff',
                padding: '1px',
                flexShrink: 0
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              {ticker.slice(0, 2)}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#ffffff', lineHeight: 1.2 }}>
              {ticker}
            </div>
            <div
              style={{
                fontSize: '10.5px',
                color: 'rgba(255, 255, 255, 0.62)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '96px'
              }}
            >
              {name}
            </div>
          </div>
        </div>

        {/* Right Section: Price and Percentage Change in rounded Lato font (NO BUY BUTTON) */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '13.5px',
              fontFamily: "'Lato', sans-serif",
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.2
            }}
          >
            {formattedPrice}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '2px',
              marginTop: '1px'
            }}
          >
            {isPositiveChange ? (
              <ArrowUpRight size={11} color="#10B981" />
            ) : (
              <ArrowDownRight size={11} color="#EF4444" />
            )}
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                fontFamily: "'Lato', sans-serif",
                color: isPositiveChange ? '#10B981' : '#EF4444'
              }}
            >
              {formattedChange}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
);

StockCard.displayName = "StockCard";

/**
 * Universal Catalogue of Assets: Currencies (Divisas), Cryptos, Stocks, Indices, Commodities
 */
export const ALL_ASSETS = [
  // Indices & Equities
  {
    ticker: 'S&P 500',
    name: 'S&P 500 Index',
    price: 5864.67,
    change: 0.42,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    url: 'https://www.tradingview.com/symbols/SPX/',
    category: 'indices'
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 19270.30,
    change: -1.35,
    logoSrc: 'https://www.nvidia.com/favicon.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-NVDA/',
    category: 'stocks'
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 217.90,
    change: 2.66,
    logoSrc: 'https://www.apple.com/favicon.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-AAPL/',
    category: 'stocks'
  },
  {
    ticker: 'GOOG',
    name: 'Alphabet Inc.',
    price: 156.06,
    change: 4.89,
    logoSrc: 'https://www.google.com/favicon.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-GOOG/',
    category: 'stocks'
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    price: 218.85,
    change: -0.80,
    logoSrc: 'https://www.tesla.com/favicon.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-TSLA/',
    category: 'stocks'
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    price: 428.15,
    change: 1.12,
    logoSrc: 'https://www.microsoft.com/favicon.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-MSFT/',
    category: 'stocks'
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 186.40,
    change: 1.85,
    logoSrc: 'https://www.amazon.com/favicon.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-AMZN/',
    category: 'stocks'
  },
  {
    ticker: 'META',
    name: 'Meta Platforms',
    price: 578.90,
    change: 2.10,
    logoSrc: 'https://static.xx.fbcdn.net/rsrc.php/yb/r/hLRfl1T9LQ2.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-META/',
    category: 'stocks'
  },
  {
    ticker: 'QQQ',
    name: 'Nasdaq 100 ETF',
    price: 494.60,
    change: 0.88,
    logoSrc: 'https://www.invesco.com/favicon.ico',
    url: 'https://www.tradingview.com/symbols/NASDAQ-QQQ/',
    category: 'indices'
  },

  // Cryptocurrencies
  {
    ticker: 'BTC',
    name: 'Bitcoin',
    price: 67890.50,
    change: 2.35,
    logoSrc: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    url: 'https://www.binance.com/es/trade/BTC_USDT',
    category: 'crypto'
  },
  {
    ticker: 'ETH',
    name: 'Ethereum',
    price: 2640.10,
    change: 3.15,
    logoSrc: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    url: 'https://www.binance.com/es/trade/ETH_USDT',
    category: 'crypto'
  },
  {
    ticker: 'SOL',
    name: 'Solana',
    price: 174.80,
    change: 5.40,
    logoSrc: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    url: 'https://www.binance.com/es/trade/SOL_USDT',
    category: 'crypto'
  },
  {
    ticker: 'BNB',
    name: 'Binance Coin',
    price: 596.20,
    change: 1.80,
    logoSrc: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    url: 'https://www.binance.com/es/trade/BNB_USDT',
    category: 'crypto'
  },
  {
    ticker: 'XRP',
    name: 'Ripple XRP',
    price: 0.542,
    change: 2.10,
    logoSrc: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    url: 'https://www.binance.com/es/trade/XRP_USDT',
    category: 'crypto'
  },

  // Currencies / Divisas
  {
    ticker: 'USD/COP',
    name: 'Dólar / Peso Col',
    price: 4325.50,
    change: 0.35,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/197/197575.png',
    url: 'https://www.tradingview.com/symbols/USDCOP/',
    category: 'fx'
  },
  {
    ticker: 'EUR/USD',
    name: 'Euro / US Dollar',
    price: 1.0824,
    change: 0.18,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/197/197374.png',
    url: 'https://www.tradingview.com/symbols/EURUSD/',
    category: 'fx'
  },
  {
    ticker: 'GBP/USD',
    name: 'Libra / US Dollar',
    price: 1.2980,
    change: -0.15,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/197/197374.png',
    url: 'https://www.tradingview.com/symbols/GBPUSD/',
    category: 'fx'
  },
  {
    ticker: 'USD/MXN',
    name: 'Dólar / Peso Mex',
    price: 19.85,
    change: -0.22,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/197/197397.png',
    url: 'https://www.tradingview.com/symbols/USDMXN/',
    category: 'fx'
  },
  {
    ticker: 'EUR/COP',
    name: 'Euro / Peso Col',
    price: 4680.20,
    change: 0.52,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/197/197374.png',
    url: 'https://www.tradingview.com/symbols/EURCOP/',
    category: 'fx'
  },

  // Commodities
  {
    ticker: 'ORO',
    name: 'Gold Spot USD',
    price: 2735.40,
    change: 0.65,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
    url: 'https://www.tradingview.com/symbols/XAUUSD/',
    category: 'commodities'
  },
  {
    ticker: 'BRENT',
    name: 'Crude Oil Brent',
    price: 74.20,
    change: -1.10,
    logoSrc: 'https://cdn-icons-png.flaticon.com/512/2965/2965702.png',
    url: 'https://www.tradingview.com/symbols/UKOIL/',
    category: 'commodities'
  }
];

export const WATCHLIST_GROUPS = [
  ALL_ASSETS.slice(0, 5),
  ALL_ASSETS.slice(5, 10),
  ALL_ASSETS.slice(10, 15)
];

export function MarketWatchList({ onNavigate, onOpenBinance, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchPressed, setIsTouchPressed] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const searchInputRef = useRef(null);

  const handleAction = (item) => {
    if ((item.ticker === 'BTC' || item.ticker === 'ETH' || item.ticker === 'SOL' || item.ticker === 'BNB') && onOpenBinance) {
      onOpenBinance();
    } else if (onNavigate) {
      onNavigate(item.url);
    }
  };

  // Touch press-and-hold interaction for Mobile & Tablets (User Request)
  const handleTouchStart = () => {
    setIsTouchPressed(true);
  };

  const handleTouchEnd = () => {
    setIsTouchPressed(false);
  };

  // While hovered/pressed and not searching, rotate smoothly every 4.5s
  useEffect(() => {
    if (!isHovered || isSearchOpen) return;
    const interval = setInterval(() => {
      setGroupIndex((prev) => (prev + 1) % WATCHLIST_GROUPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, isSearchOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Matching assets from search query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_ASSETS.filter(
      (a) =>
        a.ticker.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.category && a.category.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery]);

  const activeGroup = WATCHLIST_GROUPS[groupIndex] || WATCHLIST_GROUPS[0];
  const primaryItem = selectedAsset || (searchResults.length > 0 ? searchResults[0] : activeGroup[0]);

  // Items to show when hovered: if search has matches, show them; otherwise show activeGroup
  const displayItems = searchResults.length > 0
    ? searchResults
    : selectedAsset
      ? [selectedAsset, ...ALL_ASSETS.filter((a) => a.ticker !== selectedAsset.ticker).slice(0, 4)]
      : activeGroup;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isSearchOpen) {
          setGroupIndex(0);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : '240px',
        maxWidth: isMobile ? '380px' : '240px',
        margin: isMobile ? '0 auto' : '0',
        userSelect: 'none',
        zIndex: 25
      }}
    >
      {/* Header Bar with Search Toggle Icon beside the card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px 5px 4px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(255, 255, 255, 0.45)',
            fontWeight: 700
          }}
        >
          Mercados & Divisas
        </span>

        {/* Search Icon Button beside the card */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsSearchOpen((prev) => !prev);
            if (isSearchOpen) {
              setSearchQuery('');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: isSearchOpen ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.18s ease'
          }}
          title={isSearchOpen ? 'Cerrar buscador de activos' : 'Buscar divisas, monedas o acciones'}
        >
          {isSearchOpen ? <X size={12} /> : <Search size={12} />}
        </button>
      </div>

      {/* Expandable Compact Search Input */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(15, 17, 23, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '8px',
                padding: '4px 8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
              }}
            >
              <Search size={11} color="rgba(255, 255, 255, 0.45)" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BTC, COP, EUR, NVDA, ORO..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontFamily: "'Lato', sans-serif"
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Card (Always displayed in place) */}
      <motion.div
        layout
        transition={{ layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } }}
        style={{ width: '100%' }}
      >
        <StockCard
          ticker={primaryItem.ticker}
          name={primaryItem.name}
          price={primaryItem.price}
          change={primaryItem.change}
          logoSrc={primaryItem.logoSrc}
          onClick={() => handleAction(primaryItem)}
        />
      </motion.div>

      {/* Expanded State: Smoothly pushes down siblings in-flow with layout animation (Request 3) */}
      <AnimatePresence>
        {(isHovered || isTouchPressed || (isSearchOpen && searchResults.length > 1)) && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.22 }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            {displayItems.slice(1).map((item, idx) => (
              <motion.div
                key={item.ticker}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, delay: idx * 0.035 }}
              >
                <StockCard
                  ticker={item.ticker}
                  name={item.name}
                  price={item.price}
                  change={item.change}
                  logoSrc={item.logoSrc}
                  onClick={() => {
                    setSelectedAsset(item);
                    handleAction(item);
                  }}
                />
              </motion.div>
            ))}

            {/* Pagination indicator if in standard browsing mode */}
            {!isSearchOpen && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  paddingTop: '3px'
                }}
              >
                {WATCHLIST_GROUPS.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupIndex(idx);
                      setSelectedAsset(null);
                    }}
                    style={{
                      width: idx === groupIndex ? '16px' : '6px',
                      height: '4px',
                      borderRadius: '2px',
                      background: idx === groupIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default StockCard;
