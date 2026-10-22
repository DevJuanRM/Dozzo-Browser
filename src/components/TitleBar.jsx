import React from 'react';
import { Plus, X, Minus, Square, Copy, Volume2, Globe, Shield } from 'lucide-react';

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

      {/* Left Draggable Spacer */}
      <div style={{ flex: 1, height: '100%' }} className="titlebar-drag-region" />

      {/* Centered iOS / macOS Style Dock Tabs */}
      <div style={styles.dockWrapper} className="no-drag">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const displayTitle = tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Cargando...');

          return (
            <div
              key={tab.id}
              style={{
                ...styles.dockTab,
                ...(isActive ? styles.dockTabActive : styles.dockTabCircle)
              }}
              className={`dock-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              title={displayTitle}
            >
              {/* Favicon or Loading Spinner */}
              <div style={styles.faviconBox}>
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
                  <Globe size={14} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                )}
              </div>

              {/* Smoothly expanded content for active tab */}
              {isActive && (
                <>
                  <span style={styles.tabTitle}>{displayTitle}</span>

                  {tab.isAudioPlaying && (
                    <div style={styles.audioIcon} title="Reproduciendo audio">
                      <Volume2 size={12} color="var(--accent)" />
                    </div>
                  )}

                  <button
                    style={styles.closeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    title="Cerrar pestaña"
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </div>
          );
        })}

        {/* Circular Add Tab Button */}
        <button style={styles.addTabBtn} onClick={onNewTab} title="Nueva pestaña (Ctrl+T)">
          <Plus size={15} />
        </button>
      </div>

      {/* Right Draggable Spacer */}
      <div style={{ flex: 1, height: '100%' }} className="titlebar-drag-region" />

      {/* Window Controls (Minimize, Maximize, Close) */}
      <div style={styles.windowControls} className="no-drag">
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
    gap: '6px',
    cursor: 'pointer',
    flexShrink: 0
  },
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '7px',
    background: 'var(--bg-tertiary)'
  },
  brandName: {
    fontSize: '11.5px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: 'var(--text-primary)'
  },
  dockWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-hover)',
    borderRadius: '22px',
    padding: '3px 6px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    flexShrink: 0
  },
  dockTab: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  dockTabCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)'
  },
  dockTabActive: {
    height: '36px',
    minWidth: '150px',
    maxWidth: '230px',
    padding: '0 12px',
    borderRadius: '13px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--accent)',
    boxShadow: '0 0 14px var(--accent-glow)',
    gap: '7px'
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
    width: '17px',
    height: '17px',
    borderRadius: '4px'
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
  closeBtn: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    transition: 'all 0.15s ease',
    flexShrink: 0
  },
  addTabBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    flexShrink: 0
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
