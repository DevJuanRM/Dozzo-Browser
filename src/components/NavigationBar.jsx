import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X as StopIcon,
  Home,
  Shield,
  Lock,
  Search,
  Star,
  Copy,
  Check,
  TrendingUp,
  Moon,
  Sun,
  Palette,
  Sliders,
  Download,
  PanelRight,
  Code2,
  Mic,
  History,
  Clock,
  Globe,
  ChevronUp,
  ChevronDown
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
  onGoHome,
  blockedCount,
  isShieldActive,
  onToggleShieldModal,
  onToggleBinance,
  isBinanceOpen,
  theme,
  onToggleTheme,
  accentColor,
  onChangeAccent,
  onOpenSettings,
  searchEngine,
  isBookmarked,
  onToggleBookmark,
  binanceTicker,
  onToggleDownloads,
  downloadsCount = 0,
  onToggleSidebar,
  isSidebarOpen,
  onToggleInspector,
  isInspectorActive,
  onOpenHistory,
  onOpenVoiceAssistant,
  history = [],
  isAutoHidden = false,
  onToggleAutoHide
}) {
  const [inputValue, setInputValue] = useState(currentUrl || '');
  const [copied, setCopied] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [isOmniFocused, setIsOmniFocused] = useState(false);

  // Sync input value with current URL
  useEffect(() => {
    setInputValue(currentUrl || '');
  }, [currentUrl]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      let target = inputValue.trim();
      if (!target) return;

      // Check if it's a valid URL or domain
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

  const accents = [
    { id: 'gold', name: 'Binance Gold', color: '#F0B90B' },
    { id: 'cyan', name: 'Cyber Cyan', color: '#06B6D4' },
    { id: 'emerald', name: 'Emerald Green', color: '#10B981' },
    { id: 'purple', name: 'Royal Violet', color: '#8B5CF6' },
    { id: 'orange', name: 'Sunset Orange', color: '#F97316' },
    { id: 'crimson', name: 'Ruby Crimson', color: '#EF4444' }
  ];

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
    <div style={styles.navbar}>
      {/* Navigation Buttons (Back, Forward, Reload, Home) */}
      <div style={styles.navGroup}>
        <button
          style={{ ...styles.iconBtn, opacity: canGoBack ? 1 : 0.35 }}
          onClick={onGoBack}
          disabled={!canGoBack}
          title="Atrás (Alt+Left)"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          style={{ ...styles.iconBtn, opacity: canGoForward ? 1 : 0.35 }}
          onClick={onGoForward}
          disabled={!canGoForward}
          title="Adelante (Alt+Right)"
        >
          <ArrowRight size={16} />
        </button>

        <button
          style={styles.iconBtn}
          onClick={isLoading ? onStop : onReload}
          title={isLoading ? 'Detener carga' : 'Recargar página (Ctrl+R)'}
        >
          {isLoading ? <StopIcon size={16} /> : <RotateCw size={15} />}
        </button>

        <button style={styles.iconBtn} onClick={onGoHome} title="Página de inicio (Speed Dial)">
          <Home size={16} />
        </button>
      </div>

      {/* Privacy Shield Badge */}
      <button
        style={{
          ...styles.shieldBtn,
          ...(isShieldActive ? styles.shieldBtnActive : styles.shieldBtnInactive)
        }}
        onClick={onToggleShieldModal}
        title="Escudo de Privacidad Dozzo (Sin Anuncios / Sin Rastreo)"
      >
        <Shield size={14} color={isShieldActive ? 'var(--success)' : 'var(--text-muted)'} />
        <span style={styles.shieldCount}>{blockedCount}</span>
      </button>

      {/* Smart Omnibar Container with History Autocomplete */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
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
                onMouseDown={() => {
                  handleKeyDown({ key: 'Enter' });
                  setIsOmniFocused(false);
                }}
              >
                <Search size={14} color="var(--accent)" />
                <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600' }}>
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

      {/* Binance Crypto Widget Button */}
      <button
        style={{
          ...styles.binanceBtn,
          ...(isBinanceOpen ? styles.binanceBtnActive : {})
        }}
        onClick={onToggleBinance}
        title="Abrir Binance Crypto Hub"
      >
        <div style={styles.binanceLogo}>
          <TrendingUp size={14} color="#F0B90B" />
        </div>
        <span style={styles.binanceLabel}>BINANCE</span>
        {binanceTicker && (
          <span style={styles.tickerBadge}>
            {binanceTicker.symbol}: ${parseFloat(binanceTicker.price).toLocaleString()}
          </span>
        )}
      </button>

      {/* Utilities Group (Theme, Palette, Settings) */}
      <div style={styles.navGroup}>
        {/* Theme Toggle (Dark / Light) */}
        <button
          style={styles.iconBtn}
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Accent Color Palette Selector */}
        <div style={{ position: 'relative' }}>
          <button
            style={styles.iconBtn}
            onClick={() => setShowPalette(!showPalette)}
            title="Colores y Temas"
          >
            <Palette size={16} />
          </button>

          {showPalette && (
            <div style={styles.palettePopover} className="glass-panel animate-slide-down">
              <div style={styles.paletteTitle}>Personalizar Acento</div>
              <div style={styles.colorGrid}>
                {accents.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      onChangeAccent(acc.id);
                      setShowPalette(false);
                    }}
                    style={{
                      ...styles.colorCircle,
                      backgroundColor: acc.color,
                      border: accentColor === acc.id ? '2px solid white' : '2px solid transparent'
                    }}
                    title={acc.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Downloads Button */}
        <button
          style={{
            ...styles.iconBtn,
            position: 'relative'
          }}
          onClick={onToggleDownloads}
          title="Ver Descargas"
        >
          <Download size={16} />
          {downloadsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                fontSize: '9px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {downloadsCount}
            </span>
          )}
        </button>

        {/* History Button */}
        <button
          style={styles.iconBtn}
          onClick={onOpenHistory}
          title="Historial de Navegación (Ctrl+H)"
        >
          <History size={16} />
        </button>

        {/* Voice Assistant Button */}
        <button
          style={{
            ...styles.iconBtn,
            color: 'var(--accent)',
            background: 'rgba(240, 185, 11, 0.12)'
          }}
          onClick={onOpenVoiceAssistant}
          title="Dozzo Asistente de Voz (Hablar con micrófono)"
        >
          <Mic size={16} />
        </button>

        {/* Sidebar Apps (Notes / AI / Calc) Button */}
        <button
          style={{
            ...styles.iconBtn,
            background: isSidebarOpen ? 'var(--bg-tertiary)' : 'transparent',
            color: isSidebarOpen ? 'var(--accent)' : 'var(--text-secondary)'
          }}
          onClick={onToggleSidebar}
          title="Herramientas Laterales (Notas / Conversor Cripto / IA)"
        >
          <PanelRight size={16} />
        </button>

        {/* Dev Studio: Inspect element to React / Figma */}
        <button
          style={{
            ...styles.iconBtn,
            background: isInspectorActive ? 'var(--accent)' : 'transparent',
            color: isInspectorActive ? 'var(--accent-text)' : 'var(--text-secondary)',
            boxShadow: isInspectorActive ? '0 0 10px var(--accent-glow)' : 'none'
          }}
          onClick={onToggleInspector}
          title={
            isInspectorActive
              ? 'Inspector activo: haz clic en cualquier elemento de la web'
              : 'Dozzo Dev Studio: Convertir elemento web a React (JSX) o Figma'
          }
        >
          <Code2 size={16} />
        </button>

        {/* Settings Button */}
        <button style={styles.iconBtn} onClick={onOpenSettings} title="Ajustes y Privacidad">
          <Sliders size={16} />
        </button>

        {/* Auto-hide / Collapsible top bar toggle arrow */}
        {onToggleAutoHide && (
          <button
            style={{
              ...styles.iconBtn,
              color: isAutoHidden ? 'var(--accent)' : 'var(--text-muted)',
              background: isAutoHidden ? 'var(--accent-glow)' : 'transparent'
            }}
            onClick={onToggleAutoHide}
            title={
              isAutoHidden
                ? 'Fijar barra superior permanentemente'
                : 'Ocultar barra automáticamente (como barra de Windows al pasar el mouse)'
            }
          >
            {isAutoHidden ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: 'var(--navbar-height)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 12px',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'relative',
    zIndex: 40
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  iconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    transition: 'all 0.15s ease'
  },
  shieldBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '0 8px',
    height: '32px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    transition: 'all 0.15s ease'
  },
  shieldBtnActive: {
    background: 'var(--success-glow)',
    color: 'var(--success)',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  shieldBtnInactive: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-subtle)'
  },
  shieldCount: {
    fontFamily: 'JetBrains Mono, monospace'
  },
  omnibar: {
    flex: 1,
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '0 10px',
    transition: 'all 0.15s ease'
  },
  securityIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px'
  },
  omniInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '12.5px',
    fontWeight: '400',
    letterSpacing: '0.2px'
  },
  omniActionBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    marginLeft: '4px'
  },
  binanceBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 10px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(240, 185, 11, 0.12)',
    border: '1px solid rgba(240, 185, 11, 0.3)',
    color: '#F0B90B',
    fontSize: '11.5px',
    fontWeight: '700',
    transition: 'all 0.15s ease'
  },
  binanceBtnActive: {
    background: 'rgba(240, 185, 11, 0.25)',
    borderColor: '#F0B90B',
    boxShadow: '0 0 12px rgba(240, 185, 11, 0.3)'
  },
  binanceLogo: {
    display: 'flex',
    alignItems: 'center'
  },
  binanceLabel: {
    letterSpacing: '0.5px'
  },
  tickerBadge: {
    fontSize: '11px',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '500',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(0,0,0,0.3)',
    marginLeft: '2px'
  },
  palettePopover: {
    position: 'absolute',
    top: '40px',
    right: '0',
    width: '180px',
    padding: '12px',
    borderRadius: '12px',
    zIndex: 100
  },
  paletteTitle: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '8px'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  colorCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '38px',
    left: '0',
    right: '0',
    borderRadius: '12px',
    padding: '6px',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    maxHeight: '260px',
    overflowY: 'auto'
  },
  suggestionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.12s ease'
  },
  suggestionBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    background: 'var(--bg-tertiary)',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase'
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
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};
