import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Minus,
  Square,
  Copy,
  Volume2,
  Globe,
  LayoutGrid,
  ExternalLink,
  Home,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function TypewriterLogo() {
  const fullText = 'DOZZO';
  const [displayedText, setDisplayedText] = useState(fullText);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let typeInterval = null;
    let cycleInterval = null;

    const startTyping = () => {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;

      typeInterval = setInterval(() => {
        index++;
        setDisplayedText(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 95);
    };

    // Repeats typewriter effect smoothly every 10 seconds
    cycleInterval = setInterval(() => {
      startTyping();
    }, 10000);

    return () => {
      if (typeInterval) clearInterval(typeInterval);
      if (cycleInterval) clearInterval(cycleInterval);
    };
  }, []);

  return (
    <div style={styles.brand} className="no-drag" title="Dozzo Browser">
      <span style={styles.brandName}>
        {displayedText}
        {isTyping && <span className="typewriter-cursor">|</span>}
      </span>
    </div>
  );
}

function TabCircleItem({
  tab,
  isActive,
  isExpanded,
  onSelect,
  onToggleExpand,
  onClose,
  onPopOut
}) {
  const fullTitle = tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Cargando...');
  const [typedTitle, setTypedTitle] = useState(isExpanded ? fullTitle : '');

  // Silky smooth typewriter animation when opening tab pill towards the right
  useEffect(() => {
    if (!isExpanded) {
      setTypedTitle('');
      return;
    }
    setTypedTitle('');
    let i = 0;
    const len = fullTitle.length;
    const timer = setInterval(() => {
      i++;
      setTypedTitle(fullTitle.slice(0, i));
      if (i >= len) {
        clearInterval(timer);
      }
    }, 22);
    return () => clearInterval(timer);
  }, [isExpanded, fullTitle]);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', tab.url || '');
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={(e) => {
        const isOutside =
          e.screenX < window.screenX - 25 ||
          e.screenX > window.screenX + window.outerWidth + 25 ||
          e.screenY < window.screenY - 25 ||
          e.screenY > window.screenY + window.outerHeight + 25;

        if (isOutside && window.browserAPI?.openNewWindow) {
          window.browserAPI.openNewWindow({ url: tab.url });
          onClose();
        }
      }}
      className={`high-gloss-tab-item ${isExpanded ? 'expanded' : ''} ${isActive ? 'active' : ''}`}
      onClick={() => {
        onSelect();
        onToggleExpand();
      }}
      title={isExpanded ? 'Clic para colapsar a círculo' : `${fullTitle} (Arrastra fuera para mover a otra pantalla)`}
    >
      {/* Pinned Favicon (Anchored on the left at 0px, NEVER shifts or moves) */}
      <div className="tab-pinned-icon">
        {tab.isLoading ? (
          <div style={styles.spinner} />
        ) : tab.favicon ? (
          <img
            src={tab.favicon}
            alt=""
            style={styles.favicon}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <Globe size={15} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
        )}
      </div>

      {/* Smoothly expanding title & actions towards the right */}
      <div className="tab-expanding-content">
        <span style={styles.tabTitle}>
          {typedTitle}
          {isExpanded && typedTitle.length < fullTitle.length && (
            <span className="typewriter-cursor">|</span>
          )}
        </span>

        {tab.isAudioPlaying && (
          <div style={styles.audioIcon} title="Reproduciendo audio">
            <Volume2 size={12} color="var(--accent)" />
          </div>
        )}

        <button
          style={styles.tabActionBtn}
          onClick={(e) => {
            e.stopPropagation();
            onPopOut();
          }}
          title="Mover a otra pantalla / Nueva ventana"
        >
          <ExternalLink size={11} />
        </button>

        <button
          style={styles.closeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Cerrar pestaña"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

export default function TitleBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isMaximized,
  splitMode = 'single',
  onChangeSplitMode,
  onToggleAutoHide,
  isAutoHidden,
  onGoHome,
  onToggleBookmarksBar,
  showBookmarksBar
}) {
  const [expandedTabId, setExpandedTabId] = useState(null);
  const [showSplitMenu, setShowSplitMenu] = useState(false);

  const handleMinimize = () => {
    if (window.browserAPI?.minimize) window.browserAPI.minimize();
  };

  const handleMaximize = () => {
    if (window.browserAPI?.maximize) window.browserAPI.maximize();
  };

  const handleClose = () => {
    if (window.browserAPI?.close) window.browserAPI.close();
  };

  return (
    <div style={styles.titlebar} className="titlebar-drag-region" onDoubleClick={handleMaximize}>
      {/* Brand: Pure text DOZZO with 10s Typewriter animation (no shield icon) */}
      <TypewriterLogo />

      <div style={styles.dockSeparator} />

      {/* Mac Dock-Style Circles (Home, Star, divider, tab circles, add button) */}
      <div style={styles.floatingTabsContainer} className="no-drag">
        {/* Pinned Quick Circles (Mac Menu / Dock Style): Home & Favoritos */}
        <div style={styles.pinnedDockGroup}>
          <button
            className="high-gloss-circle"
            onClick={onGoHome}
            title="Página de inicio (Speed Dial)"
            style={{ width: '38px', height: '38px' }}
          >
            <Home size={15} />
          </button>

          <button
            className={`high-gloss-circle ${showBookmarksBar ? 'active' : ''}`}
            onClick={onToggleBookmarksBar}
            title={showBookmarksBar ? 'Ocultar barra de marcadores/favoritos' : 'Mostrar barra de marcadores/favoritos'}
            style={{ width: '38px', height: '38px' }}
          >
            <Star size={15} fill={showBookmarksBar ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div style={styles.dockSeparator} />

        {/* Dynamic Tab Circles */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isExpanded = expandedTabId === tab.id;

          return (
            <TabCircleItem
              key={tab.id}
              tab={tab}
              isActive={isActive}
              isExpanded={isExpanded}
              onSelect={() => onSelectTab(tab.id)}
              onToggleExpand={() => setExpandedTabId((prev) => (prev === tab.id ? null : tab.id))}
              onClose={() => {
                onCloseTab(tab.id);
                if (isExpanded) setExpandedTabId(null);
              }}
              onPopOut={() => {
                if (window.browserAPI?.openNewWindow) {
                  window.browserAPI.openNewWindow({ url: tab.url });
                  if (tabs.length > 1) onCloseTab(tab.id);
                }
              }}
            />
          );
        })}

        {/* Circular Add Tab Button in High Gloss Glass */}
        <button
          className="high-gloss-circle"
          onClick={onNewTab}
          title="Nueva pestaña (Ctrl+T)"
          style={{ width: '38px', height: '38px' }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Large Draggable Region spanning the rest of the titlebar towards the right */}
      <div style={{ flex: 1, height: '100%' }} className="titlebar-drag-region" />

      {/* Split Layout Switcher (1 to 5 Views) */}
      {onChangeSplitMode && (
        <div style={styles.splitControls} className="no-drag">
          <button
            style={{
              ...styles.splitBtn,
              color: splitMode !== 'single' ? 'var(--accent)' : 'var(--text-secondary)',
              background: splitMode !== 'single' ? 'var(--accent-glow)' : 'transparent'
            }}
            onClick={() => setShowSplitMenu(!showSplitMenu)}
            title="Vistas y Pantalla Dividida (1 a 5 pestañas simultáneas)"
          >
            <LayoutGrid size={15} />
            {splitMode !== 'single' && (
              <span style={styles.splitBadge}>{splitMode.replace('split-', '')}</span>
            )}
          </button>

          {showSplitMenu && (
            <div style={styles.splitPopover} className="glass-panel animate-slide-down">
              <div style={styles.splitPopoverHeader}>Vistas Divididas (1 a 5)</div>
              <div style={styles.splitOptionsGrid}>
                <button
                  style={{ ...styles.splitOption, ...(splitMode === 'single' ? styles.splitOptionActive : {}) }}
                  onClick={() => { onChangeSplitMode('single'); setShowSplitMenu(false); }}
                  title="1 Pestaña Sola (Pantalla Completa)"
                >
                  <div style={styles.splitPreviewBox}>
                    <div style={{ width: '100%', height: '100%', background: 'currentColor', borderRadius: '2px' }} />
                  </div>
                  <span>1 Sola</span>
                </button>

                <button
                  style={{ ...styles.splitOption, ...(splitMode === '2-col' ? styles.splitOptionActive : {}) }}
                  onClick={() => { onChangeSplitMode('2-col'); setShowSplitMenu(false); }}
                  title="2 Pestañas en Columnas (Vertical)"
                >
                  <div style={styles.splitPreviewBox}>
                    <div style={{ width: '48%', height: '100%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '48%', height: '100%', background: 'currentColor', borderRadius: '2px' }} />
                  </div>
                  <span>2 Col</span>
                </button>

                <button
                  style={{ ...styles.splitOption, ...(splitMode === '2-row' ? styles.splitOptionActive : {}) }}
                  onClick={() => { onChangeSplitMode('2-row'); setShowSplitMenu(false); }}
                  title="2 Pestañas Arriba y Abajo (Horizontal)"
                >
                  <div style={{ ...styles.splitPreviewBox, flexDirection: 'column' }}>
                    <div style={{ width: '100%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '100%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                  </div>
                  <span>2 Filas</span>
                </button>

                <button
                  style={{ ...styles.splitOption, ...(splitMode === '3-grid' ? styles.splitOptionActive : {}) }}
                  onClick={() => { onChangeSplitMode('3-grid'); setShowSplitMenu(false); }}
                  title="3 Vistas (1 Principal + 2 Laterales)"
                >
                  <div style={styles.splitPreviewBox}>
                    <div style={{ width: '56%', height: '100%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '40%', height: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ width: '100%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                      <div style={{ width: '100%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <span>3 Vistas</span>
                </button>

                <button
                  style={{ ...styles.splitOption, ...(splitMode === '4-grid' ? styles.splitOptionActive : {}) }}
                  onClick={() => { onChangeSplitMode('4-grid'); setShowSplitMenu(false); }}
                  title="4 Pestañas en Cuadrícula 2x2"
                >
                  <div style={{ ...styles.splitPreviewBox, flexWrap: 'wrap', gap: '2px' }}>
                    <div style={{ width: '47%', height: '47%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '47%', height: '47%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '47%', height: '47%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '47%', height: '47%', background: 'currentColor', borderRadius: '2px' }} />
                  </div>
                  <span>4 Grid</span>
                </button>

                <button
                  style={{ ...styles.splitOption, ...(splitMode === '5-grid' ? styles.splitOptionActive : {}) }}
                  onClick={() => { onChangeSplitMode('5-grid'); setShowSplitMenu(false); }}
                  title="5 Vistas Simultáneas (1 Destacada + 4 Mosaico)"
                >
                  <div style={{ ...styles.splitPreviewBox, gap: '2px' }}>
                    <div style={{ width: '44%', height: '100%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '54%', height: '100%', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                      <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                      <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                      <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                      <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <span>5 Vistas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Window Controls (Auto-hide Toggle, Minimize, Maximize, Close) */}
      <div style={styles.windowControls} className="no-drag">
        {onToggleAutoHide && (
          <button
            style={{
              ...styles.winBtn,
              color: isAutoHidden ? 'var(--accent)' : 'var(--text-secondary)'
            }}
            onClick={onToggleAutoHide}
            title={
              isAutoHidden
                ? 'Fijar barra superior permanentemente'
                : 'Ocultar barra automáticamente (al pasar el mouse)'
            }
          >
            {isAutoHidden ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        )}
        <button style={styles.winBtn} onClick={handleMinimize} title="Minimizar">
          <Minus size={13} />
        </button>
        <button style={styles.winBtn} onClick={handleMaximize} title="Maximizar / Restaurar">
          {isMaximized ? <Copy size={11} /> : <Square size={11} />}
        </button>
        <button style={{ ...styles.winBtn, ...styles.winCloseBtn }} onClick={handleClose} title="Cerrar">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  titlebar: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
    padding: '0 12px',
    userSelect: 'none',
    zIndex: 50,
    position: 'relative'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexShrink: 0
  },
  brandName: {
    fontSize: '12px',
    fontWeight: '900',
    letterSpacing: '2px',
    color: 'var(--text-primary)',
    textTransform: 'uppercase'
  },
  floatingTabsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  },
  pinnedDockGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dockSeparator: {
    width: '1px',
    height: '22px',
    background: 'rgba(255, 255, 255, 0.15)',
    margin: '0 4px',
    flexShrink: 0
  },
  faviconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    flexShrink: 0
  },
  favicon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%'
  },
  spinner: {
    width: '12px',
    height: '12px',
    border: '2px solid var(--border-subtle)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  tabTitle: {
    flex: 1,
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  audioIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  },
  tabActionBtn: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    transition: 'all 0.15s ease',
    flexShrink: 0
  },
  closeBtn: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    transition: 'all 0.15s ease',
    flexShrink: 0
  },
  splitControls: {
    position: 'relative',
    marginRight: '6px'
  },
  splitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    transition: 'all 0.15s ease'
  },
  splitBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--accent)'
  },
  splitPopover: {
    position: 'absolute',
    top: '36px',
    right: 0,
    width: '240px',
    background: 'rgba(18, 18, 18, 0.95)',
    border: '1px solid var(--border-hover)',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
    zIndex: 100
  },
  splitPopoverHeader: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '10px'
  },
  splitOptionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  splitOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 4px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  splitOptionActive: {
    background: 'var(--accent-glow)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)'
  },
  splitPreviewBox: {
    width: '32px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '2px',
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  windowControls: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    marginLeft: 'auto',
    flexShrink: 0
  },
  winBtn: {
    width: '38px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    transition: 'background 0.15s ease'
  },
  winCloseBtn: {
    color: 'var(--text-secondary)'
  }
};
