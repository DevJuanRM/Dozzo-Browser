/**
 * Spectrum UI — BorderBeam SearchBar
 * Updated to user specifications:
 * - Longer width: 580px (responsive up to 94% on mobile)
 * - Darker obsidian pitch-black glass: background #090a0e with subtle inset lighting
 * - Built-in Voice Search (Web Speech API) with live transcription and auto-submission
 * - Traveling colorful border beam active only on intro (3.8s), focus, typing, or voice listening
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Globe, ArrowUpRight, Mic } from 'lucide-react';

export function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.45, flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * BorderBeam component
 * Renders the traveling colorful border beam around the element when active.
 */
export function BorderBeam({
  children,
  size = "line",
  colorVariant = "colorful",
  duration = 3.1,
  borderRadius = 26,
  active = false,
  className = "",
  style = {}
}) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 760,
        height: 52,
        borderRadius: borderRadius,
        padding: '1.5px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: '0 auto',
        ...style
      }}
    >
      {/* Traveling colorful border laser beam */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-100%',
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #06b6d4 300deg, #6366f1 320deg, #a855f7 340deg, #ec4899 360deg)',
          animation: active ? `borderBeamSpin ${duration}s linear infinite` : 'none',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Child component (SearchBar) placed on top */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: Math.max(0, borderRadius - 1),
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {children}
      </div>
    </div>
  );
}

const COMMON_QUICK_SITES = [
  { match: 'you', title: 'YouTube', domain: 'youtube.com', url: 'https://www.youtube.com' },
  { match: 'fig', title: 'Figma', domain: 'figma.com', url: 'https://www.figma.com' },
  { match: 'git', title: 'GitHub', domain: 'github.com', url: 'https://github.com' },
  { match: 'cha', title: 'ChatGPT', domain: 'chatgpt.com', url: 'https://chatgpt.com' },
  { match: 'wha', title: 'WhatsApp Web', domain: 'web.whatsapp.com', url: 'https://web.whatsapp.com' },
  { match: 'bin', title: 'Binance', domain: 'binance.com', url: 'https://www.binance.com' },
  { match: 'twi', title: 'Twitter / X', domain: 'x.com', url: 'https://x.com' },
  { match: 'red', title: 'Reddit', domain: 'reddit.com', url: 'https://reddit.com' },
  { match: 'tra', title: 'TradingView', domain: 'tradingview.com', url: 'https://www.tradingview.com' },
  { match: 'sla', title: 'Slack', domain: 'slack.com', url: 'https://slack.com' }
];

const TYPEWRITER_PHRASES = [
  'Buscar en la web o escribir una dirección...',
  'Cotización de Bitcoin y criptos en vivo...',
  'Tendencias del S&P 500, NVIDIA y Apple...',
  'Últimas noticias de tecnología y mercados...',
  'Escribe cualquier búsqueda o URL para navegar...'
];

/**
 * BeamSearch with full input functionality, voice search and live autocomplete
 */
export function BeamSearch({
  value,
  defaultValue = '',
  onChange,
  onSubmit,
  placeholder = 'Buscar en la web...',
  duration = 3.1,
  colorVariant = 'colorful',
  autoFocus = false,
  className = '',
  style = {}
}) {
  const [inner, setInner] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [introActive, setIntroActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const phraseIndexRef = useRef(0);
  const current = value !== undefined ? value : inner;

  // Active effect runs on entrance (3.8s), focus, typing, or voice listening
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroActive(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Periodic typewriter animation every 60 seconds (Request 5)
  useEffect(() => {
    let typeTimer = null;
    let holdTimer = null;
    let eraseTimer = null;

    const runTypewriterCycle = () => {
      // Don't animate if input has value, is focused, or listening
      if (focused || current || isListening) return;

      const targetPhrase = TYPEWRITER_PHRASES[phraseIndexRef.current % TYPEWRITER_PHRASES.length];
      phraseIndexRef.current += 1;

      let charIndex = 0;
      setTypedPlaceholder('');

      // Type forward character by character
      const typeChar = () => {
        if (charIndex <= targetPhrase.length) {
          setTypedPlaceholder(targetPhrase.slice(0, charIndex));
          charIndex++;
          typeTimer = setTimeout(typeChar, 42);
        } else {
          // Hold full phrase for 3.5 seconds
          holdTimer = setTimeout(() => {
            let eraseIndex = targetPhrase.length;
            const eraseChar = () => {
              if (eraseIndex >= 0) {
                setTypedPlaceholder(targetPhrase.slice(0, eraseIndex));
                eraseIndex--;
                eraseTimer = setTimeout(eraseChar, 22);
              } else {
                setTypedPlaceholder('');
              }
            };
            eraseChar();
          }, 3500);
        }
      };

      typeChar();
    };

    // Run first cycle shortly after arrival (4 seconds)
    const initialTimer = setTimeout(runTypewriterCycle, 4000);

    // Repeat every 60 seconds (1 minute)
    const interval = setInterval(runTypewriterCycle, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (typeTimer) clearTimeout(typeTimer);
      if (holdTimer) clearTimeout(holdTimer);
      if (eraseTimer) clearTimeout(eraseTimer);
    };
  }, [focused, current, isListening]);

  const isBeamActive = introActive || focused || isListening || Boolean(current && current.length > 0);

  const update = (next) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  // Voice Search Web Speech API setup
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = (typeof navigator !== 'undefined' && navigator.language) || 'es-ES';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((r) => r[0].transcript)
            .join('');
          update(transcript);
          if (event.results[0] && event.results[0].isFinal) {
            setIsListening(false);
            if (transcript.trim()) {
              onSubmit?.(transcript.trim());
            }
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        recognitionRef.current = null;
      }
    }
  }, [onSubmit]);

  const toggleVoiceSearch = (e) => {
    e.stopPropagation();
    if (!recognitionRef.current) {
      alert('La búsqueda por voz requiere permisos de micrófono o un navegador compatible.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Autocomplete suggestions generator
  useEffect(() => {
    const raw = (current || '').trim();
    if (!raw) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const list = [];
    const lower = raw.toLowerCase();

    // 1. Direct URL detection
    const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(raw);
    if (isUrl) {
      const urlCandidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      list.push({
        id: 'direct-url',
        type: 'url',
        title: urlCandidate,
        subtitle: 'Ir a dirección web directa',
        url: urlCandidate
      });
    }

    // 2. Matching popular sites
    for (const site of COMMON_QUICK_SITES) {
      if (
        site.match.startsWith(lower) ||
        site.domain.toLowerCase().includes(lower) ||
        site.title.toLowerCase().includes(lower)
      ) {
        list.push({
          id: `site-${site.domain}`,
          type: 'site',
          title: site.title,
          subtitle: site.domain,
          url: site.url
        });
      }
    }

    // 3. Search query suggestion
    list.push({
      id: 'query-search',
      type: 'search',
      title: raw,
      subtitle: 'Buscar en la web',
      query: raw
    });

    setSuggestions(list.slice(0, 5));
    setSelectedIndex(-1);
    if (focused) setIsOpen(true);
  }, [current, focused]);

  const handleSelect = useCallback(
    (item) => {
      setIsOpen(false);
      if (!item) return;
      if (item.url) {
        onSubmit?.(item.url);
      } else {
        onSubmit?.(item.query || item.title);
      }
    },
    [onSubmit]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
      } else if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      } else {
        const text = (current || '').trim();
        if (text) onSubmit?.(text);
      }
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      update('');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 760,
        margin: '0 auto',
        fontFamily: "'Lato', sans-serif",
        ...style
      }}
    >
      <BorderBeam size="line" colorVariant={colorVariant} duration={duration} borderRadius={22} active={isBeamActive}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isOpen && selectedIndex >= 0 && suggestions[selectedIndex]) {
              handleSelect(suggestions[selectedIndex]);
            } else {
              const text = (current || '').trim();
              if (text) onSubmit?.(text);
            }
            setIsOpen(false);
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 25,
            background: '#090a0e',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 2px 14px rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            gap: 12,
            color: '#6e7079',
            boxSizing: 'border-box'
          }}
        >
          <button
            type="submit"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'inherit'
            }}
            title="Buscar"
          >
            <SearchIcon />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={current}
            autoFocus={autoFocus}
            placeholder={isListening ? 'Escuchando tu voz...' : (typedPlaceholder || placeholder)}
            onChange={(e) => update(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onBlur={() => {
              setTimeout(() => setFocused(false), 200);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              lineHeight: '20px',
              color: '#ffffff',
              caretColor: '#ffffff',
              fontFamily: "'Lato', sans-serif"
            }}
          />

          {/* Voice Search Microphone Button */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            title={isListening ? 'Detener dictado de voz' : 'Buscar por voz'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: isListening ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.75)',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <Mic size={15} />
          </button>

          {/* Clear Button */}
          {current ? (
            <button
              type="button"
              onClick={() => {
                update('');
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#aaaaaa',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0
              }}
            >
              <X size={13} />
            </button>
          ) : null}
        </form>
      </BorderBeam>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(12, 13, 18, 0.96)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            zIndex: 9999,
            padding: '6px'
          }}
        >
          {suggestions.map((item, idx) => {
            const isSel = idx === selectedIndex;
            return (
              <div
                key={item.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: isSel ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}
                  >
                    {item.type === 'url' ? <Globe size={14} /> : item.type === 'site' ? <ArrowUpRight size={14} /> : <Search size={14} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BeamSearch;
