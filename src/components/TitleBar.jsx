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
  Home,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

function DozzoBrandLogo() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleClick = (e) => {
    e.stopPropagation();
    setAnimKey((prev) => prev + 1);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (!isAnimating) return;
    // Slow, smooth luxury stroke animation lasts ~3.6s, then gently collapses back to default logo
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 3800);

    return () => clearTimeout(timer);
  }, [isAnimating, animKey]);

  return (
    <div
      style={styles.brand}
      className={`no-drag dozzo-brand-container ${isAnimating ? 'expanded' : 'compact'}`}
      title={isAnimating ? 'DOZZO' : 'Dozzo - Clic para ver firma'}
      onClick={handleClick}
    >
      {/* Default Brand Icon: Always visible with smooth luxury gold hover glow */}
      <div style={styles.brandIconWrapper}>
        <img
          src="./Logo.svg"
          alt="Dozzo"
          style={styles.brandLogoImg}
          className="dozzo-brand-icon"
        />
      </div>

      {/* Handwritten "dozzo" SVG: Only appears and animates when clicked */}
      <div
        className={`dozzo-calligraphy-wrapper ${isAnimating ? 'animating' : 'hidden'}`}
        style={{
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          maxWidth: isAnimating ? '140px' : '0px',
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'max-width 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, transform 0.35s ease',
          pointerEvents: isAnimating ? 'auto' : 'none'
        }}
      >
        <svg
          key={animKey}
          viewBox="0 0 138 25"
          width="130"
          height="24"
          className="dozzo-calligraphy-svg"
          style={{ flexShrink: 0, marginLeft: '6px' }}
        >
          <defs>
            <linearGradient id="dozzoGoldInk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFF4A3" />
              <stop offset="25%" stopColor="#F0B90B" />
              <stop offset="65%" stopColor="#FFD700" />
              <stop offset="88%" stopColor="#E09000" />
              <stop offset="100%" stopColor="#FFF8C4" />
            </linearGradient>
            <filter id="dozzoGoldLuster" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="rgba(240, 185, 11, 0.45)" />
            </filter>
          </defs>

          <g className={`dozzo-handwriting-group ${isAnimating ? 'dozzo-is-drawing' : 'dozzo-is-static'}`} filter="url(#dozzoGoldLuster)">
            {/* Cursive D - Slender stem & wide oval loop */}
            <path
              className="callig-stroke callig-d1"
              d="M 11 5 C 8.5 8, 6.5 13, 6.5 17 C 6.5 19.5, 8.5 20.5, 10.5 19.8 C 12 19.2, 11.5 17.5, 9.5 17 C 8 16.5, 6.5 18, 7.5 19.8 C 8.5 21, 11.5 21.2, 15.5 20.5 C 24 19, 31 15, 31 10 C 31 6, 26 3.5, 19 3.5 C 13.5 3.5, 9 6.5, 9 8.5"
            />
            <path
              className="callig-stroke callig-d2"
              d="M 11.5 19.5 C 18 19.5, 27 17.5, 36 14.5"
            />

            {/* Lowercase o */}
            <path
              className="callig-stroke callig-o1"
              d="M 37 14 C 35 11.5, 38 9.5, 41.5 9.5 C 45 9.5, 47 12, 47 14.5 C 47 17.5, 44 19.5, 40.5 19.5 C 37 19.5, 35 17, 37 14 C 39 11.5, 43 11, 47 12"
            />

            {/* First z with cursive lower loop */}
            <path
              className="callig-stroke callig-z1"
              d="M 47 12 C 50 11.5, 54 11.5, 56 12.2 C 55 13.8, 52.5 15.5, 50.5 16.8 C 54 16.5, 57.5 16.2, 57.5 18.2 C 57.5 20.5, 54.5 23.5, 52.5 23.5 C 51 23.5, 51.5 21.5, 53.5 19.8 C 55.5 18.2, 58 16.8, 61 14.2"
            />

            {/* Second z with cursive lower loop */}
            <path
              className="callig-stroke callig-z2"
              d="M 61 14.2 C 64 11.5, 68 11.5, 70 12.2 C 69 13.8, 66.5 15.5, 64.5 16.8 C 68 16.5, 71.5 16.2, 71.5 18.2 C 71.5 20.5, 68.5 23.5, 66.5 23.5 C 65 23.5, 65.5 21.5, 67.5 19.8 C 69.5 18.2, 72 16.8, 75 14.2"
            />

            {/* Final o */}
            <path
              className="callig-stroke callig-o2"
              d="M 75 14 C 73 11.5, 76 9.5, 79.5 9.5 C 83 9.5, 85 12, 85 14.5 C 85 17.5, 82 19.5, 78.5 19.5 C 75 19.5, 73 17, 75 14 C 77 11.5, 81 11, 85 12"
            />

            {/* Cursive finishing tail flourish */}
            <path
              className="callig-stroke callig-tail"
              d="M 85 12 C 92 13.5, 102 15.5, 114 15 C 122 14.5, 128 13, 134 11.5"
            />

            {/* Luminous Fountain Pen Nib Sparkle Particle (only when drawing) */}
            {isAnimating && <circle r="1.8" fill="#FFF8C4" className="pen-nib-dot-slow" />}
          </g>
        </svg>
      </div>
    </div>
  );
}

function TabCircleItem({
  tab,
  isActive,
  isExpanded,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onClose,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) {
  const fullTitle = tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Cargando...');

  return (
    <div
      className={`high-gloss-tab-item ${isExpanded ? 'expanded' : ''} ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      title={isExpanded ? '' : fullTitle}
    >
      {/* Pinned Favicon (Strictly centered inside the 34px icon box with zero pixel shift) */}
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

      {/* Instantly rendered title & close action with smooth, slow hardware-accelerated CSS */}
      <div className="tab-expanding-content">
        <span style={styles.tabTitle}>{fullTitle}</span>

        {tab.isAudioPlaying && (
          <div style={styles.audioIcon} title="Reproduciendo audio">
            <Volume2 size={12} color="var(--accent)" />
          </div>
        )}

        <button
          style={styles.tabActionBtn}
          onClick={(e) => {
            e.stopPropagation();
            if (window.browserAPI?.openNewWindow) {
              window.browserAPI.openNewWindow({ url: tab.url || '' });
              onClose();
            }
          }}
          title="Mover pestaña a otra pantalla / ventana independiente"
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
  showBookmarksBar,
  onReorderTabs,
  isHomeActive = false,
  isBookmarked = false,
  onToggleBookmark
}) {
  const [hoveredTabId, setHoveredTabId] = useState(null);
  const [draggedTabId, setDraggedTabId] = useState(null);
  const [showSplitMenu, setShowSplitMenu] = useState(false);

  const handleDragStart = (e, tabId) => {
    setDraggedTabId(tabId);
    setHoveredTabId(null);
    e.dataTransfer.setData('text/plain', tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetTabId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedTabId || draggedTabId === targetTabId) return;

    if (onReorderTabs) {
      const srcIdx = tabs.findIndex((t) => t.id === draggedTabId);
      const targetIdx = tabs.findIndex((t) => t.id === targetTabId);
      if (srcIdx !== -1 && targetIdx !== -1 && srcIdx !== targetIdx) {
        const nextTabs = [...tabs];
        const [moved] = nextTabs.splice(srcIdx, 1);
        nextTabs.splice(targetIdx, 0, moved);
        onReorderTabs(nextTabs);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedTabId(null);
  };

  const handleDragEnd = (e) => {
    if (draggedTabId && e && typeof e.screenX === 'number') {
      const isOutside =
        e.screenX < window.screenX - 30 ||
        e.screenX > window.screenX + window.outerWidth + 30 ||
        e.screenY < window.screenY - 30 ||
        e.screenY > window.screenY + window.outerHeight + 30;

      if (isOutside) {
        const draggedTab = tabs.find((t) => t.id === draggedTabId);
        if (draggedTab && window.browserAPI?.openNewWindow) {
          window.browserAPI.openNewWindow({
            url: draggedTab.url || '',
            screenX: e.screenX,
            screenY: e.screenY
          });
          if (tabs.length > 1) {
            onCloseTab(draggedTabId);
          }
        }
      }
    }
    setDraggedTabId(null);
  };

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
      {/* Brand: Luxury Dozzo Logo (Static by default, smooth slow handwriting on click) */}
      <div className="no-drag">
        <DozzoBrandLogo />
      </div>

      {/* Left Draggable Spacer between Brand and Dock */}
      <div
        style={{ flex: 1, height: '100%', minWidth: '16px' }}
        className="titlebar-drag-region"
      />

      {/* Mac Dock-Style Centered Circles (Home, Star, divider, tab circles, add button) */}
      <div
        style={styles.floatingTabsContainer}
        className="no-drag floating-tabs-dock"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Pinned Quick Circles (Mac Menu / Dock Style): Home & Favoritos */}
        <div style={styles.pinnedDockGroup}>
          <button
            className={`high-gloss-circle ${isHomeActive ? 'active-home' : ''}`}
            onClick={onGoHome}
            title="Página de inicio (Speed Dial)"
            style={{ width: '36px', height: '36px' }}
          >
            <Home size={15} fill={isHomeActive ? 'currentColor' : 'none'} />
          </button>

          <button
            className={`high-gloss-circle ${showBookmarksBar ? 'active-star' : ''}`}
            onClick={onToggleBookmarksBar}
            title={showBookmarksBar ? 'Ocultar barra de favoritos' : 'Mostrar barra de favoritos'}
            style={{ width: '36px', height: '36px' }}
          >
            <Star
              size={15}
              fill={showBookmarksBar ? '#F59E0B' : 'none'}
              color={showBookmarksBar ? '#F59E0B' : 'currentColor'}
            />
          </button>
        </div>

        <div style={styles.dockSeparator} />

        {/* Dynamic Tab Circles with Chrome-style drag-and-drop & hover expansion */}
        {tabs.map((tab) => {
          // If viewing Home, tab circle ring turns OFF
          const isActive = !isHomeActive && tab.id === activeTabId;
          const isExpanded = !draggedTabId && hoveredTabId === tab.id;
          const isDragging = draggedTabId === tab.id;


          return (
            <TabCircleItem
              key={tab.id}
              tab={tab}
              isActive={isActive}
              isExpanded={isExpanded}
              onSelect={() => onSelectTab(tab.id)}
              onMouseEnter={() => !draggedTabId && setHoveredTabId(tab.id)}
              onMouseLeave={() => setHoveredTabId((prev) => (prev === tab.id ? null : prev))}
              onClose={() => {
                onCloseTab(tab.id);
                if (hoveredTabId === tab.id) setHoveredTabId(null);
              }}
              isDragging={isDragging}
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          );
        })}

        {/* Circular Add Tab Button in Minimalist Dark Circle */}
        <button
          className="high-gloss-circle"
          onClick={onNewTab}
          title="Nueva pestaña (Ctrl+T)"
          style={{ width: '36px', height: '36px' }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Right Draggable Spacer between Dock and Controls */}
      <div
        style={{ flex: 1, height: '100%', minWidth: '16px' }}
        className="titlebar-drag-region"
      />

      {/* Split Layout Switcher (Max 4 Views) */}
      {onChangeSplitMode && (
        <div style={styles.splitControls} className="no-drag">
          <button
            style={{
              ...styles.splitBtn,
              color: splitMode !== 'single' ? 'var(--accent)' : 'var(--text-secondary)',
              background: splitMode !== 'single' ? 'var(--accent-glow)' : 'transparent'
            }}
            onClick={() => setShowSplitMenu(!showSplitMenu)}
            title="Vistas y Pantalla Dividida (Hasta 4 pestañas simultáneas)"
          >
            <LayoutGrid size={15} />
            {splitMode !== 'single' && (
              <span style={styles.splitBadge}>{splitMode.replace('split-', '')}</span>
            )}
          </button>

          {showSplitMenu && (
            <div style={styles.splitPopover} className="glass-panel animate-slide-down">
              <div style={styles.splitPopoverHeader}>Vistas Divididas (Máx. 4)</div>
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
                  <span>2 Columnas</span>
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
                    <div style={{ width: '54%', height: '100%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '42%', height: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                    <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                    <div style={{ width: '46%', height: '46%', background: 'currentColor', borderRadius: '2px' }} />
                  </div>
                  <span>4 Cuadrícula</span>
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
    background: 'transparent',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '0 12px',
    userSelect: 'none',
    zIndex: 50,
    position: 'relative'
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: '6px',
    padding: 0,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    userSelect: 'none'
  },
  brandIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    flexShrink: 0
  },
  brandLogoImg: {
    width: '26px',
    height: '26px',
    objectFit: 'contain',
    display: 'block',
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease',
    filter: 'drop-shadow(0 0 6px rgba(240, 185, 11, 0.4))'
  },
  floatingTabsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: 'calc(100vw - 320px)',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    zIndex: 10,
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
    borderRadius: '4px',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
    pointerEvents: 'none'
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
    top: '38px',
    right: 0,
    width: '270px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-hover)',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75)',
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
    gridTemplateColumns: 'repeat(2, 1fr)',
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
