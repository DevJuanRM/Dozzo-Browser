import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
                maxWidth: '100px'
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', marginTop: '1px' }}>
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
 * Curated Watchlist divided into groups of 5 for smooth rotation
 */
export const WATCHLIST_GROUPS = [
  // Group 1: Indices & Core Tech
  [
    {
      ticker: 'S&P 500',
      name: 'S&P 500 Index',
      price: 5864.67,
      change: 0.42,
      logoSrc: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
      url: 'https://www.tradingview.com/symbols/SPX/'
    },
    {
      ticker: 'BTC',
      name: 'Bitcoin',
      price: 67890.50,
      change: 2.35,
      logoSrc: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      url: 'https://www.binance.com/es/trade/BTC_USDT'
    },
    {
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 19270.30,
      change: -1.35,
      logoSrc: 'https://www.nvidia.com/favicon.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-NVDA/'
    },
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      price: 217.90,
      change: 2.66,
      logoSrc: 'https://www.apple.com/favicon.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-AAPL/'
    },
    {
      ticker: 'GOOG',
      name: 'Alphabet Inc.',
      price: 156.06,
      change: 4.89,
      logoSrc: 'https://www.google.com/favicon.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-GOOG/'
    }
  ],
  // Group 2: Crypto & Mega Tech
  [
    {
      ticker: 'ETH',
      name: 'Ethereum',
      price: 2640.10,
      change: 3.15,
      logoSrc: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      url: 'https://www.binance.com/es/trade/ETH_USDT'
    },
    {
      ticker: 'SOL',
      name: 'Solana',
      price: 174.80,
      change: 5.40,
      logoSrc: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      url: 'https://www.binance.com/es/trade/SOL_USDT'
    },
    {
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      price: 218.85,
      change: -0.80,
      logoSrc: 'https://www.tesla.com/favicon.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-TSLA/'
    },
    {
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      price: 428.15,
      change: 1.12,
      logoSrc: 'https://www.microsoft.com/favicon.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-MSFT/'
    },
    {
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 186.40,
      change: 1.85,
      logoSrc: 'https://www.amazon.com/favicon.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-AMZN/'
    }
  ],
  // Group 3: Commodities & Global Macro
  [
    {
      ticker: 'ORO',
      name: 'Gold Spot USD',
      price: 2735.40,
      change: 0.65,
      logoSrc: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
      url: 'https://www.tradingview.com/symbols/XAUUSD/'
    },
    {
      ticker: 'BRENT',
      name: 'Crude Oil Brent',
      price: 74.20,
      change: -1.10,
      logoSrc: 'https://cdn-icons-png.flaticon.com/512/2965/2965702.png',
      url: 'https://www.tradingview.com/symbols/UKOIL/'
    },
    {
      ticker: 'EUR/USD',
      name: 'Euro / US Dollar',
      price: 1.0824,
      change: 0.18,
      logoSrc: 'https://cdn-icons-png.flaticon.com/512/197/197374.png',
      url: 'https://www.tradingview.com/symbols/EURUSD/'
    },
    {
      ticker: 'QQQ',
      name: 'Nasdaq 100 ETF',
      price: 494.60,
      change: 0.88,
      logoSrc: 'https://www.invesco.com/favicon.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-QQQ/'
    },
    {
      ticker: 'META',
      name: 'Meta Platforms',
      price: 578.90,
      change: 2.10,
      logoSrc: 'https://static.xx.fbcdn.net/rsrc.php/yb/r/hLRfl1T9LQ2.ico',
      url: 'https://www.tradingview.com/symbols/NASDAQ-META/'
    }
  ]
];

export function MarketWatchList({ onNavigate, onOpenBinance }) {
  const [isHovered, setIsHovered] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);

  const handleAction = (item) => {
    if ((item.ticker === 'BTC' || item.ticker === 'ETH' || item.ticker === 'SOL') && onOpenBinance) {
      onOpenBinance();
    } else if (onNavigate) {
      onNavigate(item.url);
    }
  };

  // While hovered, rotate smoothly every 4.5s through groups of 5
  useEffect(() => {
    if (!isHovered) return;
    const interval = setInterval(() => {
      setGroupIndex((prev) => (prev + 1) % WATCHLIST_GROUPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const activeGroup = WATCHLIST_GROUPS[groupIndex] || WATCHLIST_GROUPS[0];
  const primaryItem = activeGroup[0] || WATCHLIST_GROUPS[0][0];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setGroupIndex(0);
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '240px',
        userSelect: 'none',
        zIndex: 25
      }}
    >
      {/* Resting State: Exactly 1 single card */}
      {!isHovered ? (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <StockCard
            ticker={primaryItem.ticker}
            name={primaryItem.name}
            price={primaryItem.price}
            change={primaryItem.change}
            logoSrc={primaryItem.logoSrc}
            onClick={() => handleAction(primaryItem)}
          />
        </motion.div>
      ) : (
        /* Hover State: Fluidly expands downwards into a list of 5 items */
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '100%',
            position: 'absolute',
            top: 0,
            right: 0
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                width: '100%'
              }}
            >
              {activeGroup.map((item) => (
                <StockCard
                  key={item.ticker}
                  ticker={item.ticker}
                  name={item.name}
                  price={item.price}
                  change={item.change}
                  logoSrc={item.logoSrc}
                  onClick={() => handleAction(item)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Group Pagination Dots while hovering */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              paddingTop: '4px'
            }}
          >
            {WATCHLIST_GROUPS.map((_, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setGroupIndex(idx);
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
        </motion.div>
      )}
    </div>
  );
}

export default StockCard;
