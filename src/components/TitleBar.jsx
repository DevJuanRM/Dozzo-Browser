import React from 'react';
import { Plus, X, Minus, Square, Copy, Volume2, VolumeX, Shield, Globe } from 'lucide-react';

export default function TitleBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isMaximized
}) {
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
      {/* Brand Icon */}
      <div style={styles.brand} className="no-drag" onClick={onNewTab} title="Dozzo Browser">
        <div style={styles.brandIcon}>
          <Shield size={14} color="var(--accent)" strokeWidth={2.5} />
        </div>
        <span style={styles.brandName}>DOZZO</span>
      </div>

      {/* Tabs Container */}
      <div style={styles.tabsStrip} className="titlebar-drag-region">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : styles.tabInactive)
              }}
              className="no-drag"
              onClick={() => onSelectTab(tab.id)}
            >
              {/* Tab Favicon or Spinner */}
              <div style={styles.faviconContainer}>
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
                  <Globe size={13} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                )}
              </div>

              {/* Tab Title */}
              <span style={styles.tabTitle} title={tab.title || 'Nueva Pestaña'}>
                {tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Cargando...')}
              </span>

              {/* Audio Indicator */}
              {tab.isAudioPlaying && (
                <div style={styles.audioIcon} title="Reproduciendo audio">
                  <Volume2 size={12} color="var(--accent)" />
                </div>
              )}

              {/* Close Button */}
              <button
                style={styles.tabCloseBtn}
                className="no-drag"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                title="Cerrar pestaña"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        {/* Add Tab Button */}
        <button style={styles.addTabBtn} className="no-drag" onClick={onNewTab} title="Nueva pestaña (Ctrl+T)">
          <Plus size={15} />
        </button>

        {/* Draggable TitleBar Spacer to drag window across monitors */}
        <div style={{ flex: 1, height: '100%', minWidth: '40px' }} className="titlebar-drag-region" onDoubleClick={handleMaximize} />
      </div>

      {/* Window Controls (Minimize, Maximize, Close) */}
      <div style={styles.windowControls} className="no-drag">
        <button style={styles.winBtn} onClick={handleMinimize} title="Minimizar">
          <Minus size={13} />
        </button>
        <button style={styles.winBtn} onClick={handleMaximize} title="Maximizar / Restaurar">
          {isMaximized ? <Copy size={11} /> : <Square size={11} />}
        </button>
        <button
          style={{ ...styles.winBtn, ...styles.closeBtn }}
          onClick={handleClose}
          title="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  titlebar: {
    height: 'var(--titlebar-height)',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
    paddingLeft: '10px',
    userSelect: 'none',
    zIndex: 50
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingRight: '12px',
    cursor: 'pointer'
  },
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)'
  },
  brandName: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: 'var(--text-primary)'
  },
  tabsStrip: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflowX: 'auto',
    overflowY: 'hidden',
    height: '100%',
    paddingTop: '6px'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    minWidth: '120px',
    maxWidth: '220px',
    flex: '0 1 180px',
    padding: '0 8px',
    borderRadius: '8px 8px 0 0',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.15s ease'
  },
  tabActive: {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    borderTop: '2px solid var(--accent)',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.2)'
  },
  tabInactive: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    borderTop: '2px solid transparent'
  },
  faviconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    marginRight: '6px',
    flexShrink: 0
  },
  favicon: {
    width: '14px',
    height: '14px',
    borderRadius: '2px'
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginRight: '4px'
  },
  audioIcon: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '4px'
  },
  tabCloseBtn: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    opacity: 0.6,
    transition: 'all 0.1s ease',
    flexShrink: 0
  },
  addTabBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    margin: '0 4px',
    flexShrink: 0,
    background: 'transparent'
  },
  windowControls: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    marginLeft: 'auto'
  },
  winBtn: {
    width: '42px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    transition: 'background 0.15s ease'
  },
  closeBtn: {
    color: 'var(--text-secondary)'
  }
};
