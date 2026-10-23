/**
 * Card Deck Carousel — Photos stacked like a loose deck of prints.
 * Updated strictly to user specifications:
 * - Resting state is a crisp, flat rectangle (no fanned-out tilt).
 * - On Hover: fans out into the 3D tilted deck pose and smoothly displays the Title + Description panel to the right.
 * - "Abrir noticia" link is crisp WHITE (#ffffff), not blue.
 * - Automatic language localization based on user's system/browser locale (Spanish vs. English).
 * - Removed any tooltip/label saying "arrastra bla bla bla".
 * - Bare publisher logo glyph with drop shadow (zero container, zero border).
 * - Drag-to-swipe card rotation with smooth fade in / fade out.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function wrap(i, n) {
  return n ? ((i % n) + n) % n : 0;
}

export function tiltFor(i, max) {
  const u = (((i + 1) * 2654435761) >>> 0) / 4294967296;
  return (u * 2 - 1) * max;
}

/** Resting pose of a card `depth` places down the pile */
export function deckPose(depth, tilt, isHovered) {
  const d = Math.min(depth, 3);
  if (!isHovered) {
    // Resting state: straight rectangle with zero fan-out tilt
    return {
      y: 0,
      scale: 1,
      rot: 0,
      opacity: 0,
      shade: 1
    };
  }

  // Hover state: fans out into loose prints deck
  return {
    y: d ? -d * 9 : 0,
    scale: 1 - d * 0.045,
    rot: depth === 0 ? 0 : tilt,
    opacity: depth > 3 ? 0 : 0.9,
    shade: 1 - d * 0.12,
  };
}

/**
 * Bare Publisher Logo with ZERO container box/background/pill.
 */
export function PublisherLogo({ source = 'The New York Times', size = 20 }) {
  const isCnn = source.toLowerCase().includes('cnn');

  if (isCnn) {
    return (
      <svg
        width={Math.round(size * 1.5)}
        height={size}
        viewBox="0 0 24 24"
        fill="#ffffff"
        style={{
          filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.95))',
          display: 'block'
        }}
        aria-label="CNN"
      >
        <path d="M23.9962 15.514c0 2.0638-2.6676 3.0547-4.0789.6576-.1012-.173-2.3252-4.0032-2.3252-4.0032v3.3457c0 2.0637-2.6663 3.0546-4.0776.6575-.1025-.173-2.3253-4.0032-2.3253-4.0032v3.1547c0 1.4318-.8498 2.2073-2.1791 2.2073H5.5299a5.5299 5.5299 0 010-11.0598h1.7946v1.328H5.5299a4.2019 4.2019 0 100 8.4038h3.4494a.8973.8973 0 00.8794-.878V8.524a.2692.2692 0 01.1935-.273c.141-.0384.2897.0487.3987.2333l2.1522 3.7084c1.251 2.1573 2.0728 3.5738 2.083 3.5892.2807.4742.6986.5576.9973.4755a.7973.7973 0 00.582-.787v-6.945a.2705.2705 0 01.191-.2744c.1397-.0384.287.0487.3947.2333l1.9946 3.4366 2.242 3.8648c.2191.3717.5242.5038.7896.5038a.7691.7691 0 00.2063-.0282.7986.7986 0 00.591-.791V6.4707H24zM8.0026 13.9695V8.4857c0-2.0638 2.6675-3.0546 4.0788-.6563.1025.173 2.3253 4.002 2.3253 4.002V8.4856c0-2.0638 2.6662-3.0546 4.0775-.6563.1026.173 2.3253 4.002 2.3253 4.002V6.4705H22.14v8.9999a.2705.2705 0 01-.1935.2743c-.141.0384-.2897-.0487-.3987-.2333a1360.4277 1360.4277 0 01-2.2406-3.8622l-1.9946-3.434c-.2794-.4744-.696-.5577-.9921-.477a.7986.7986 0 00-.5833.7858v6.9464a.2718.2718 0 01-.1935.2743c-.1423.0384-.291-.0487-.3987-.2333-.0192-.032-1.069-1.8407-2.083-3.5892a6211.7971 6211.7971 0 00-2.1535-3.711c-.2794-.4755-.6973-.5575-.996-.4768a.7999.7999 0 00-.5845.7858v6.8002a.3717.3717 0 01-.3487.3474h-3.452a3.6712 3.6712 0 010-7.3424H7.322v1.328H5.5427a2.3432 2.3432 0 100 4.6864H7.636a.364.364 0 00.3666-.3705Z" />
      </svg>
    );
  }

  // The New York Times Gothic 'T' lettermark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#ffffff"
      style={{
        filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.95))',
        display: 'block'
      }}
      aria-label="The New York Times"
    >
      <path d="M21.272,14.815h-0.098c-0.747,2.049-2.335,3.681-4.363,4.483v-4.483l2.444-2.182l-2.444-2.182V7.397 c2.138,0.006,3.885-1.703,3.927-3.84c0-2.629-2.509-3.556-3.927-3.556c-0.367-0.007-0.734,0.033-1.091,0.12v0.131h0.556 c0.801-0.141,1.565,0.394,1.706,1.195C17.99,1.491,17.996,1.537,18,1.583c-0.033,0.789-0.7,1.401-1.488,1.367 c-0.02-0.001-0.041-0.002-0.061-0.004c-2.444,0-5.323-1.985-8.454-1.985C5.547,0.83,3.448,2.692,3.284,5.139 C3.208,6.671,4.258,8.031,5.76,8.346v-0.12C5.301,7.931,5.041,7.407,5.084,6.862c0.074-1.015,0.957-1.779,1.973-1.705 C7.068,5.159,7.08,5.16,7.091,5.161c2.629,0,6.872,2.182,9.501,2.182h0.098v3.142l-2.444,2.182l2.444,2.182v4.549 c-0.978,0.322-2.003,0.481-3.033,0.469c-1.673,0.084-3.318-0.456-4.614-1.516l4.429-1.985V7.451l-6.196,2.727 c0.592-1.75,1.895-3.168,3.589-3.905V6.175c-4.516,1.004-8.138,4.243-8.138,8.705c0,5.193,4.025,9.12,9.818,9.12 c6.011,0,8.727-4.363,8.727-8.814V14.815z M8.858,18.186c-1.363-1.362-2.091-3.235-2.007-5.16c-0.016-0.88,0.109-1.756,0.371-2.596 l2.051-0.938v8.476L8.858,18.186z" />
    </svg>
  );
}

// Curated authentic Spanish news with real press photography
const SPANISH_NEWS_FALLBACK = [
  {
    title: "Ataque en aeropuerto saudí de Dammam eleva alertas diplomáticas",
    caption: "Instalaciones cercanas a Saudi Aramco sufren impactos en medio de tensiones regionales.",
    image: "https://static01.nyt.com/images/2026/10/22/world/22int-Saudi-Diplos-aifb/22int-Saudi-Diplos-aifb-mediumSquareAt3X.jpg",
    url: "https://cnnespanol.cnn.com",
    source: "CNN"
  },
  {
    title: "Corte Penal Internacional recibe premio Sájarov de la Unión Europea",
    caption: "El máximo reconocimiento destaca su labor en justicia internacional y derechos humanos.",
    image: "https://static01.nyt.com/images/2026/10/22/multimedia/22int-sakharov-icc-fvhp/22int-sakharov-icc-fvhp-mediumSquareAt3X.jpg",
    url: "https://cnnespanol.cnn.com",
    source: "CNN"
  },
  {
    title: "Francia refuerza medidas de seguridad y restringe manifestaciones",
    caption: "El gobierno francés implementa nuevos protocolos en centros metropolitanos.",
    image: "https://static01.nyt.com/images/2026/10/22/multimedia/22int-france-protests-qzmc/22int-france-protests-qzmc-mediumSquareAt3X-v2.jpg",
    url: "https://cnnespanol.cnn.com",
    source: "CNN"
  },
  {
    title: "Alerta global de ciberseguridad: empresas aplican parches urgentes",
    caption: "Entidades públicas y tecnológicas coordinan defensas ante vulnerabilidades críticas.",
    image: "https://static01.nyt.com/images/2026/10/22/multimedia/22int-website-flaws-qvzg/22int-website-flaws-qvzg-mediumSquareAt3X.jpg",
    url: "https://cnnespanol.cnn.com",
    source: "CNN"
  },
  {
    title: "Elecciones en Serbia marcan nueva etapa de equilibrios regionales",
    caption: "Comicios clave definen el rumbo diplomático y relaciones internacionales en los Balcanes.",
    image: "https://static01.nyt.com/images/2026/10/20/multimedia/00int-serbia-nationalism-01-cbtq/00int-serbia-nationalism-01-cbtq-mediumSquareAt3X.jpg",
    url: "https://cnnespanol.cnn.com",
    source: "CNN"
  }
];

// Curated authentic English news with real NYT press photography
const ENGLISH_NEWS_FALLBACK = [
  {
    title: "Houthi Strike on Saudi Airport Kills 2 as U.S. Tells Diplomats to Leave",
    caption: "The airport in Dammam is near the headquarters of oil giant Saudi Aramco amidst regional tensions.",
    image: "https://static01.nyt.com/images/2026/10/22/world/22int-Saudi-Diplos-aifb/22int-Saudi-Diplos-aifb-mediumSquareAt3X.jpg",
    url: "https://www.nytimes.com/section/world",
    source: "The New York Times"
  },
  {
    title: "Putin Nears a Prize: Restoring Diplomatic Ties and Business Deals",
    caption: "Russia seeks to separate geopolitical conflicts from potential diplomacy with international partners.",
    image: "https://static01.nyt.com/images/2026/10/22/multimedia/22int-russia-putin-ftcl/22int-russia-putin-ftcl-mediumSquareAt3X-v3.jpg",
    url: "https://www.nytimes.com/section/world",
    source: "The New York Times"
  },
  {
    title: "French Authorities Ban Some Protests as Security Measures Expand",
    caption: "President Emmanuel Macron outlined new civic order policies across metropolitan centers.",
    image: "https://static01.nyt.com/images/2026/10/22/multimedia/22int-france-protests-qzmc/22int-france-protests-qzmc-mediumSquareAt3X-v2.jpg",
    url: "https://www.nytimes.com/section/world",
    source: "The New York Times"
  },
  {
    title: "International Criminal Court Wins European Union Top Human Rights Prize",
    caption: "The Sakharov honor marks global recognition of international legal accountability efforts.",
    image: "https://static01.nyt.com/images/2026/10/22/multimedia/22int-sakharov-icc-fvhp/22int-sakharov-icc-fvhp-mediumSquareAt3X.jpg",
    url: "https://www.nytimes.com/section/world",
    source: "The New York Times"
  },
  {
    title: "Global Cybersecurity Alert: Infrastructure Teams Patch Critical Flaws",
    caption: "Governments and tech enterprises rapidly coordinate defenses against zero-day exploits.",
    image: "https://static01.nyt.com/images/2026/10/22/multimedia/22int-website-flaws-qvzg/22int-website-flaws-qvzg-mediumSquareAt3X.jpg",
    url: "https://www.nytimes.com/section/technology",
    source: "The New York Times"
  }
];

export function CardDeckCarousel({
  cardWidth = "180px",
  aspect = "4 / 4.8",
  scatter = 5,
  autoplay = 6500,
  onChange,
  onNavigate,
  className = "",
  style = {}
}) {
  const isSpanish = typeof navigator !== 'undefined' && (navigator.language || '').toLowerCase().startsWith('es');
  const defaultInitial = isSpanish ? SPANISH_NEWS_FALLBACK : ENGLISH_NEWS_FALLBACK;

  const [slides, setSlides] = useState(defaultInitial);
  const [top, setTop] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const rootRef = useRef(null);
  const lastTouch = useRef(0);
  const isDraggingRef = useRef(false);
  const n = slides.length || 1;

  // Live RSS Fetcher adapted to user language
  useEffect(() => {
    let isMounted = true;

    async function loadLiveFeed() {
      try {
        const feedUrl = isSpanish
          ? 'https://cnnespanol.cnn.com/feed/'
          : 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml';

        let xmlText = '';
        if (window.browserAPI?.fetchRss) {
          xmlText = await window.browserAPI.fetchRss(feedUrl);
        } else {
          const res = await fetch(feedUrl);
          if (res.ok) xmlText = await res.text();
        }

        if (xmlText && isMounted) {
          const items = [];
          const matches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

          for (const m of matches.slice(0, 8)) {
            const titleMatch = m.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
            const descMatch = m.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/);
            const linkMatch = m.match(/<link>(.*?)<\/link>/);
            const mediaMatch = m.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);

            if (titleMatch && linkMatch) {
              const cleanTitle = titleMatch[1]
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .trim();

              const cleanDesc = descMatch
                ? descMatch[1]
                    .replace(/<[^>]+>/g, '')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .trim()
                : '';

              items.push({
                title: cleanTitle,
                caption: cleanDesc,
                url: linkMatch[1].trim(),
                image: mediaMatch ? mediaMatch[1] : null,
                source: isSpanish ? 'CNN' : 'The New York Times'
              });
            }
          }

          const fallbackList = isSpanish ? SPANISH_NEWS_FALLBACK : ENGLISH_NEWS_FALLBACK;
          const refined = items.map((it, idx) => ({
            ...it,
            image: it.image || fallbackList[idx % fallbackList.length].image
          }));

          if (refined.length > 0 && isMounted) {
            setSlides(refined);
          }
        }
      } catch (err) {
        // Fallback is loaded
      }
    }

    loadLiveFeed();
    return () => { isMounted = false; };
  }, [isSpanish]);

  const nextSlide = useCallback(() => {
    setTop((t) => wrap(t + 1, n));
  }, [n]);

  const prevSlide = useCallback(() => {
    setTop((t) => wrap(t - 1, n));
  }, [n]);

  useEffect(() => {
    onChange?.(top);
  }, [top, onChange]);

  // Gentle autoplay
  useEffect(() => {
    if (n < 2 || !autoplay) return;
    const interval = setInterval(() => {
      if (document.hidden || isHovered || performance.now() - lastTouch.current < autoplay) return;
      nextSlide();
    }, autoplay);
    return () => clearInterval(interval);
  }, [autoplay, n, nextSlide, isHovered]);

  const currentSlide = slides[top] || slides[0] || {};

  const handleCardClick = () => {
    if (isDraggingRef.current) return;
    if (currentSlide.url && onNavigate) {
      onNavigate(currentSlide.url);
    }
  };

  return (
    <div
      ref={rootRef}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'flex-start',
        userSelect: 'none',
        background: 'transparent',
        fontFamily: "'Lato', sans-serif",
        ...style
      }}
    >
      {/* 3D Stacked Card Deck: Clean flat rectangle in resting state; fans out on hover */}
      <div
        style={{
          position: 'relative',
          width: cardWidth,
          aspectRatio: aspect,
          cursor: 'grab'
        }}
      >
        {/* Layered Background Cards (Hidden in resting state, smoothly fanned out on hover) */}
        {[3, 2, 1].map((depth) => {
          const cardIndex = wrap(top + depth, n);
          const p = deckPose(depth, tiltFor(top + depth, scatter), isHovered);
          const sl = slides[cardIndex];

          return (
            <div
              key={`back-${depth}-${cardIndex}`}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#161822',
                boxShadow: isHovered
                  ? '0 8px 24px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                  : 'none',
                transform: `translateY(${p.y}px) scale(${p.scale}) rotate(${p.rot.toFixed(2)}deg)`,
                zIndex: n - depth,
                opacity: p.opacity,
                filter: `brightness(${p.shade})`,
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none'
              }}
            >
              {sl?.image && (
                <img
                  src={sl.image}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  draggable={false}
                />
              )}
            </div>
          );
        })}

        {/* Top Active Card: Draggable + Pure Fade In / Fade Out */}
        <AnimatePresence mode="wait">
          <motion.div
            key={top}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={(e, info) => {
              lastTouch.current = performance.now();
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 40);

              if (info.offset.x < -28 || info.velocity.x < -220) {
                nextSlide();
              } else if (info.offset.x > 28 || info.velocity.x > 220) {
                prevSlide();
              }
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            whileTap={{ cursor: 'grabbing' }}
            onClick={handleCardClick}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#161822',
              boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.14)',
              zIndex: n + 1,
              cursor: 'grab'
            }}
          >
            {currentSlide.image && (
              <img
                src={currentSlide.image}
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                draggable={false}
              />
            )}

            {/* Subtle Gradient overlay for contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(8, 10, 15, 0.85) 0%, rgba(8, 10, 15, 0.1) 45%, transparent 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Bare Publisher Logo with ZERO Container / Background / Pill */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <PublisherLogo source={currentSlide.source} size={20} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Hover Panel appearing to the RIGHT on user hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={handleCardClick}
            style={{
              position: 'absolute',
              top: '4px',
              left: 'calc(100% + 14px)',
              width: '240px',
              padding: '14px 16px',
              background: 'rgba(14, 16, 24, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 18px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.06)',
              zIndex: 99,
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 800,
                fontSize: '13px',
                color: '#ffffff',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.85)'
              }}
            >
              {currentSlide.title}
            </div>

            <div
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.72)',
                marginTop: '6px',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)'
              }}
            >
              {currentSlide.caption}
            </div>

            {/* "Abrir noticia" is pure crisp WHITE, not blue */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff'
              }}
            >
              <span>{isSpanish ? 'Abrir noticia' : 'Read full story'}</span>
              <ArrowUpRight size={13} color="#ffffff" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CardDeckCarousel;
