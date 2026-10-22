import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, X, Plus, Globe } from 'lucide-react';
import NewTabPage from './NewTabPage';

const getSplitCount = (mode) => {
  switch (mode) {
    case '2-col':
    case '2-row':
      return 2;
    case '3-grid':
      return 3;
    case '4-grid':
      return 4;
    default:
      return 1;
  }
};

const getGridContainerStyle = (mode, splitRatio = 50) => {
  switch (mode) {
    case '2-col':
      return {
        display: 'grid',
        gridTemplateColumns: `${splitRatio}% calc(${100 - splitRatio}% - 6px)`,
        gap: '6px',
        padding: '6px',
        height: '100%',
        width: '100%'
      };
    case '2-row':
      return {
        display: 'grid',
        gridTemplateRows: `${splitRatio}% calc(${100 - splitRatio}% - 6px)`,
        gap: '6px',
        padding: '6px',
        height: '100%',
        width: '100%'
      };
    case '3-grid':
      return {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        padding: '6px',
        height: '100%',
        width: '100%'
      };
    case '4-grid':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        padding: '6px',
        height: '100%',
        width: '100%'
      };
    default:
      return {
        display: 'flex',
        flexDirection: 'column'
      };
  }
};

const getPaneAreaStyle = (mode, index) => {
  if (mode === '3-grid' && index === 0) {
    return { gridRow: '1 / 3' };
  }
  return {};
};

export default function WebviewContainer({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onUpdateTab,
  onNewTabWithUrl,
  onNavigate,
  searchEngine,
  onChangeSearchEngine,
  blockedCount,
  onOpenBinance,
  webviewRefs,
  isInspectorActive,
  onElementInspected,
  onScrollDirection,
  splitMode = 'single',
  onChangeSplitMode,
  isMobile = false,
  responsiveMode = null,
  isDevInspectorOpen = false,
  devDrawerWidth = 480,
  isAutoHidden = false,
  isHoveringTop = false,
  onDismissTopBar
}) {
  const isSplit = !isMobile && splitMode !== 'single';
  const paneCount = getSplitCount(splitMode);
  const isResponsiveActive = Boolean(!isSplit && !isMobile && responsiveMode?.enabled);

  // Dynamic split ratio for 2-column or 2-row views (stretching / resizing)
  const [splitRatio, setSplitRatio] = useState(50);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const visibleTabs = tabs.slice(0, paneCount);
  const emptySlotsCount = isSplit ? Math.max(0, paneCount - visibleTabs.length) : 0;

  return (
    <div
      style={{
        ...styles.container,
        ...(isMobile ? { paddingBottom: '56px' } : {}),
        ...(isSplit ? getGridContainerStyle(splitMode, splitRatio) : {}),
        marginRight: !isMobile && isDevInspectorOpen ? `${devDrawerWidth || 480}px` : 0,
        transition: 'margin-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseDown={() => {
        if (isAutoHidden && isHoveringTop && onDismissTopBar) {
          onDismissTopBar();
        }
      }}
    >
      {/* Persistent Webviews Tree: Every tab stays continuously mounted so video playback NEVER resets */}
      {tabs.map((tab, idx) => {
        const isCurrentActive = tab.id === activeTabId;
        const isVisibleInSplit = isSplit && idx < paneCount;

        // Determine persistent slot styles without destroying DOM elements
        let slotStyle = {};
        if (isSplit) {
          if (isVisibleInSplit) {
            slotStyle = {
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: isCurrentActive ? '2px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: isCurrentActive ? '0 0 16px var(--accent-glow)' : '0 4px 16px rgba(0, 0, 0, 0.4)',
              ...getPaneAreaStyle(splitMode, idx)
            };
          } else {
            slotStyle = {
              position: 'absolute',
              top: -99999,
              left: -99999,
              width: '100%',
              height: '100%',
              visibility: 'hidden',
              pointerEvents: 'none'
            };
          }
        } else {
          if (isCurrentActive) {
            if (isResponsiveActive) {
              slotStyle = {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#07080d radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
                backgroundSize: '20px 20px',
                overflow: 'auto',
                padding: '24px',
                zIndex: 1,
                visibility: 'visible',
                pointerEvents: 'auto'
              };
            } else {
              slotStyle = {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1,
                visibility: 'visible',
                pointerEvents: 'auto'
              };
            }
          } else {
            slotStyle = {
              position: 'absolute',
              top: -99999,
              left: -99999,
              width: '100%',
              height: '100%',
              visibility: 'hidden',
              pointerEvents: 'none'
            };
          }
        }

        return (
          <div
            key={tab.id}
            style={slotStyle}
            onClick={() => isSplit && onSelectTab && onSelectTab(tab.id)}
          >
            {/* Split Pane Header (only in split view for visible panels) */}
            {isSplit && isVisibleInSplit && (
              <div style={styles.paneHeader}>
                <div style={styles.paneFaviconBox}>
                  {tab.favicon ? (
                    <img src={tab.favicon} alt="" style={{ width: 14, height: 14, borderRadius: '50%' }} />
                  ) : (
                    <Globe size={13} color="var(--accent)" />
                  )}
                </div>
                <span style={styles.paneTitle}>{tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Cargando...')}</span>

                <div style={styles.paneActions}>
                  {/* Dynamic Resize Buttons for 2-column view */}
                  {splitMode === '2-col' && (
                    <div style={styles.ratioGroup}>
                      <button
                        style={{ ...styles.ratioBtn, ...(splitRatio === 70 && idx === 0 ? styles.ratioBtnActive : {}) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSplitRatio(idx === 0 ? 70 : 30);
                        }}
                        title={idx === 0 ? 'Agrandar panel izquierdo (70%)' : 'Agrandar panel derecho (70%)'}
                      >
                        {idx === 0 ? '70%' : '30%'}
                      </button>
                      <button
                        style={{ ...styles.ratioBtn, ...(splitRatio === 50 ? styles.ratioBtnActive : {}) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSplitRatio(50);
                        }}
                        title="Restablecer a 50% / 50%"
                      >
                        50%
                      </button>
                    </div>
                  )}

                  <button
                    style={styles.paneActionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onChangeSplitMode) onChangeSplitMode('single');
                      if (onSelectTab) onSelectTab(tab.id);
                    }}
                    title="Maximizar este panel a pantalla completa"
                  >
                    <Maximize2 size={12} />
                  </button>
                  {tabs.length > 1 && (
                    <button
                      style={styles.paneActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onCloseTab) onCloseTab(tab.id);
                      }}
                      title="Cerrar pestaña de este panel"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Split body or full body / Responsive Device Frame */}
            <div
              style={
                isResponsiveActive && isCurrentActive
                  ? {
                    width: `${responsiveMode?.width || 393}px`,
                    height: `${responsiveMode?.height || 852}px`,
                    minWidth: `${responsiveMode?.width || 393}px`,
                    minHeight: `${responsiveMode?.height || 852}px`,
                    maxWidth: `${responsiveMode?.width || 393}px`,
                    maxHeight: `${responsiveMode?.height || 852}px`,
                    transform: responsiveMode?.scale && responsiveMode.scale !== 1 ? `scale(${responsiveMode.scale})` : 'none',
                    transformOrigin: 'center center',
                    borderRadius: responsiveMode?.showFrame ? '38px' : '8px',
                    border: responsiveMode?.showFrame ? '12px solid #1c1d27' : '1px solid rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#000000',
                    transition: 'all 0.2s ease'
                  }
                  : {
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }
              }
            >
              {/* Dynamic Island on physical phone frame */}
              {isResponsiveActive && isCurrentActive && responsiveMode?.showFrame && !responsiveMode?.isRotated && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '88px',
                    height: '22px',
                    borderRadius: '14px',
                    background: '#000000',
                    zIndex: 99,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 7px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#111' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0a192f', border: '1px solid #1e293b' }} />
                </div>
              )}
              {/* If tab is in New Tab state, show NewTabPage speed dial directly over webview */}
              {tab.isNewTab && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'var(--bg-primary)' }}>
                  <NewTabPage
                    onNavigate={(url) => {
                      if (onNavigate) {
                        onNavigate(url);
                      } else if (onUpdateTab) {
                        onUpdateTab(tab.id, { url, isNewTab: false, isLoading: true });
                      }
                    }}
                    searchEngine={searchEngine}
                    onChangeSearchEngine={onChangeSearchEngine}
                    blockedCount={blockedCount}
                    onOpenBinance={onOpenBinance}
                    isAutoHidden={isAutoHidden}
                    isInspectorActive={isInspectorActive && isCurrentActive}
                    onElementInspected={onElementInspected}
                  />
                </div>
              )}

              <WebviewItem
                tab={tab}
                isActive={isSplit ? isVisibleInSplit : isCurrentActive}
                isSplit={isSplit}
                onUpdateTab={onUpdateTab}
                onNewTabWithUrl={onNewTabWithUrl}
                webviewRefs={webviewRefs}
                isInspectorActive={isInspectorActive}
                onElementInspected={onElementInspected}
                onScrollDirection={onScrollDirection}
              />
            </div>
          </div>
        );
      })}

      {/* Empty Placeholder Slots if user requested 2, 3, or 4 panes and has fewer open tabs */}
      {isSplit &&
        emptySlotsCount > 0 &&
        Array.from({ length: emptySlotsCount }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              ...styles.splitPane,
              ...styles.emptyPane,
              ...getPaneAreaStyle(splitMode, visibleTabs.length + i)
            }}
            onClick={onNewTab}
            title="Clic para abrir una nueva pestaña en este panel"
          >
            <div style={styles.addPaneCircle}>
              <Plus size={22} color="var(--accent)" />
            </div>
            <span style={styles.addPaneText}>Abrir pestaña en panel {visibleTabs.length + i + 1}</span>
          </div>
        ))}
    </div>
  );
}

function WebviewItem({
  tab,
  isActive,
  isSplit = false,
  onUpdateTab,
  onNewTabWithUrl,
  webviewRefs,
  isInspectorActive,
  onElementInspected,
  onScrollDirection
}) {
  const ref = useRef(null);
  const initialUrlRef = useRef(tab.url || 'about:blank');
  const lastLoadedUrlRef = useRef(tab.url || '');
  const isDomReadyRef = useRef(false);

  const callbacksRef = useRef({});
  callbacksRef.current = {
    onUpdateTab,
    onNewTabWithUrl,
    onElementInspected,
    onScrollDirection,
    isActive,
    isInspectorActive
  };

  const safeExecuteJs = (code) => {
    const isElectronEnv = typeof window !== 'undefined' && Boolean(window.browserAPI);
    if (!isElectronEnv) return Promise.resolve(null);
    const webview = ref.current;
    if (!webview || typeof webview.executeJavaScript !== 'function') return Promise.resolve(null);
    try {
      return webview.executeJavaScript(code).catch(() => null);
    } catch (e) {
      return Promise.resolve(null);
    }
  };

  // Handle external navigation from Omnibar or bookmarks without changing src attribute
  useEffect(() => {
    const webview = ref.current;
    if (!webview || !tab.url || tab.isNewTab) return;

    const normalize = (u) => {
      if (!u) return '';
      try {
        const p = new URL(u);
        return p.origin + p.pathname.replace(/\/+$/, '') + p.search;
      } catch (e) {
        return u.replace(/\/+$/, '');
      }
    };

    if (normalize(tab.url) === normalize(lastLoadedUrlRef.current)) {
      return;
    }

    lastLoadedUrlRef.current = tab.url;

    try {
      if (typeof webview.loadURL === 'function') {
        webview.loadURL(tab.url).catch(() => { });
      }
    } catch (e) { }
  }, [tab.url, tab.isNewTab]);



  // Handle active inspector state changes safely with self-healing injection
  useEffect(() => {
    if (!isActive) return;
    const webview = ref.current;
    if (!webview) return;

    if (isInspectorActive) {
      const inspectorScript = window.browserAPI?.getDevInspectorScript?.();
      if (inspectorScript) {
        safeExecuteJs(`
          (function() {
            try {
              if (typeof window.__dozzo_toggle_inspector !== 'function') {
                ${inspectorScript}
              }
              if (typeof window.__dozzo_toggle_inspector === 'function') {
                window.__dozzo_toggle_inspector(true);
              }
            } catch (e) {
              console.error('Error toggling Dozzo inspector:', e);
            }
          })();
        `);
      }
    } else {
      safeExecuteJs(`
        if (typeof window.__dozzo_toggle_inspector === 'function') {
          window.__dozzo_toggle_inspector(false);
        }
      `);
    }
  }, [isActive, isInspectorActive]);

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return;

    webviewRefs.current.set(tab.id, webview);

    const handleStartLoading = () => {
      callbacksRef.current.onUpdateTab?.(tab.id, { isLoading: true });
    };

    const handleStopLoading = () => {
      callbacksRef.current.onUpdateTab?.(tab.id, {
        isLoading: false,
        canGoBack: webview.canGoBack ? webview.canGoBack() : false,
        canGoForward: webview.canGoForward ? webview.canGoForward() : false
      });
    };

    const handleTitleUpdated = (e) => {
      callbacksRef.current.onUpdateTab?.(tab.id, { title: e.title });
    };

    const handleFaviconUpdated = (e) => {
      if (e.favicons && e.favicons.length > 0) {
        callbacksRef.current.onUpdateTab?.(tab.id, { favicon: e.favicons[0] });
      }
    };

    const handleNavigate = (e) => {
      lastLoadedUrlRef.current = e.url;
      callbacksRef.current.onUpdateTab?.(tab.id, {
        url: e.url,
        canGoBack: webview.canGoBack ? webview.canGoBack() : false,
        canGoForward: webview.canGoForward ? webview.canGoForward() : false
      });

      // Ensure adblocker is actively running on in-page SPA navigation only for YouTube
      try {
        if (e.url && e.url.includes('youtube.com')) {
          const adblockScript = window.browserAPI?.getAdblockScript?.();
          if (adblockScript) {
            safeExecuteJs(adblockScript);
          }
        }
      } catch (err) { }

      // Keep dev inspector active across in-page SPA navigations
      if (callbacksRef.current.isActive && callbacksRef.current.isInspectorActive) {
        const inspectorScript = window.browserAPI?.getDevInspectorScript?.();
        if (inspectorScript) {
          safeExecuteJs(`
            try {
              if (typeof window.__dozzo_toggle_inspector !== 'function') {
                ${inspectorScript}
              }
              if (typeof window.__dozzo_toggle_inspector === 'function') {
                window.__dozzo_toggle_inspector(true);
              }
            } catch (err) {}
          `);
        }
      }
    };

    const handleDomReady = () => {
      isDomReadyRef.current = true;

      if (isPip) {
        wasPipRef.current = true;
        safeExecuteJs(`
          (function() {
            let st = document.getElementById('__dozzo_pip_css');
            if (!st) {
              st = document.createElement('style');
              st.id = '__dozzo_pip_css';
              document.documentElement.appendChild(st);
            }
            st.textContent = \`
              html, body {
                overflow: hidden !important;
                background: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
              }
              #masthead-container, ytd-masthead, #masthead,
              #secondary, #below, #comments, #guide, tp-yt-app-drawer,
              #chips-wrapper, #header, #related, .ytp-chrome-top,
              header, nav, aside, footer, #chat-container {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              ytd-app, #page-manager, ytd-watch-flexy, #columns, #primary, #primary-inner,
              #player, #player-container-outer, #player-container, #movie_player, .html5-video-player {
                transform: none !important;
                contain: none !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                position: static !important;
              }
              video {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                z-index: 2147483647 !important;
                background: #000000 !important;
                object-fit: contain !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            \`;
            document.body.classList.add('dozzo-pip-active');
            const v = document.querySelector('video');
            if (v && v.paused) v.play().catch(() => {});
            window.dispatchEvent(new Event('resize'));
          })();
        `);
      }

      // Inject universal adblock and YouTube auto-skipper ONLY for YouTube
      try {
        const curUrl = typeof webview.getURL === 'function' ? webview.getURL() : tab.url;
        if (curUrl && curUrl.includes('youtube.com')) {
          const adblockScript = window.browserAPI?.getAdblockScript?.();
          if (adblockScript) {
            safeExecuteJs(adblockScript);
          }
        }
      } catch (e) { }

      // Inject developer element inspector engine
      const inspectorScript = window.browserAPI?.getDevInspectorScript?.();
      if (inspectorScript) {
        safeExecuteJs(inspectorScript).then(() => {
          if (callbacksRef.current.isActive && callbacksRef.current.isInspectorActive) {
            safeExecuteJs('if (typeof window.__dozzo_toggle_inspector === "function") window.__dozzo_toggle_inspector(true);');
          }
        });
      }
    };

    const handleNewWindow = (e) => {
      if (e.url) {
        callbacksRef.current.onNewTabWithUrl?.(e.url);
      }
    };

    const handleMediaStartedPlaying = () => {
      callbacksRef.current.onUpdateTab?.(tab.id, { isAudioPlaying: true });
      callbacksRef.current.onMediaStartedPlaying?.(tab.id);
    };

    const handleMediaPaused = () => {
      callbacksRef.current.onUpdateTab?.(tab.id, { isAudioPlaying: false });
    };

    const handleConsoleMessage = (e) => {
      const msg = e.message;
      if (typeof msg === 'string') {
        if (msg.startsWith('__DOZZO_INSPECTOR_PAYLOAD__:') || msg.startsWith('__DOZZO_DEV_INSPECT__:')) {
          try {
            const prefix = msg.startsWith('__DOZZO_INSPECTOR_PAYLOAD__:')
              ? '__DOZZO_INSPECTOR_PAYLOAD__:'
              : '__DOZZO_DEV_INSPECT__:';
            const jsonStr = msg.replace(prefix, '');
            const parsed = JSON.parse(jsonStr);
            callbacksRef.current.onElementInspected?.(parsed);
          } catch (err) { }
        } else if (msg === '__DOZZO_SCROLL__:down') {
          if (callbacksRef.current.isActive) callbacksRef.current.onScrollDirection?.('down');
        } else if (msg === '__DOZZO_SCROLL__:up') {
          if (callbacksRef.current.isActive) callbacksRef.current.onScrollDirection?.('up');
        }
      }
    };

    const handleIpcMessage = (e) => {
      if (e.channel === 'dozzo-inspector-element' && e.args && e.args[0]) {
        callbacksRef.current.onElementInspected?.(e.args[0]);
      }
    };

    webview.addEventListener('did-start-loading', handleStartLoading);
    webview.addEventListener('did-stop-loading', handleStopLoading);
    webview.addEventListener('page-title-updated', handleTitleUpdated);
    webview.addEventListener('page-favicon-updated', handleFaviconUpdated);
    webview.addEventListener('did-navigate', handleNavigate);
    webview.addEventListener('did-navigate-in-page', handleNavigate);
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('new-window', handleNewWindow);
    webview.addEventListener('media-started-playing', handleMediaStartedPlaying);
    webview.addEventListener('media-paused', handleMediaPaused);
    webview.addEventListener('console-message', handleConsoleMessage);
    webview.addEventListener('ipc-message', handleIpcMessage);

    return () => {
      isDomReadyRef.current = false;
      webviewRefs.current.delete(tab.id);
      webview.removeEventListener('did-start-loading', handleStartLoading);
      webview.removeEventListener('did-stop-loading', handleStopLoading);
      webview.removeEventListener('page-title-updated', handleTitleUpdated);
      webview.removeEventListener('page-favicon-updated', handleFaviconUpdated);
      webview.removeEventListener('did-navigate', handleNavigate);
      webview.removeEventListener('did-navigate-in-page', handleNavigate);
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('new-window', handleNewWindow);
      webview.removeEventListener('media-started-playing', handleMediaStartedPlaying);
      webview.removeEventListener('media-paused', handleMediaPaused);
      webview.removeEventListener('console-message', handleConsoleMessage);
      webview.removeEventListener('ipc-message', handleIpcMessage);
    };
  }, [tab.id]);

  const defaultUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

  const isElectron = Boolean(window.browserAPI);

  if (!isElectron) {
    return (
      <div
        style={{
          display: isActive ? 'flex' : 'none',
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 1,
          flexDirection: 'column',
          background: 'var(--bg-primary)'
        }}
      >
        <iframe
          ref={ref}
          src={tab.url}
          title={tab.title || 'Dozzo View'}
          onLoad={() => onUpdateTab(tab.id, { isLoading: false })}
          onError={() => onUpdateTab(tab.id, { isLoading: false })}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
            border: 'none',
            outline: 'none',
            background: '#000000',
            backgroundColor: '#000000'
          }}
        />
      </div>
    );
  }

  const webviewPreload = window.browserAPI?.getWebviewPreloadUrl?.();

  return (
    <webview
      ref={ref}
      src={initialUrlRef.current}
      partition="persist:dozzo-browser"
      preload={webviewPreload || undefined}
      webpreferences="contextIsolation=no, nodeIntegration=no, plugins=yes"
      allowpopups="true"
      plugins="true"
      useragent={window.browserAPI?.getUserAgent?.() || defaultUserAgent}
      style={{
        visibility: isActive ? 'visible' : 'hidden',
        position: isSplit ? 'relative' : isActive ? 'relative' : 'absolute',
        top: isSplit ? 0 : isActive ? 0 : -99999,
        left: isSplit ? 0 : isActive ? 0 : -99999,
        width: '100%',
        height: '100%',
        zIndex: 1,
        border: 'none',
        outline: 'none',
        flex: 1,
        pointerEvents: isActive ? 'auto' : 'none',
        backgroundColor: '#000000'
      }}
    />
  );
}

const styles = {
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-primary)'
  },
  splitPane: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
    transition: 'all 0.2s ease',
    minHeight: 0,
    minWidth: 0
  },
  emptyPane: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1.5px dashed rgba(255, 255, 255, 0.15)',
    cursor: 'pointer'
  },
  addPaneCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addPaneText: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  paneHeader: {
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    background: 'rgba(0, 0, 0, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    gap: '6px',
    flexShrink: 0
  },
  paneFaviconBox: {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  paneTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '140px'
  },
  paneActions: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  paneActionBtn: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    transition: 'all 0.15s ease'
  },
  paneBody: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  ratioGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    padding: '1px 3px',
    marginRight: '4px'
  },
  ratioBtn: {
    padding: '1px 5px',
    fontSize: '9px',
    fontWeight: '700',
    borderRadius: '3px',
    background: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  ratioBtnActive: {
    background: 'var(--accent)',
    color: '#000'
  }
};
