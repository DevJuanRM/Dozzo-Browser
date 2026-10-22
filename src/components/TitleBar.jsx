import React, { useState } from 'react';
import { Plus, X, Minus, Square, Copy, Volume2, Globe, Shield } from 'lucide-react';

export default function TitleBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isMaximized
}) {
  const [expandedTabId, setExpandedTabId] = useState(null);

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

      {/* Centered iOS / macOS Style Dock (Ultra Round Capsule) */}
      <div style={styles.dockWrapper} className="no-drag">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isExpanded = expandedTabId === tab.id;
          const displayTitle = tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Cargando...');

          return (
            <div
              key={tab.id}
              style={{
                ...styles.dockTab,
                ...(isExpanded
                  ? styles.dockTabActive
                  : isActive
                  ? { ...styles.dockTabCircle, ...styles.dockTabCircleActive }
                  : styles.dockTabCircle)
              }}
              className={`dock-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectTab(tab.id);
                // Clicking toggles opening/closing the tab pill name
                setExpandedTabId((prev) => (prev === tab.id ? null : tab.id));
              }}
              title={isExpanded ? 'Clic para colapsar a círculo' : displayTitle}
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
                  <Globe size={15} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                )}
              </div>

              {/* Expanded content only when clicked to reveal name */}
              {isExpanded && (
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
                      if (isExpanded) setExpandedTabId(null);
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
    background: 'rgba(24, 24, 24, 0.88)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-hover)',
    borderRadius: '9999px',
    padding: '4px 8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
    flexShrink: 0
  },
  dockTab: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.35s cubic-bezier(0.2, 0.9, 0.25, 1)'
  },
  dockTabCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)'
  },
  dockTabCircleActive: {
    border: '2px solid var(--accent)',
    boxShadow: '0 0 12px var(--accent-glow)',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  dockTabActive: {
    height: '36px',
    minWidth: '150px',
    maxWidth: '240px',
    padding: '0 12px',
    borderRadius: '9999px',
    background: 'var(--bg-secondary)',
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
  addTabBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
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
