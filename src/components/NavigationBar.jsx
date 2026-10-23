import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X as StopIcon,
  Lock,
  Search,
  Star,
  Copy,
  Check,
  Code2,
  Clock,
  Pin,
  PinOff
} from 'lucide-react';
import { getSearchUrl, getEngine } from '../utils/searchEngines';

export default function NavigationBar({
  currentUrl,
  isLoading,
  canGoBack,
  canGoForward,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
  searchEngine,
  isBookmarked,
  onToggleBookmark,
  onToggleInspector,
  isInspectorActive,
  history = [],
  onCloseWindow,
  onMinimizeWindow,
  onMaximizeWindow,
  onFocusChange,
  isHeaderPinned = false,
  onTogglePinHeader
}) {
  const [inputValue, setInputValue] = useState(currentUrl || '');
  const [copied, setCopied] = useState(false);
  const [isOmniFocused, setIsOmniFocused] = useState(false);
  const [dotsHovered, setDotsHovered] = useState(false);

  // Notify parent of omnibar focus changes to prevent premature auto-hiding
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(isOmniFocused);
    }
  }, [isOmniFocused, onFocusChange]);

  // Sync input value with current URL
  useEffect(() => {
    setInputValue(currentUrl || '');
  }, [currentUrl]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      let target = inputValue.trim();
      if (!target) return;

      const isUrl =
        /^https?:\/\//i.test(target) ||
        /^localhost(:[0-9]+)?/i.test(target) ||
        /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(target);

      if (isUrl) {
        if (!/^https?:\/\//i.test(target)) {
          target = 'https://' + target;
        }
        onNavigate(target);
      } else {
        const searchUrl = getSearchUrl(searchEngine, target);
        onNavigate(searchUrl);
      }
    }
  };

  const handleCopyUrl = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const isHttps = currentUrl?.startsWith('https://');

  const matchedHistory = (history || [])
    .filter((h) => {
      if (!inputValue.trim()) return false;
      const q = inputValue.toLowerCase().trim();
      return (
        (h.title && h.title.toLowerCase().includes(q)) ||
        (h.url && h.url.toLowerCase().includes(q))
      );
    })
    .slice(0, 5);

  return (
    <div
      style={styles.navbar}
      className="titlebar-drag-region"
      onDoubleClick={onMaximizeWindow || (() => window.browserAPI?.maximize?.())}
    >
      {/* 1. Authentic macOS Round Traffic Lights on the Far Left */}
      <div
        style={styles.trafficLightContainer}
        className="titlebar-drag-region"
        onMouseEnter={() => setDotsHovered(true)}
        onMouseLeave={() => setDotsHovered(false)}
        title="Doble clic para maximizar o arrastra para mover de pantalla"
      >
        <button
          className="no-drag mac-traffic-dot mac-traffic-dot-close"
          onClick={onCloseWindow || (() => window.browserAPI?.close?.())}
          title="Cerrar ventana"
        >
          <span style={{ ...styles.dotGlyph, opacity: dotsHovered ? 1 : 0 }}>×</span>
        </button>

        {/* Yellow button: poner más chiquita la ventana */}
        <button
          className="no-drag mac-traffic-dot mac-traffic-dot-min"
          onClick={() => {
            if (window.browserAPI?.shrink) {
              window.browserAPI.shrink();
            } else if (onMaximizeWindow) {
              onMaximizeWindow();
            }
          }}
          title="Hacer más pequeña la ventana"
        >
          <span style={{ ...styles.dotGlyph, opacity: dotsHovered ? 1 : 0 }}>−</span>
        </button>

        {/* Green button: minimizar ventana */}
        <button
          className="no-drag mac-traffic-dot mac-traffic-dot-max"
          onClick={onMinimizeWindow || (() => window.browserAPI?.minimize?.())}
          title="Minimizar ventana"
        >
          <span style={{ ...styles.dotGlyph, opacity: dotsHovered ? 1 : 0 }}>+</span>
        </button>
      </div>

      <div style={styles.topDivider} />

      {/* 2. Full-Width Smart Omnibar in the Center */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', minWidth: '220px' }} className="no-drag">
        <div style={styles.omnibar}>
          <div style={styles.securityIcon} title={isHttps ? 'Conexión Cifrada Segura (HTTPS)' : 'Búsqueda / Navegación Privada'}>
            {isHttps ? (
              <Lock size={13} color="var(--success)" />
            ) : (
              <Search size={13} color="var(--text-muted)" />
            )}
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsOmniFocused(false);
              }
              handleKeyDown(e);
            }}
            onFocus={(e) => {
              setIsOmniFocused(true);
              e.target.select();
            }}
            onBlur={() => setTimeout(() => setIsOmniFocused(false), 250)}
            placeholder="Escribe una URL o busca en la web..."
            style={styles.omniInput}
          />

          {/* Copy Link Button */}
          {currentUrl && (
            <button style={styles.omniActionBtn} onClick={handleCopyUrl} title="Copiar enlace">
              {copied ? <Check size={14} color="var(--success)" /> : <Copy size={13} />}
            </button>
          )}

          {/* Bookmark Star Button */}
          <button
            style={styles.omniActionBtn}
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Eliminar de marcadores' : 'Guardar en marcadores'}
          >
            <Star
              size={14}
              color={isBookmarked ? 'var(--accent)' : 'var(--text-muted)'}
              fill={isBookmarked ? 'var(--accent)' : 'none'}
            />
          </button>
        </div>

        {/* Omnibar Autocomplete / History Dropdown */}
        {isOmniFocused && (matchedHistory.length > 0 || (inputValue && inputValue.trim().length > 0)) && (
          <div style={styles.suggestionsDropdown} className="glass-panel animate-slide-down">
            {/* Search query row */}
            {inputValue.trim() && (
              <div
                style={styles.suggestionRow}
                className="dozzo-suggestion-row"
                onMouseDown={() => {
                  handleKeyDown({ key: 'Enter' });
                  setIsOmniFocused(false);
                }}
              >
                <Search size={14} color="var(--accent)" />
                <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '12.5px' }}>
                  Buscar "{inputValue}" en {getEngine(searchEngine).name}
                </span>
                <span style={styles.suggestionBadge}>Buscar</span>
              </div>
            )}

            {/* Matching History rows */}
            {matchedHistory.map((h) => (
              <div
                key={h.id}
                style={styles.suggestionRow}
                className="dozzo-suggestion-row"
                onMouseDown={() => {
                  onNavigate(h.url);
                  setIsOmniFocused(false);
                }}
              >
                <Clock size={13} color="var(--text-muted)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.suggTitle}>{h.title || h.url}</div>
                  <div style={styles.suggUrl}>{h.url}</div>
                </div>
                <span style={styles.suggestionBadge}>Historial</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Draggable spacer allowing user to drag the window to another monitor */}
      <div style={{ width: '24px', height: '100%', minWidth: '16px' }} className="titlebar-drag-region" />

      {/* 2. Unified Controls on the Right: Retroceder, Adelantar, Recargar, Dev Mode */}
      <div style={styles.navGroup} className="no-drag">
        {/* Retroceder */}
        <button
          style={{ ...styles.iconBtn, opacity: canGoBack ? 1 : 0.35 }}
          onClick={onGoBack}
          disabled={!canGoBack}
          title="Retroceder (Alt+Left)"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Adelantar */}
        <button
          style={{ ...styles.iconBtn, opacity: canGoForward ? 1 : 0.35 }}
          onClick={onGoForward}
          disabled={!canGoForward}
          title="Adelantar (Alt+Right)"
        >
          <ArrowRight size={16} />
        </button>

        {/* Recargar / Detener */}
        <button
          style={styles.iconBtn}
          onClick={isLoading ? onStop : onReload}
          title={isLoading ? 'Detener carga' : 'Recargar página (Ctrl+R)'}
        >
          {isLoading ? <StopIcon size={16} /> : <RotateCw size={15} />}
        </button>

        {/* Fijar Header (Pin / Auto-hide Toggle) */}
        {onTogglePinHeader && (
          <button
            style={{
              ...styles.iconBtn,
              color: isHeaderPinned ? 'var(--accent)' : 'rgba(255, 255, 255, 0.45)',
              background: isHeaderPinned ? 'rgba(240, 185, 11, 0.16)' : 'transparent',
              border: isHeaderPinned ? '1px solid rgba(240, 185, 11, 0.35)' : '1px solid transparent',
              boxShadow: isHeaderPinned ? '0 0 10px var(--accent-glow)' : 'none',
              borderRadius: '8px'
            }}
            onClick={onTogglePinHeader}
            title={
              isHeaderPinned
                ? 'Barra superior fijada permanentemente (Clic para ocultar automáticamente al salir el mouse)'
                : 'Fijar barra superior permanentemente en la parte superior'
            }
          >
            {isHeaderPinned ? <Pin size={15} fill="currentColor" /> : <PinOff size={15} />}
          </button>
        )}

        <div style={styles.rightDivider} />

        {/* Dev Mode button */}
        <button
          style={{
            ...styles.iconBtn,
            color: isInspectorActive ? 'var(--accent)' : '#ffffff',
            background: isInspectorActive ? 'rgba(240, 185, 11, 0.18)' : 'transparent',
            border: isInspectorActive ? '1px solid rgba(240, 185, 11, 0.35)' : '1px solid transparent',
            boxShadow: isInspectorActive ? '0 0 12px var(--accent-glow)' : 'none',
            borderRadius: '8px'
          }}
          onClick={onToggleInspector}
          title={isInspectorActive ? 'Cerrar Modo Desarrollador' : 'Modo Desarrollador / Dev Studio (</>)'}
        >
          <Code2 size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 14px',
    background: 'linear-gradient(180deg, rgba(14, 15, 22, 0.85) 0%, rgba(10, 11, 16, 0.95) 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    userSelect: 'none',
    zIndex: 50,
    flexShrink: 0
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  iconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  omnibar: {
    flex: 1,
    height: '34px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
  },
  securityIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0
  },
  omniInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '12.5px',
    fontFamily: 'Lato, -apple-system, sans-serif',
    outline: 'none',
    padding: '0 4px',
    letterSpacing: '0.1px'
  },
  omniActionBtn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'all 0.15s ease'
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: 'rgba(14, 15, 22, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: '10px',
    padding: '6px',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    backdropFilter: 'blur(20px)'
  },
  suggestionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  },
  suggTitle: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  suggUrl: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  suggestionBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-muted)'
  },
  rightDivider: {
    width: '1px',
    height: '18px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0 4px'
  },
  trafficLightContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '0 6px 0 2px',
    height: '100%',
    flexShrink: 0,
    cursor: 'default'
  },
  dotGlyph: {
    fontSize: '8px',
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.75)',
    lineHeight: '1',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.15s ease'
  },
  topDivider: {
    width: '1px',
    height: '18px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0 8px 0 2px',
    flexShrink: 0
  }
};
