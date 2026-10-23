import React, { useRef } from 'react';
import { X, RotateCw, ExternalLink } from 'lucide-react';

export default function SideAppDrawer({
  app,
  isOpen,
  onClose,
  onOpenInMainTab
}) {
  const webviewRef = useRef(null);

  if (!isOpen || !app) return null;

  const handleReload = () => {
    if (webviewRef.current?.reload) {
      webviewRef.current.reload();
    }
  };

  return (
    <div style={styles.drawer} className="dozzo-side-drawer animate-slide-right">
      {/* Drawer Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {app.icon && (
            <div style={{ ...styles.appIconBadge, color: app.color || 'var(--accent)' }}>
              {typeof app.icon === 'function' ? <app.icon /> : app.icon}
            </div>
          )}
          <div style={styles.titleBox}>
            <span style={styles.appName}>{app.name}</span>
            <span style={styles.appUrl}>
              {app.url ? new URL(app.url).hostname : 'Panel Lateral'}
            </span>
          </div>
        </div>

        <div style={styles.headerActions} className="no-drag">
          {/* Reload button */}
          <button
            style={styles.actionBtn}
            onClick={handleReload}
            title="Recargar panel"
          >
            <RotateCw size={13} />
          </button>

          {/* Open in main browser tab */}
          {app.url && onOpenInMainTab && (
            <button
              style={styles.actionBtn}
              onClick={() => {
                onOpenInMainTab(app.url);
                onClose();
              }}
              title="Abrir en pestaña principal grande"
            >
              <ExternalLink size={13} />
            </button>
          )}

          {/* Close drawer */}
          <button
            style={{ ...styles.actionBtn, ...styles.closeBtn }}
            onClick={onClose}
            title="Cerrar panel emergente"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Webview Content */}
      <div style={styles.body}>
        {app.isCustomComponent && app.component ? (
          app.component
        ) : (
          <webview
            ref={webviewRef}
            src={app.url}
            style={styles.webview}
            partition="persist:dozzo_sideapps"
            allowpopups="true"
            webpreferences="contextIsolation=yes, allowRunningInsecureContent=no"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '54px',
    width: '430px',
    maxWidth: 'calc(100vw - 70px)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, rgba(14, 15, 22, 0.98), rgba(9, 10, 15, 0.99))',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '12px 0 40px rgba(0, 0, 0, 0.75)',
    zIndex: 85,
    overflow: 'hidden',
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  header: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.03)',
    userSelect: 'none',
    flexShrink: 0
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0
  },
  appIconBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  titleBox: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  appName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  appUrl: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.45)',
    lineHeight: '1.1',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.65)',
    padding: '5px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  closeBtn: {
    color: 'rgba(255, 255, 255, 0.5)'
  },
  body: {
    flex: 1,
    height: 'calc(100% - 42px)',
    width: '100%',
    background: '#0c0d12',
    position: 'relative'
  },
  webview: {
    width: '100%',
    height: '100%',
    border: 'none'
  }
};
