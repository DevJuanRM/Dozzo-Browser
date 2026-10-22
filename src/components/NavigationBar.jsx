import React, { useState, useEffect, useRef } from 'react';
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
  Palette,
  Sliders,
  Download,
  PanelRight,
  Code2,
  History,
  Clock,
  Globe,
  ChevronDown,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { getSearchUrl, getEngine } from '../utils/searchEngines';
import { BrokerIcon } from './BinanceWidget';
import { CURATED_THEMES, getTheme, getNextTheme } from '../utils/themes';

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
  showBookmarksBar = false,
  onToggleBookmarksBar,
  blockedCount,
  isShieldActive,
  isShieldOpen = false,
  onToggleShieldModal,
  onToggleBinance,
  isBinanceOpen,
  selectedCryptoBroker = 'binance',
  theme = 'obsidian-aurora',
  onChangeTheme,
  onOpenSettings,
  onCheckUpdates,
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
  history = [],
  isAutoHidden = false,
  onToggleAutoHide
}) {
  const [inputValue, setInputValue] = useState(currentUrl || '');
  const [copied, setCopied] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isOmniFocused, setIsOmniFocused] = useState(false);

  const themeMenuRef = useRef(null);
  const toolsMenuRef = useRef(null);

  const currentThemeObj = getTheme(theme);

  // Close menus on click outside
  useEffect(() => {
    if (!showThemeMenu && !showToolsMenu) return;
    const handleOutsideClick = (e) => {
      if (showThemeMenu && themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
      if (showToolsMenu && toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setShowToolsMenu(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsideClick, true);
    return () => window.removeEventListener('pointerdown', handleOutsideClick, true);
  }, [showThemeMenu, showToolsMenu]);

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

        <button
          style={{
            ...styles.iconBtn,
            color: isInspectorActive ? 'var(--accent)' : 'inherit',
            background: isInspectorActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
          }}
          onClick={onToggleInspector}
          title={isInspectorActive ? 'Cerrar Modo Desarrollador (Inspector)' : 'Modo Desarrollador (DevMode)'}
        >
          <Code2 size={16} />
        </button>
      </div>

      {/* Privacy Shield Badge (Muted by default, illuminates in emerald when clicked) */}
      <button
        style={{
          ...styles.shieldBtn,
          ...(isShieldOpen ? styles.shieldBtnActive : styles.shieldBtnInactive)
        }}
        onClick={onToggleShieldModal}
        title="Escudo de Privacidad Dozzo (Clic para abrir y ver rastreadores bloqueados)"
      >
        <Shield size={14} color={isShieldOpen ? 'var(--success)' : 'var(--text-muted)'} />
        <span style={{ color: isShieldOpen ? 'var(--success)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          {blockedCount}
        </span>
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

      {/* Crypto Hub Broker Button: Minimalist icon button matching navigation controls */}
      <button
        style={{
          ...styles.iconBtn,
          background: isBinanceOpen ? 'var(--bg-hover)' : 'transparent',
          color: isBinanceOpen ? 'var(--text-primary)' : 'var(--text-secondary)'
        }}
        onClick={onToggleBinance}
        title={`Crypto Markets Hub (${selectedCryptoBroker.toUpperCase()}) - Clic para cotizaciones y divisas`}
      >
        <TrendingUp size={16} />
      </button>

      {/* Theme Quick Selector: Pure Palette Icon matching navigation controls (No text, no extra cycle button) */}
      <div ref={themeMenuRef} style={{ position: 'relative' }}>
        <button
          style={{
            ...styles.iconBtn,
            background: showThemeMenu ? 'var(--bg-hover)' : 'transparent',
            color: showThemeMenu ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          title={`Temas del Explorador (Tema actual: ${currentThemeObj.name}) - Clic para ver los 10 modos`}
        >
          <Palette size={16} />
        </button>

        {/* 10 Curated Themes Popover Dropdown */}
        {showThemeMenu && (
          <div style={styles.themesDropdown} className="glass-panel animate-slide-down">
            <div style={styles.themesHeader}>
              <span style={styles.themesTitle}>Temas del Explorador</span>
              <span style={styles.themesCountBadge}>10 Modos</span>
            </div>
            <div style={styles.themesList}>
              {CURATED_THEMES.map((thm) => {
                const isSelected =
                  theme === thm.id ||
                  (theme === 'dark' && thm.id === 'obsidian-aurora') ||
                  (theme === 'light' && thm.id === 'mac-snow');
                return (
                  <button
                    key={thm.id}
                    style={{
                      ...styles.themeOptionItem,
                      backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--border-hover)' : '1px solid transparent'
                    }}
                    onClick={() => {
                      if (onChangeTheme) onChangeTheme(thm.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Half-and-Half 50/50 Diagonal Split Theme Swatch Circle */}
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${thm.primaryColor} 50%, ${thm.accentColor} 50%)`,
                          border: isSelected ? '2px solid var(--text-primary)' : '1.5px solid rgba(255, 255, 255, 0.25)',
                          boxShadow: isSelected ? `0 0 10px ${thm.accentColor}66` : '0 2px 6px rgba(0,0,0,0.4)',
                          flexShrink: 0
                        }}
                      />
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: isSelected ? '700' : '500',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {thm.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '9.5px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          background: thm.type === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {thm.badge}
                      </span>
                      {isSelected && <Check size={13} color="var(--accent)" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Utilities Group (Unified Tools Menu) */}
      <div style={styles.navGroup}>
        {/* Unified Tools Hub Button */}
        <div ref={toolsMenuRef} style={{ position: 'relative' }}>
          <button
            style={{
              ...styles.iconBtn,
              background: showToolsMenu ? 'var(--accent)' : 'transparent',
              color: showToolsMenu ? 'var(--accent-text)' : 'var(--text-secondary)',
              position: 'relative'
            }}
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            title="Herramientas Dozzo (Panel Lateral, Descargas, Historial, Ajustes)"
          >
            <LayoutGrid size={16} />
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

          {showToolsMenu && (
            <div style={styles.toolsMenuPopover} className="glass-panel animate-slide-down">
              <div style={styles.toolsMenuHeader}>
                <span style={styles.toolsMenuTitle}>Herramientas Dozzo</span>
                <button
                  style={styles.closePopoverBtn}
                  onClick={() => setShowToolsMenu(false)}
                  title="Cerrar menú"
                >
                  &times;
                </button>
              </div>

              <div style={styles.toolsList}>
                {/* Sidebar Apps */}
                <button
                  className="dozzo-tool-item"
                  style={{
                    ...styles.toolItem,
                    background: isSidebarOpen ? 'var(--bg-tertiary)' : 'transparent'
                  }}
                  onClick={() => {
                    onToggleSidebar();
                    setShowToolsMenu(false);
                  }}
                >
                  <div style={{ ...styles.toolIconBox, background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
                    <PanelRight size={15} />
                  </div>
                  <div style={styles.toolTexts}>
                    <div style={styles.toolName}>Panel Lateral</div>
                    <div style={styles.toolDesc}>Notas, Conversor Cripto y Chat IA</div>
                  </div>
                </button>

                {/* Downloads */}
                <button
                  className="dozzo-tool-item"
                  style={styles.toolItem}
                  onClick={() => {
                    onToggleDownloads();
                    setShowToolsMenu(false);
                  }}
                >
                  <div style={{ ...styles.toolIconBox, background: 'rgba(240, 185, 11, 0.15)' }}>
                    <img src="./Logo.svg" alt="Descargas" style={{ width: '16px', height: '16px', borderRadius: '3px', objectFit: 'contain' }} />
                  </div>
                  <div style={styles.toolTexts}>
                    <div style={styles.toolName}>Descargas</div>
                    <div style={styles.toolDesc}>
                      {downloadsCount > 0 ? `${downloadsCount} descarga(s) activa(s)` : 'Ver archivos descargados'}
                    </div>
                  </div>
                </button>

                {/* History */}
                <button
                  className="dozzo-tool-item"
                  style={styles.toolItem}
                  onClick={() => {
                    onOpenHistory();
                    setShowToolsMenu(false);
                  }}
                >
                  <div style={{ ...styles.toolIconBox, background: 'rgba(249, 115, 22, 0.15)', color: '#F97316' }}>
                    <History size={15} />
                  </div>
                  <div style={styles.toolTexts}>
                    <div style={styles.toolName}>Historial</div>
                    <div style={styles.toolDesc}>Páginas visitadas recientemente (Ctrl+H)</div>
                  </div>
                </button>

                <div style={styles.menuDivider} />

                {/* Settings & Privacy */}
                <button
                  className="dozzo-tool-item"
                  style={styles.toolItem}
                  onClick={() => {
                    onOpenSettings();
                    setShowToolsMenu(false);
                  }}
                >
                  <div style={{ ...styles.toolIconBox, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    <Sliders size={15} />
                  </div>
                  <div style={styles.toolTexts}>
                    <div style={styles.toolName}>Ajustes y Privacidad</div>
                    <div style={styles.toolDesc}>Motor de búsqueda, caché y preferencias</div>
                  </div>
                </button>

                {/* Updates Checker */}
                <button
                  className="dozzo-tool-item"
                  style={styles.toolItem}
                  onClick={() => {
                    if (onCheckUpdates) {
                      onCheckUpdates();
                    } else if (onOpenSettings) {
                      onOpenSettings();
                    }
                    setShowToolsMenu(false);
                  }}
                >
                  <div style={{ ...styles.toolIconBox, background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent)' }}>
                    <Sparkles size={15} />
                  </div>
                  <div style={styles.toolTexts}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={styles.toolName}>Actualizaciones</span>
                      <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: '700' }}>v2.0.0</span>
                    </div>
                    <div style={styles.toolDesc}>Buscar nuevas versiones en GitHub</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
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
    background: 'transparent',
    borderBottom: 'none',
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
    border: '1px solid rgba(16, 185, 129, 0.4)',
    boxShadow: '0 0 10px var(--success-glow)'
  },
  shieldBtnInactive: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid transparent',
    opacity: 0.75
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
  brokerIconBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    height: '32px',
    padding: '0 8px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  brokerIconBtnActive: {
    background: 'rgba(240, 185, 11, 0.18)',
    borderColor: '#F0B90B'
  },
  themePillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 10px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  themePillBtnActive: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'var(--accent)',
    boxShadow: '0 0 10px var(--accent-glow)'
  },
  themePillName: {
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap'
  },
  themeCycleBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  themesDropdown: {
    position: 'absolute',
    top: '38px',
    right: '0',
    left: 'auto',
    width: '230px',
    padding: '8px',
    borderRadius: '14px',
    zIndex: 150,
    background: 'var(--glass-bg)',
    border: '1px solid var(--border-hover)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)'
  },
  themesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 6px 8px 6px',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '6px'
  },
  themesTitle: {
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-secondary)'
  },
  themesCountBadge: {
    fontSize: '9.5px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'var(--bg-hover)',
    color: 'var(--accent)'
  },
  themesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  themeOptionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid transparent',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.12s ease'
  },
  // Suggestions Autocomplete Dropdown
  suggestionsDropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: '0',
    right: '0',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-hover)',
    borderRadius: '12px',
    padding: '6px',
    zIndex: 250,
    backdropFilter: 'blur(24px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)',
    maxHeight: '340px',
    overflowY: 'auto'
  },
  suggestionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    border: '1px solid transparent'
  },
  suggestionBadge: {
    fontSize: '9.5px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '4px',
    background: 'var(--bg-hover)',
    color: 'var(--text-secondary)',
    flexShrink: 0
  },
  suggTitle: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  suggUrl: {
    fontSize: '11px',
    color: 'var(--accent)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  // Unified Tools Menu Popover
  toolsMenuPopover: {
    position: 'absolute',
    top: '38px',
    right: '0',
    left: 'auto',
    width: '280px',
    padding: '10px',
    borderRadius: '14px',
    zIndex: 150,
    background: 'var(--glass-bg)',
    border: '1px solid var(--border-hover)',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)'
  },
  toolsMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2px 4px 8px 4px',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '8px'
  },
  toolsMenuTitle: {
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.4px',
    color: 'var(--text-primary)'
  },
  closePopoverBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '18px',
    lineHeight: '1',
    cursor: 'pointer',
    padding: '0 4px',
    borderRadius: '4px'
  },
  toolsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  toolItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '10px',
    background: 'transparent',
    border: '1px solid transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  },
  toolIconBox: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  toolTexts: {
    flex: 1,
    minWidth: 0
  },
  toolName: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '2px'
  },
  toolDesc: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  menuDivider: {
    height: '1px',
    background: 'var(--border-subtle)',
    margin: '4px 0'
  }
};

