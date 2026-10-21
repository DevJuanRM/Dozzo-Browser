import React, { useEffect, useRef } from 'react';
import NewTabPage from './NewTabPage';

export default function WebviewContainer({
  tabs,
  activeTabId,
  onUpdateTab,
  onNewTabWithUrl,
  onNavigate,
  searchEngine,
  onChangeSearchEngine,
  blockedCount,
  onOpenBinance,
  webviewRefs,
  isInspectorActive,
  onElementInspected
}) {
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div style={styles.container}>
      {/* If active tab is in New Tab state, show the beautiful NewTabPage speed dial */}
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
          />
        );
      })}
    </div>
  );
}

function WebviewItem({ tab, isActive, onUpdateTab, onNewTabWithUrl, webviewRefs, isInspectorActive, onElementInspected }) {
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

      // Inject Chrome-style bright blue text selection styling
      if (typeof webview.insertCSS === 'function') {
        webview
          .insertCSS(`
            ::selection {
              background-color: #2563eb !important;
              color: #ffffff !important;
            }
            ::-moz-selection {
              background-color: #2563eb !important;
              color: #ffffff !important;
            }
          `)
          .catch(() => {});
      }
    };

    const handleConsoleMessage = (e) => {
      if (e.message && e.message.startsWith('__DOZZO_DEV_INSPECT__:')) {
        try {
          const raw = e.message.replace('__DOZZO_DEV_INSPECT__:', '');
          const data = JSON.parse(raw);
          if (onElementInspected) {
            onElementInspected(data);
          }
        } catch (err) {
          console.error('Failed to parse inspected element data', err);
        }
      }
    };

    const handleNewWindow = (e) => {
      if (e.url) {
        onNewTabWithUrl(e.url);
      }
    };

    const handleMediaStarted = () => {
      onUpdateTab(tab.id, { isAudioPlaying: true });
    };

    const handleMediaPaused = () => {
      onUpdateTab(tab.id, { isAudioPlaying: false });
    };

    webview.addEventListener('did-start-loading', handleStartLoading);
    webview.addEventListener('did-stop-loading', handleStopLoading);
    webview.addEventListener('page-title-updated', handleTitleUpdated);
    webview.addEventListener('page-favicon-updated', handleFaviconUpdated);
    webview.addEventListener('did-navigate', handleNavigate);
    webview.addEventListener('did-navigate-in-page', handleNavigate);
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('new-window', handleNewWindow);
    webview.addEventListener('media-started-playing', handleMediaStarted);
    webview.addEventListener('media-paused', handleMediaPaused);
    webview.addEventListener('console-message', handleConsoleMessage);

    return () => {
      webview.removeEventListener('did-start-loading', handleStartLoading);
      webview.removeEventListener('did-stop-loading', handleStopLoading);
      webview.removeEventListener('page-title-updated', handleTitleUpdated);
      webview.removeEventListener('page-favicon-updated', handleFaviconUpdated);
      webview.removeEventListener('did-navigate', handleNavigate);
      webview.removeEventListener('did-navigate-in-page', handleNavigate);
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('new-window', handleNewWindow);
      webview.removeEventListener('media-started-playing', handleMediaStarted);
      webview.removeEventListener('media-paused', handleMediaPaused);
      webview.removeEventListener('console-message', handleConsoleMessage);
      webviewRefs.current.delete(tab.id);
    };
  }, [tab.id]);

  // Synchronize inspector active state safely
  useEffect(() => {
    const webview = ref.current;
    if (webview && !tab.isNewTab) {
      try {
        if (typeof webview.executeJavaScript === 'function') {
          const enable = Boolean(isActive && isInspectorActive);
          const inspectorScript = window.browserAPI?.getDevInspectorScript?.();
          if (enable && inspectorScript) {
            webview
              .executeJavaScript(inspectorScript)
              .then(() => {
                webview
                  .executeJavaScript('window.__dozzo_toggle_inspector && window.__dozzo_toggle_inspector(true);')
                  .catch(() => {});
              })
              .catch(() => {});
          } else {
            webview
              .executeJavaScript('window.__dozzo_toggle_inspector && window.__dozzo_toggle_inspector(false);')
              .catch(() => {});
          }
        }
      } catch (err) {}
    }
  }, [isInspectorActive, isActive, tab.id, tab.isNewTab]);

  const defaultUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

  return (
    <webview
      ref={ref}
      src={initialUrlRef.current}
      partition="persist:dozzo-browser"
      allowpopups="true"
      plugins="true"
      useragent={window.browserAPI?.getUserAgent?.() || defaultUserAgent}
      style={{
        visibility: isActive ? 'visible' : 'hidden',
        position: isActive ? 'relative' : 'absolute',
        top: isActive ? 0 : -99999,
        left: isActive ? 0 : -99999,
        width: '100%',
        height: '100%',
        border: 'none',
        flex: 1,
        pointerEvents: isActive ? 'auto' : 'none'
      }}
    />
  );
}

const styles = {
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)'
  }
};
