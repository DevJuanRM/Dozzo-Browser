import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Globe } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Dozzo Browser 3D 360° Open Tabs & Recent Windows Carousel
// Realistic Webpage Snapshots • Subtle Lateral Controls • Widescreen Cards
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SITES = [
  {
    title: 'ElMune Live Stream',
    url: 'https://kick.com',
    domain: 'kick.com',
    badge: 'Live Streaming',
    themeColor: '#53FC18',
    category: 'stream'
  },
  {
    title: 'WhatsApp Web',
    url: 'https://web.whatsapp.com',
    domain: 'web.whatsapp.com',
    badge: 'Mensajería & Chats',
    themeColor: '#25D366',
    category: 'chat'
  },
  {
    title: 'Google',
    url: 'https://www.google.com',
    domain: 'google.com',
    badge: 'Buscador Global',
    themeColor: '#4285F4',
    category: 'search'
  },
  {
    title: 'YouTube',
    url: 'https://www.youtube.com',
    domain: 'youtube.com',
    badge: '100% Sin Anuncios',
    themeColor: '#FF0000',
    category: 'video'
  },
  {
    title: 'Medium',
    url: 'https://medium.com',
    domain: 'medium.com',
    badge: 'Artículos & Tech',
    themeColor: '#ffffff',
    category: 'article'
  },
  {
    title: 'GitHub',
    url: 'https://github.com',
    domain: 'github.com',
    badge: 'Repositorios',
    themeColor: '#8b5cf6',
    category: 'code'
  },
  {
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    domain: 'chatgpt.com',
    badge: 'IA Asistente',
    themeColor: '#10A37F',
    category: 'ai'
  },
  {
    title: 'Spotify Web',
    url: 'https://open.spotify.com',
    domain: 'spotify.com',
    badge: 'Música & Podcasts',
    themeColor: '#1DB954',
    category: 'audio'
  },
  {
    title: 'Binance',
    url: 'https://www.binance.com',
    domain: 'binance.com',
    badge: 'Spot & Futuros',
    themeColor: '#F0B90B',
    category: 'chart'
  },
  {
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    domain: 'wikipedia.org',
    badge: 'Enciclopedia',
    themeColor: '#3b82f6',
    category: 'article'
  }
];

function extractDomain(rawUrl) {
  try {
    const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return String(rawUrl).replace(/^https?:\/\//, '').split('/')[0];
  }
}

// Realistic Webpage Tab Snapshot Mockup when live capture is pending
function TabMockup({ item, isSmall = false }) {
  const domain = item.domain || extractDomain(item.url);
  const color = item.themeColor || '#3b82f6';

  let layoutType = 'generic';
  if (domain.includes('kick') || domain.includes('twitch')) layoutType = 'stream';
  else if (domain.includes('whatsapp')) layoutType = 'chat';
  else if (domain.includes('youtube')) layoutType = 'video';
  else if (domain.includes('github')) layoutType = 'code';
  else if (domain.includes('chatgpt') || domain.includes('openai')) layoutType = 'ai';
  else if (domain.includes('spotify')) layoutType = 'audio';
  else if (domain.includes('binance')) layoutType = 'chart';
  else if (domain.includes('google')) layoutType = 'search';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0d0f17',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Mini Mock Browser Titlebar */}
      <div
        style={{
          height: isSmall ? '18px' : '22px',
          background: '#141724',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '5px',
          flexShrink: 0
        }}
      >
        {/* 3 mini macOS window dots */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#27c93f' }} />
        </div>
        {/* Mini URL pill */}
        <div
          style={{
            flex: 1,
            height: isSmall ? '11px' : '14px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 6px',
            gap: '4px',
            marginLeft: '4px'
          }}
        >
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: color }} />
          <span style={{ fontSize: isSmall ? '8px' : '9px', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {domain}
          </span>
        </div>
      </div>

      {/* Mock Page Content Body */}
      <div
        style={{
          flex: 1,
          padding: isSmall ? '6px' : '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: isSmall ? '4px' : '6px',
          background: 'radial-gradient(ellipse at 50% 20%, rgba(22, 26, 40, 0.8) 0%, #0d0f17 100%)'
        }}
      >
        {layoutType === 'stream' && (
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            <div
              style={{
                flex: 2,
                background: '#161928',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  background: '#53FC18',
                  color: '#000',
                  fontSize: '7px',
                  fontWeight: 900,
                  padding: '1px 3px',
                  borderRadius: '2px'
                }}
              >
                LIVE
              </div>
              <img src={item.favicon} alt="" style={{ width: isSmall ? '16px' : '24px', height: isSmall ? '16px' : '24px', opacity: 0.9 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
            </div>
          </div>
        )}

        {layoutType === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div
              style={{
                flex: 1,
                background: '#181b29',
                borderRadius: '6px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ width: '20px', height: '14px', background: '#FF0000', borderRadius: '3px' }} />
            </div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#333' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ height: '5px', width: '75%', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                <div style={{ height: '4px', width: '45%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        )}

        {layoutType === 'chat' && (
          <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
            <div style={{ width: '28%', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ height: '7px', background: '#25D366', borderRadius: '2px', opacity: 0.8 }} />
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }} />
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'flex-end' }}>
              <div style={{ alignSelf: 'flex-start', padding: '2px 6px', background: '#1c2133', borderRadius: '4px', fontSize: '8px', color: '#fff' }}>Mensajes</div>
              <div style={{ alignSelf: 'flex-end', padding: '2px 6px', background: '#056162', borderRadius: '4px', fontSize: '8px', color: '#fff' }}>WhatsApp Web</div>
            </div>
          </div>
        )}

        {layoutType !== 'stream' && layoutType !== 'video' && layoutType !== 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={item.favicon} alt="" style={{ width: isSmall ? '14px' : '18px', height: isSmall ? '14px' : '18px', borderRadius: '3px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div style={{ height: '8px', width: isSmall ? '60px' : '90px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', flex: 1 }}>
              <div style={{ background: '#181b2a', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }} />
              <div style={{ background: '#181b2a', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildCarouselItems(tabs = [], historyList = []) {
  const items = [];
  const seenDomains = new Set();

  // 1. First Priority: Real open tabs in the browser
  if (Array.isArray(tabs) && tabs.length > 0) {
    for (const t of tabs) {
      if (t.isNewTab || !t.url || t.url.startsWith('about:')) continue;
      const domain = extractDomain(t.url);
      if (!domain) continue;
      seenDomains.add(domain);

      const defMatch = DEFAULT_SITES.find((s) => extractDomain(s.url) === domain);

      items.push({
        id: `tab-${t.id}`,
        tabId: t.id,
        title: t.title || domain,
        url: t.url,
        domain,
        badge: 'Pestaña Abierta',
        favicon: t.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        preview: t.preview || null,
        isOpenTab: true,
        themeColor: defMatch?.themeColor || '#3b82f6'
      });
      if (items.length >= 10) break;
    }
  }

  // 2. Second Priority: Recently visited history items
  let effectiveHistory = Array.isArray(historyList) && historyList.length > 0 ? historyList : [];
  if (effectiveHistory.length === 0) {
    try {
      const saved = localStorage.getItem('dozzo_browser_history');
      if (saved) effectiveHistory = JSON.parse(saved);
    } catch (_) {}
  }

  if (Array.isArray(effectiveHistory)) {
    for (const entry of effectiveHistory) {
      if (items.length >= 10) break;
      if (!entry.url || entry.url.startsWith('about:') || entry.url.includes('localhost:5173')) continue;
      const domain = extractDomain(entry.url);
      if (!domain || seenDomains.has(domain)) continue;
      seenDomains.add(domain);

      const defMatch = DEFAULT_SITES.find((s) => extractDomain(s.url) === domain);

      items.push({
        id: entry.id || `hist-${domain}`,
        tabId: null,
        title: entry.title || domain,
        url: entry.url,
        domain,
        badge: 'Pestaña Reciente',
        favicon: entry.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        preview: entry.preview || null,
        isOpenTab: false,
        themeColor: defMatch?.themeColor || '#a855f7'
      });
    }
  }

  // 3. Third Priority: Backfill with standard sites so the 3D ring is complete
  for (const def of DEFAULT_SITES) {
    if (items.length >= 10) break;
    const domain = extractDomain(def.url);
    if (seenDomains.has(domain)) continue;
    seenDomains.add(domain);

    items.push({
      id: `def-${domain}`,
      tabId: null,
      title: def.title,
      url: def.url,
      domain,
      badge: def.badge,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      preview: null,
      isOpenTab: false,
      themeColor: def.themeColor
    });
  }

  return items;
}

// ─────────────────────────────────────────────
// Carousel Geometry & Physics (Subtle Tilt, Large Cards)
// ─────────────────────────────────────────────
// Continuous Auto-rotation every 6s as requested
const AUTOPLAY_INTERVAL_MS = 6000;

const springTransition = {
  type: 'spring',
  stiffness: 65,
  damping: 18,
  mass: 0.7,
};

const RADIUS_MIN = 220;
const RADIUS_MAX = 330;
const RADIUS_WIDTH_RATIO = 0.46;
const PERSPECTIVE_MULTIPLIER = 2.6;

// Subtle tilt: reduced from 38° down to 12° so cards stand upright and readable!
const RING_TILT_DEG = 12;

const CROSSFADE_DURATION_S = 0.35;
const CROSSFADE_EASE = [0.22, 1, 0.36, 1];

export function RecentSitesCarousel({ tabs = [], history = [], onSelectTab, onNavigate }) {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(260);

  const items = useMemo(() => buildCarouselItems(tabs, history), [tabs, history]);
  const numItems = items.length || 1;
  const angleStep = 360 / numItems;

  const steps = Math.round(rotation / angleStep);
  const centerIndex = ((-steps % numItems) + numItems) % numItems;
  const centerItem = items[centerIndex] || items[0];

  useEffect(() => {
    const updateRadius = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setRadius(
        Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, width * RADIUS_WIDTH_RATIO))
      );
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Continuous Auto-rotation every 2.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev + angleStep);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [angleStep]);

  const rotateCarousel = useCallback(
    (direction) => {
      setRotation(
        (prev) => prev + (direction === 'left' ? -angleStep : angleStep)
      );
    },
    [angleStep]
  );

  const handleItemClick = (item) => {
    if (item.isOpenTab && item.tabId && onSelectTab) {
      onSelectTab(item.tabId);
    } else if (onNavigate) {
      onNavigate(item.url);
    }
  };

  const handleThumbClick = (index, item) => {
    if (index === centerIndex) {
      handleItemClick(item);
    } else {
      let diff = (index - centerIndex) % numItems;
      if (diff > numItems / 2) diff -= numItems;
      if (diff < -numItems / 2) diff += numItems;
      setRotation((prev) => prev - diff * angleStep);
    }
  };

  return (
    <div className="carousel360-wrapper">
      {/* 3D Cylinder Container */}
      <div ref={containerRef} className="carousel360-container">
        {/* Bare Floating Side Navigation Arrow: Left (<) - Zero Container */}
        <button
          type="button"
          aria-label="Pestaña anterior"
          onClick={(e) => {
            e.stopPropagation();
            rotateCarousel('left');
          }}
          className="carousel360-side-btn left"
          title="Anterior"
        >
          <ChevronLeft size={28} strokeWidth={2.2} />
        </button>

        {/* 3D Stage Ring */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            perspective: `${radius * PERSPECTIVE_MULTIPLIER}px`,
            transformStyle: 'preserve-3d'
          }}
        >
          {items.map((item, index) => {
            const targetAngle = rotation + angleStep * index;
            const isCurrentCenter = index === centerIndex;

            return (
              <motion.div
                key={item.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transformStyle: 'preserve-3d'
                }}
                animate={{ rotateY: targetAngle }}
                transition={springTransition}
              >
                <motion.div
                  className="carousel360-ring-card"
                  style={{
                    transformStyle: 'preserve-3d',
                    width: '150px',
                    height: '100px',
                    opacity: isCurrentCenter ? 0.2 : 0.95
                  }}
                  animate={{
                    rotateY: -targetAngle,
                    rotateX: RING_TILT_DEG,
                    z: radius,
                  }}
                  transition={springTransition}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbClick(index, item);
                  }}
                  title={`${item.title} (${item.domain})`}
                >
                  {/* Webpage Screenshot or Realistic Tab Mockup */}
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <TabMockup item={item} isSmall={true} />
                  )}

                  {/* Bare Favicon without any container */}
                  <img
                    src={item.favicon}
                    alt=""
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.85))',
                      zIndex: 3
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />

                  {/* Bottom Minimal Domain Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '4px 8px',
                      background: 'linear-gradient(to top, rgba(9, 10, 15, 0.9) 0%, transparent 100%)',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.85)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      zIndex: 3
                    }}
                  >
                    {item.domain}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Center Featured Active Card (Large Widescreen Window) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={centerIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: CROSSFADE_DURATION_S,
                ease: CROSSFADE_EASE,
              }}
              className="carousel360-center-card"
              style={{
                width: '350px',
                height: '230px',
                pointerEvents: 'auto'
              }}
              onClick={() => handleItemClick(centerItem)}
              title={`Ir a ${centerItem?.title || ''} (${centerItem?.url || ''})`}
            >
              {/* Webpage Screenshot or Realistic Tab Mockup */}
              {centerItem?.preview ? (
                <img
                  src={centerItem.preview}
                  alt={centerItem.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              ) : (
                <TabMockup item={centerItem} isSmall={false} />
              )}

              {/* Glass Footer Bar with Favicon, Title, Domain and Open Action - NO DIVIDING TOP BORDER */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px 14px',
                  background: 'linear-gradient(to top, rgba(8, 9, 14, 0.95) 0%, rgba(8, 9, 14, 0.75) 70%, transparent 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderTop: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                  {/* Bare Favicon without any container */}
                  <img
                    src={centerItem?.favicon}
                    alt=""
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '3px',
                      flexShrink: 0,
                      filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.8))'
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2
                      }}
                    >
                      {centerItem?.title}
                    </div>
                    <div
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{centerItem?.domain}</span>
                      {centerItem?.isOpenTab && (
                        <span style={{ color: '#10B981', fontSize: '9px', fontWeight: 700 }}>• ABIERTA</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bare Open Icon without any container or Abrir text */}
                <ExternalLink
                  size={18}
                  strokeWidth={2.2}
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    flexShrink: 0,
                    filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6))',
                    transition: 'transform 0.2s ease, color 0.2s ease'
                  }}
                  className="carousel360-bare-link"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bare Floating Side Navigation Arrow: Right (>) - Zero Container */}
        <button
          type="button"
          aria-label="Siguiente pestaña"
          onClick={(e) => {
            e.stopPropagation();
            rotateCarousel('right');
          }}
          className="carousel360-side-btn right"
          title="Siguiente"
        >
          <ChevronRight size={28} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export default RecentSitesCarousel;
