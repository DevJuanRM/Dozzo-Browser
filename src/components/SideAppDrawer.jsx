import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCw, ExternalLink } from 'lucide-react';
import NotesPanel from './NotesPanel';

const STORAGE_WIDTH_KEY = 'dozzo_side_drawer_width';

export default function SideAppDrawer({
  app,
  isOpen,
  onClose,
  onOpenInMainTab
}) {
  const webviewRef = useRef(null);
  const [drawerWidth, setDrawerWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WIDTH_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 320 && val <= 1100) return val;
      }
    } catch (_) {}
    return 440;
  });

  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(440);
  const drawerWidthRef = useRef(drawerWidth);

  useEffect(() => {
    drawerWidthRef.current = drawerWidth;
  }, [drawerWidth]);

  // Robust drag resizing logic with pointer capture & capture-phase listeners (never gets stuck to mouse)
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      if (clientX === null) return;
      const delta = clientX - startXRef.current;
      const maxW = Math.max(340, Math.min(window.innerWidth - 80, 1100));
      const nextWidth = Math.max(300, Math.min(maxW, startWidthRef.current + delta));
      drawerWidthRef.current = nextWidth;
      setDrawerWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem(STORAGE_WIDTH_KEY, String(drawerWidthRef.current));
      } catch (_) {}
    };

    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });
    window.addEventListener('pointerup', handleMouseUp, { capture: true });
    window.addEventListener('pointercancel', handleMouseUp, { capture: true });
    window.addEventListener('blur', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove, { capture: true });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      window.removeEventListener('pointerup', handleMouseUp, { capture: true });
      window.removeEventListener('pointercancel', handleMouseUp, { capture: true });
      window.removeEventListener('blur', handleMouseUp);
    };
  }, [isResizing]);

  if (!isOpen || !app) return null;

  const handleReload = () => {
    if (webviewRef.current?.reload) {
      webviewRef.current.reload();
    }
  };

  const isNotes = app.id === 'notes';
  const webviewPreload = window.browserAPI?.getWebviewPreloadUrl?.();

  return (
    <>
      {/* Fullscreen blocker overlay when dragging so webviews NEVER steal mouse events */}
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            cursor: 'col-resize',
            userSelect: 'none',
            background: 'transparent'
          }}
          onMouseUp={() => setIsResizing(false)}
          onPointerUp={() => setIsResizing(false)}
        />
      )}

      <div
        style={{
          ...styles.drawer,
          width: `${drawerWidth}px`,
          transition: isResizing ? 'none' : 'width 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="dozzo-side-drawer animate-slide-right"
      >
        {/* Drag Resizer on the Right Edge with HTML5 Pointer Capture */}
        <div
          style={{
            ...styles.resizerHandle,
            ...(isResizing ? styles.resizerHandleActive : {})
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
            startXRef.current = e.clientX;
            startWidthRef.current = drawerWidthRef.current;
          }}
          onPointerDown={(e) => {
            try {
              e.target.setPointerCapture(e.pointerId);
            } catch (_) {}
            setIsResizing(true);
            startXRef.current = e.clientX;
            startWidthRef.current = drawerWidthRef.current;
          }}
          onPointerUp={(e) => {
            try {
              e.target.releasePointerCapture(e.pointerId);
            } catch (_) {}
            setIsResizing(false);
          }}
          title="Arrastra para ajustar el ancho de este panel"
        />

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
            {!isNotes && (
              <button
                style={styles.actionBtn}
                onClick={handleReload}
                title="Recargar panel"
              >
                <RotateCw size={13} />
              </button>
            )}

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
              title="Cerrar panel lateral"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Webview or Custom Notes Component */}
        <div style={styles.body}>
          {isNotes ? (
            <NotesPanel />
          ) : app.isCustomComponent && app.component ? (
            app.component
          ) : (
            <webview
              ref={webviewRef}
              src={app.url}
              style={{ ...styles.webview, pointerEvents: isResizing ? 'none' : 'auto' }}
              className="no-scrollbar"
              partition="persist:dozzo-browser"
              preload={webviewPreload || undefined}
              allowpopups="true"
              webpreferences="contextIsolation=no, nodeIntegration=no, plugins=yes, webSecurity=yes"
              useragent={
                window.browserAPI?.getUserAgent?.() ||
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
              }
              onDomReady={() => {
                // Hide internal page scrollbars for clean side panel view
                try {
                  webviewRef.current?.insertCSS?.(`
                    ::-webkit-scrollbar { width: 0px !important; height: 0px !important; display: none !important; }
                    body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
                  `);
                } catch (_) {}
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '54px',
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
    overflow: 'hidden'
  },
  resizerHandle: {
    position: 'absolute',
    top: 0,
    right: '-4px',
    bottom: 0,
    width: '10px',
    cursor: 'col-resize',
    zIndex: 99,
    background: 'transparent',
    touchAction: 'none',
    transition: 'background 0.15s ease'
  },
  resizerHandleActive: {
    background: '#ffffff',
    boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)'
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
    background: 'rgba(255, 255, 255, 0.06)',
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  appUrl: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.45)',
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
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  closeBtn: {
    '&:hover': {
      color: '#ffffff',
      background: 'rgba(239, 68, 68, 0.2)'
    }
  },
  body: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#090a0f'
  },
  webview: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    background: '#000000',
    overflow: 'hidden'
  }
};
