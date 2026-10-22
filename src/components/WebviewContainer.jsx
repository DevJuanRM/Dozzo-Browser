import React, { useEffect, useRef } from 'react';
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
    case '5-grid':
      return 5;
    default:
      return 1;
  }
};

const getGridContainerStyle = (mode) => {
  switch (mode) {
    case '2-col':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '6px',
        padding: '6px'
      };
    case '2-row':
      return {
        display: 'grid',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        padding: '6px'
      };
    case '3-grid':
      return {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        padding: '6px'
      };
    case '4-grid':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        padding: '6px'
      };
    case '5-grid':
      return {
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        padding: '6px'
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
  if (mode === '5-grid' && index === 0) {
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
  onChangeSplitMode
}) {
  const isSplit = splitMode !== 'single';
  const paneCount = getSplitCount(splitMode);

  // If in single view mode, render traditional standard active-view container
  if (!isSplit) {
    const activeTab = tabs.find((t) => t.id === activeTabId);

    return (
      <div style={styles.container}>
        {/* If active tab is in New Tab state, show the NewTabPage speed dial */}
        {activeTab?.isNewTab && (
          <NewTabPage
            onNavigate={(url) => onNavigate(url)}
            searchEngine={searchEngine}
            onChangeSearchEngine={onChangeSearchEngine}
            blockedCount={blockedCount}
            onOpenBinance={onOpenBinance}
          />
        )}

        {/* Render persistent Webviews for all non-new-tab tabs */}
        {tabs.map((tab) => {
          if (tab.isNewTab) return null;
          const isActive = tab.id === activeTabId;

          return (
            <WebviewItem
              key={tab.id}
              tab={tab}
              isActive={isActive}
              onUpdateTab={onUpdateTab}
              onNewTabWithUrl={onNewTabWithUrl}
              webviewRefs={webviewRefs}
              isInspectorActive={isInspectorActive}
              onElementInspected={onElementInspected}
              onScrollDirection={onScrollDirection}
            />
          );
        })}
      </div>
    );
  }

  // Multi-tab Split Grid Layout (1 to 5 views simultaneously)
  const visibleTabs = tabs.slice(0, paneCount);
  const emptySlotsCount = Math.max(0, paneCount - visibleTabs.length);

  return (
    <div style={{ ...styles.container, ...getGridContainerStyle(splitMode) }}>
      {visibleTabs.map((tab, idx) => {
        const isCurrentActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            style={{
              ...styles.splitPane,
              ...getPaneAreaStyle(splitMode, idx),
              border: isCurrentActive ? '2px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: isCurrentActive ? '0 0 16px var(--accent-glow)' : '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
            onClick={() => onSelectTab && onSelectTab(tab.id)}
          >
            {/* Split Pane Header */}
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

            {/* Split Pane Body */}
            <div style={styles.paneBody}>
              {tab.isNewTab ? (
                <NewTabPage
                  onNavigate={(url) => {
                    if (onUpdateTab) onUpdateTab(tab.id, { url, isNewTab: false });
                  }}
                  searchEngine={searchEngine}
                  onChangeSearchEngine={onChangeSearchEngine}
                  blockedCount={blockedCount}
                  onOpenBinance={onOpenBinance}
                />
              ) : (
                <WebviewItem
                  tab={tab}
                  isActive={true}
                  isSplit={true}
                  onUpdateTab={onUpdateTab}
                  onNewTabWithUrl={onNewTabWithUrl}
                  webviewRefs={webviewRefs}
                  isInspectorActive={isInspectorActive}
                  onElementInspected={onElementInspected}
                  onScrollDirection={onScrollDirection}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Empty Placeholder Slots if user requested 3, 4, or 5 panes and has fewer open tabs */}
      {Array.from({ length: emptySlotsCount }).map((_, i) => (
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

      {/* Hidden Webviews for remaining non-visible tabs to keep background state & audio alive */}
      {tabs.slice(paneCount).map((tab) => {
        if (tab.isNewTab) return null;
        return (
          <WebviewItem
            key={tab.id}
            tab={tab}
            isActive={false}
            onUpdateTab={onUpdateTab}
            onNewTabWithUrl={onNewTabWithUrl}
            webviewRefs={webviewRefs}
            isInspectorActive={false}
            onElementInspected={onElementInspected}
            onScrollDirection={onScrollDirection}
          />
        );
      })}
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
  const initialUrlRef = useRef(tab.url);
  const lastKnownUrl = useRef(tab.url);

  // Handle external navigation from Omnibar or bookmarks without changing src attribute
  useEffect(() => {
    const webview = ref.current;
    if (webview && tab.url && tab.url !== lastKnownUrl.current) {
      lastKnownUrl.current = tab.url;
      try {
        if (typeof webview.loadURL === 'function') {
          webview.loadURL(tab.url).catch(() => {});
        }
      } catch (e) {}
    }
  }, [tab.url]);

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return;

    webviewRefs.current.set(tab.id, webview);

    const handleStartLoading = () => {
      onUpdateTab(tab.id, { isLoading: true });
    };

    const handleStopLoading = () => {
      onUpdateTab(tab.id, {
        isLoading: false,
        canGoBack: webview.canGoBack ? webview.canGoBack() : false,
        canGoForward: webview.canGoForward ? webview.canGoForward() : false
      });
    };

    const handleTitleUpdated = (e) => {
      onUpdateTab(tab.id, { title: e.title });
    };

    const handleFaviconUpdated = (e) => {
      if (e.favicons && e.favicons.length > 0) {
        onUpdateTab(tab.id, { favicon: e.favicons[0] });
      }
    };

    const handleNavigate = (e) => {
      lastKnownUrl.current = e.url;
      onUpdateTab(tab.id, {
        url: e.url,
        canGoBack: webview.canGoBack ? webview.canGoBack() : false,
        canGoForward: webview.canGoForward ? webview.canGoForward() : false
      });
    };

    const handleDomReady = () => {
      // Inject universal adblock and YouTube auto-skipper
      const adblockScript = window.browserAPI?.getAdblockScript?.();
      if (adblockScript) {
        webview.executeJavaScript(adblockScript).catch(() => {});
      }

      // Inject developer element inspector engine
      const inspectorScript = window.browserAPI?.getDevInspectorScript?.();
      if (inspectorScript) {
        webview
          .executeJavaScript(inspectorScript)
          .then(() => {
            if (isActive && isInspectorActive) {
              webview
                .executeJavaScript('window.__dozzo_toggle_inspector && window.__dozzo_toggle_inspector(true)')
                .catch(() => {});
            }
          })
          .catch(() => {});
      }
    };

    const handleNewWindow = (e) => {
      if (e.url) {
        onNewTabWithUrl(e.url);
      }
    };

    const handleMediaStartedPlaying = () => {
      onUpdateTab(tab.id, { isAudioPlaying: true });
    };

    const handleMediaPaused = () => {
      onUpdateTab(tab.id, { isAudioPlaying: false });
    };

    const handleConsoleMessage = (e) => {
      const msg = e.message;
      if (typeof msg === 'string') {
        if (msg.startsWith('__DOZZO_INSPECTOR_PAYLOAD__:')) {
          try {
            const jsonStr = msg.replace('__DOZZO_INSPECTOR_PAYLOAD__:', '');
            const parsed = JSON.parse(jsonStr);
            if (onElementInspected) onElementInspected(parsed);
          } catch (err) {}
        } else if (msg === '__DOZZO_SCROLL__:down') {
          if (onScrollDirection && isActive) onScrollDirection('down');
        } else if (msg === '__DOZZO_SCROLL__:up') {
          if (onScrollDirection && isActive) onScrollDirection('up');
        }
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

    return () => {
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
    };
  }, [tab.id, isActive, isInspectorActive]);

  const defaultUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

  const isElectron = Boolean(window.browserAPI);

  if (!isElectron) {
    return (
      <div
        style={{
          display: isActive ? 'flex' : 'none',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          flex: 1,
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
  }
};
