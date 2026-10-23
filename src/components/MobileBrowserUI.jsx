import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  MoreVertical,
  RotateCw,
  X,
  Shield,
  Mic,
  Lock,
  Globe,
  Star,
  Clock,
  Download,
  Moon,
  Sun,
  Settings,
  Coins,
  Search,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { BrokerIcon } from './BinanceWidget';
import { getSearchUrl } from '../utils/searchEngines';

export default function MobileBrowserUI({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onCloseAllTabs,
  currentUrl,
  isLoading,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
  onNavigate,
  searchEngine = 'google',
  blockedCount,
  onToggleShieldModal,
  selectedCryptoBroker,
  onOpenBinance,
  onOpenDownloads,
  onOpenHistory,
  onOpenSettings,
  theme,
  onToggleTheme,
  isBookmarked,
  onToggleBookmark,
  isEmbedded = false,
  hasDynamicIsland = false
}) {
  const [isTabsOpen, setIsTabsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const inputRef = useRef(null);
  const voiceRecRef = useRef(null);

  useEffect(() => {
    setUrlInput(currentUrl || '');
  }, [currentUrl]);

  useEffect(() => {
    if (isEditingUrl && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingUrl]);

  // Voice Search setup for mobile
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = (typeof navigator !== 'undefined' && navigator.language) || 'es-ES';

        rec.onstart = () => setIsVoiceListening(true);
        rec.onresult = (evt) => {
          const transcript = Array.from(evt.results).map((r) => r[0].transcript).join('');
          setUrlInput(transcript);
          if (evt.results[0] && evt.results[0].isFinal) {
            setIsVoiceListening(false);
            if (transcript.trim()) {
              const finalTarget = getSearchUrl(searchEngine || 'google', transcript.trim());
              onNavigate(finalTarget);
              setIsEditingUrl(false);
            }
          }
        };
        rec.onerror = () => setIsVoiceListening(false);
        rec.onend = () => setIsVoiceListening(false);
        voiceRecRef.current = rec;
      } catch (e) {
        voiceRecRef.current = null;
      }
    }
  }, [searchEngine, onNavigate]);

  const toggleVoice = (e) => {
    e.stopPropagation();
    if (!voiceRecRef.current) {
      alert('La búsqueda por voz requiere permisos de micrófono.');
      return;
    }
    if (isVoiceListening) {
      voiceRecRef.current.stop();
      setIsVoiceListening(false);
    } else {
      try {
        voiceRecRef.current.start();
        setIsVoiceListening(true);
      } catch (err) {
        setIsVoiceListening(false);
      }
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleSubmitUrl = (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    let target = urlInput.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = getSearchUrl(searchEngine || 'google', target);
      }
    }
    onNavigate(target);
    setIsEditingUrl(false);
  };

  // Format domain for clean mobile address pill display (e.g. "youtube.com")
  const getDomainFromUrl = (u) => {
    if (!u) return 'dozzo:inicio';
    try {
      return new URL(u).hostname.replace(/^www\./, '');
    } catch {
      return u;
    }
  };

  const getDisplayDomain = () => {
    if (!activeTab || activeTab.isNewTab || !activeTab.url) return 'Buscar o escribir URL';
    return getDomainFromUrl(activeTab.url);
  };

  return (
    <>
      {/* 1. Mobile Top Address Bar (Chrome Mobile Layout) */}
      <div
        style={{
          ...styles.mobileTopBar,
          ...(isEmbedded ? { position: 'relative', width: '100%', boxSizing: 'border-box' } : {}),
          ...(hasDynamicIsland ? { height: '72px', paddingTop: '22px' } : {})
        }}
      >
        {/* Shield with blocked ads badge */}
        <button
          style={styles.shieldBtn}
          onClick={onToggleShieldModal}
          title="Escudo de Privacidad"
        >
          <Shield size={16} color="#ffffff" />
          {blockedCount > 0 && <span style={styles.shieldBadge}>{blockedCount}</span>}
        </button>

        {/* Center Omnibar Capsule */}
        <div
          style={styles.omnibarCapsule}
          onClick={() => {
            if (!isEditingUrl) {
              setIsEditingUrl(true);
            }
          }}
        >
          {isEditingUrl ? (
            <form onSubmit={handleSubmitUrl} style={styles.urlForm}>
              <Search size={14} color="rgba(255, 255, 255, 0.6)" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={isVoiceListening ? "Escuchando..." : "Buscar o escribir URL..."}
                style={styles.urlInput}
              />
              <button
                type="button"
                style={{ ...styles.clearBtn, color: isVoiceListening ? '#ef4444' : 'rgba(255, 255, 255, 0.7)' }}
                onClick={toggleVoice}
                title="Búsqueda por voz"
              >
                <Mic size={14} />
              </button>
              {urlInput && (
                <button
                  type="button"
                  style={styles.clearBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUrlInput('');
                    inputRef.current?.focus();
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </form>
          ) : (
            <div style={styles.capsuleContent}>
              <Lock size={12} color="#ffffff" style={{ flexShrink: 0 }} />
              <span style={styles.domainText}>{getDisplayDomain()}</span>
            </div>
          )}
        </div>


        {/* Chrome Mobile Tabs Counter Square Badge [ 1 ] */}
        <button
          style={styles.tabsBadgeBtn}
          onClick={() => setIsTabsOpen(true)}
          title="Ver pestañas abiertas"
        >
          <div style={styles.tabsBadgeBox}>
            <span style={styles.tabsBadgeText}>{tabs.length}</span>
          </div>
        </button>

        {/* Chrome Mobile Three Vertical Dots Menu Button (⋮) */}
        <button
          style={styles.iconBtn}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Opciones del navegador"
        >
          <MoreVertical size={19} />
        </button>
      </div>

      {/* Quick Search Suggestions when editing URL */}
      {isEditingUrl && (
        <div style={{ ...styles.searchOverlay, ...(isEmbedded ? { position: 'absolute', inset: 0 } : {}) }} onClick={() => setIsEditingUrl(false)}>
          <div style={styles.searchSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.searchShortcutsTitle}>Accesos Rápidos</div>
            <div style={styles.shortcutsRow}>
              {[
                { name: 'Google', url: 'https://www.google.com' },
                { name: 'YouTube', url: 'https://www.youtube.com' },
                { name: 'Binance', url: 'https://www.binance.com' },
                { name: 'Figma', url: 'https://www.figma.com' },
                { name: 'Wikipedia', url: 'https://es.wikipedia.org' }
              ].map((item) => (
                <button
                  key={item.name}
                  style={styles.shortcutChip}
                  onClick={() => {
                    onNavigate(item.url);
                    setIsEditingUrl(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                style={styles.cancelSearchBtn}
                onClick={() => setIsEditingUrl(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mobile Fixed Bottom Navigation Bar (Chrome Mobile style) */}
      <div style={{ ...styles.mobileBottomBar, ...(isEmbedded ? { position: 'absolute', bottom: 0, left: 0, right: 0 } : {}) }}>
        {/* Back Button */}
        <button
          style={{ ...styles.navBtn, opacity: canGoBack ? 1 : 0.3 }}
          onClick={onGoBack}
          disabled={!canGoBack}
          title="Atrás"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Forward Button */}
        <button
          style={{ ...styles.navBtn, opacity: canGoForward ? 1 : 0.3 }}
          onClick={onGoForward}
          disabled={!canGoForward}
          title="Adelante"
        >
          <ChevronRight size={24} />
        </button>

        {/* New Tab (+) Button */}
        <button
          style={styles.newTabBtn}
          onClick={() => {
            onNewTab();
            setIsTabsOpen(false);
          }}
          title="Nueva Pestaña"
        >
          <Plus size={22} color="#000000" />
        </button>

        {/* Reload / Stop Button */}
        <button
          style={styles.navBtn}
          onClick={isLoading ? onStop : onReload}
          title={isLoading ? 'Detener' : 'Recargar'}
        >
          {isLoading ? <X size={20} /> : <RotateCw size={20} />}
        </button>

        {/* Favorite / Bookmark Button */}
        <button
          style={styles.navBtn}
          onClick={onToggleBookmark}
          title={isBookmarked ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
        >
          <Star size={20} fill={isBookmarked ? '#ffffff' : 'none'} color="#ffffff" />
        </button>
      </div>

      {/* 3. Mobile Native Tabs Grid Sheet (Full-Screen Switcher) */}
      {isTabsOpen && (
        <div style={{ ...styles.tabsModalOverlay, ...(isEmbedded ? { position: 'absolute', inset: 0 } : {}) }} className="animate-fade-in">
          <div style={styles.tabsModalHeader}>
            <button
              style={styles.tabsHeaderBtn}
              onClick={() => {
                onNewTab();
                setIsTabsOpen(false);
              }}
            >
              <Plus size={18} />
              <span>Nueva</span>
            </button>

            <span style={styles.tabsHeaderTitle}>Pestañas ({tabs.length})</span>

            <button
              style={{ ...styles.tabsHeaderBtn, fontWeight: '700', color: '#ffffff' }}
              onClick={() => setIsTabsOpen(false)}
            >
              Listo
            </button>
          </div>

          {/* Tab Cards Grid (2 Columns, Touch Friendly) */}
          <div style={styles.tabsGrid}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  style={{
                    ...styles.tabCard,
                    borderColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                    boxShadow: isActive ? '0 0 16px rgba(255, 255, 255, 0.22)' : '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setIsTabsOpen(false);
                  }}
                >
                  <div style={styles.tabCardHeader}>
                    <div style={styles.tabCardFavicon}>
                      {tab.favicon ? (
                        <img src={tab.favicon} alt="" style={{ width: 14, height: 14, borderRadius: '50%' }} />
                      ) : (
                        <Globe size={13} color="#ffffff" />
                      )}
                    </div>
                    <span style={styles.tabCardTitle}>{tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Página')}</span>
                    <button
                      style={styles.tabCardCloseBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div style={styles.tabCardPreview}>
                    <span style={styles.tabCardDomain}>
                      {getDomainFromUrl(tab.url)}
                    </span>
                    {isActive && <span style={styles.tabCardActiveTag}>Activa</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar in Tab Switcher: Close All */}
          <div style={styles.tabsModalFooter}>
            {tabs.length > 1 && (
              <button
                style={styles.closeAllBtn}
                onClick={() => {
                  if (onCloseAllTabs) {
                    onCloseAllTabs();
                  } else {
                    tabs.slice(1).forEach((t) => onCloseTab(t.id));
                  }
                }}
              >
                <Trash2 size={15} />
                <span>Cerrar otras pestañas</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Mobile Action Bottom Sheet */}
      {isMenuOpen && (
        <div style={{ ...styles.sheetBackdrop, ...(isEmbedded ? { position: 'absolute', inset: 0 } : {}) }} onClick={() => setIsMenuOpen(false)}>
          <div style={styles.sheetPanel} className="animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div style={styles.dragHandle} />

            <div style={styles.sheetHeader}>
              <span style={styles.sheetTitle}>DOZZO Mobile</span>
              <button style={styles.sheetCloseBtn} onClick={() => setIsMenuOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Grid of Mobile Actions */}
            <div style={styles.sheetActionsGrid}>

              <button
                style={styles.actionTile}
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenBinance();
                }}
              >
                <div style={styles.actionIconBox}>
                  <BrokerIcon brokerId={selectedCryptoBroker} size={20} />
                </div>
                <span style={styles.actionLabel}>Cripto Hub</span>
              </button>

              <button
                style={styles.actionTile}
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleShieldModal();
                }}
              >
                <div style={styles.actionIconBox}>
                  <Shield size={20} color="var(--accent)" />
                </div>
                <span style={styles.actionLabel}>Escudo</span>
              </button>

              <button
                style={styles.actionTile}
                onClick={() => {
                  onToggleBookmark();
                  setIsMenuOpen(false);
                }}
              >
                <div style={styles.actionIconBox}>
                  <Star size={20} fill={isBookmarked ? 'var(--accent)' : 'none'} color="var(--accent)" />
                </div>
                <span style={styles.actionLabel}>{isBookmarked ? 'Guardado' : 'Favorito'}</span>
              </button>

              <button
                style={styles.actionTile}
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenHistory();
                }}
              >
                <div style={styles.actionIconBox}>
                  <Clock size={20} color="var(--accent)" />
                </div>
                <span style={styles.actionLabel}>Historial</span>
              </button>

              <button
                style={styles.actionTile}
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenDownloads();
                }}
              >
                <div style={styles.actionIconBox}>
                  <img src="./Logo.svg" alt="Descargas" style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'contain' }} />
                </div>
                <span style={styles.actionLabel}>Descargas</span>
              </button>

              <button
                style={styles.actionTile}
                onClick={() => {
                  onToggleTheme();
                }}
              >
                <div style={styles.actionIconBox}>
                  {theme === 'dark' ? <Sun size={20} color="var(--accent)" /> : <Moon size={20} color="var(--accent)" />}
                </div>
                <span style={styles.actionLabel}>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>

              <button
                style={styles.actionTile}
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSettings();
                }}
              >
                <div style={styles.actionIconBox}>
                  <Settings size={20} color="var(--accent)" />
                </div>
                <span style={styles.actionLabel}>Ajustes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  mobileTopBar: {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    background: '#07080b',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '0 10px',
    gap: '8px',
    zIndex: 90,
    flexShrink: 0
  },
  shieldBtn: {
    position: 'relative',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    flexShrink: 0
  },
  shieldBadge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    background: '#ffffff',
    color: '#000000',
    fontSize: '9px',
    fontWeight: '800',
    padding: '1px 4px',
    borderRadius: '10px'
  },
  omnibarCapsule: {
    flex: 1,
    height: '34px',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    minWidth: 0,
    cursor: 'pointer'
  },
  capsuleContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    overflow: 'hidden'
  },
  domainText: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  urlForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%'
  },
  urlInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    width: '100%'
  },
  clearBtn: {
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    padding: '2px'
  },
  iconBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    flexShrink: 0
  },
  mobileBottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '56px',
    background: '#07080b',
    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 8px',
    zIndex: 90,
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)'
  },
  navBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    transition: 'all 0.15s ease'
  },
  newTabBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(255, 255, 255, 0.35)'
  },
  tabsBadgeBox: {
    width: '21px',
    height: '21px',
    border: '1.8px solid #ffffff',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabsBadgeText: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1
  },
  tabsModalOverlay: {
    position: 'fixed',
    inset: 0,
    background: '#07080b',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  tabsModalHeader: {
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    background: '#0c0d12'
  },
  tabsHeaderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    padding: '6px 10px',
    borderRadius: '6px'
  },
  tabsHeaderTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff'
  },
  tabsGrid: {
    flex: 1,
    padding: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
    overflowY: 'auto'
  },
  tabCard: {
    height: '140px',
    borderRadius: '14px',
    border: '1.5px solid rgba(255, 255, 255, 0.12)',
    background: '#0e1017',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  tabCardHeader: {
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    gap: '6px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.04)'
  },
  tabCardFavicon: {
    width: '14px',
    height: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  tabCardTitle: {
    flex: 1,
    fontSize: '11px',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  tabCardCloseBtn: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  tabCardPreview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.35)'
  },
  tabCardDomain: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    wordBreak: 'break-all'
  },
  tabCardActiveTag: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    background: '#ffffff',
    color: '#000000',
    textTransform: 'uppercase'
  },
  tabsModalFooter: {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
    background: '#0c0d12',
    padding: '0 16px'
  },
  closeAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ef4444',
    fontSize: '12.5px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '8px'
  },
  sheetBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'flex-end',
    backdropFilter: 'blur(4px)'
  },
  sheetPanel: {
    width: '100%',
    maxHeight: '70vh',
    background: '#0c0d12',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '12px 16px 28px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.85)'
  },
  dragHandle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255, 255, 255, 0.25)',
    margin: '0 auto 12px'
  },
  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  sheetTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '1px'
  },
  sheetCloseBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)'
  },
  sheetActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    paddingBottom: '10px'
  },
  actionTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 4px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer'
  },
  actionIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.06)'
  },
  actionLabel: {
    fontSize: '10.5px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textAlign: 'center'
  }
};
