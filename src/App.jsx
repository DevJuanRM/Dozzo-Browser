import React, { useState, useEffect, useRef } from 'react';
import { Code2, X, ChevronDown, ChevronUp } from 'lucide-react';
import TitleBar from './components/TitleBar';
import NavigationBar from './components/NavigationBar';
import BookmarksBar from './components/BookmarksBar';
import WebviewContainer from './components/WebviewContainer';
import BinanceWidget from './components/BinanceWidget';
import ShieldModal from './components/ShieldModal';
import SettingsModal from './components/SettingsModal';
import DownloadsModal from './components/DownloadsModal';
import SidebarApps from './components/SidebarApps';
import ContextMenu from './components/ContextMenu';
import DevInspectorDrawer from './components/DevInspectorDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import HistoryModal from './components/HistoryModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';

export default function App() {
  // Tabs State
  const [tabs, setTabs] = useState([
    {
      id: 'tab-1',
      title: 'Nueva Pestaña',
      url: '',
      favicon: null,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isAudioPlaying: false,
      isNewTab: true
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Appearance & Themes
  const [theme, setTheme] = useState(() => localStorage.getItem('dozzo_theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('dozzo_accent') || 'gold');
  const [searchEngine, setSearchEngine] = useState(() => localStorage.getItem('dozzo_engine') || 'duckduckgo');
  const [showBookmarksBar, setShowBookmarksBar] = useState(() => localStorage.getItem('dozzo_bookmarks_visible') !== 'false');
  const [isAutoHidden, setIsAutoHidden] = useState(() => localStorage.getItem('dozzo_autohide_topbar') === 'true');
  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [showPillHint, setShowPillHint] = useState(false);
  const [isScrolledHidden, setIsScrolledHidden] = useState(false);
  const pillTimeoutRef = useRef(null);

  const isHeaderHidden = isAutoHidden || isScrolledHidden;

  // Auto-hide pill hint fade-out timer
  useEffect(() => {
    if (isAutoHidden) {
      setShowPillHint(true);
      if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
      pillTimeoutRef.current = setTimeout(() => {
        setShowPillHint(false);
      }, 2500);
    } else {
      setShowPillHint(false);
    }
  }, [isAutoHidden]);

  // Handle scroll down inside webview to auto-hide top bar smoothly
  const handleScrollDirection = (direction) => {
    if (direction === 'down') {
      if (!isHoveringTop) {
        setIsScrolledHidden(true);
      }
    } else if (direction === 'up') {
      setIsScrolledHidden(false);
    }
  };

  // Privacy & Adblocker Stats
  const [blockedCount, setBlockedCount] = useState(0);
  const [isShieldActive, setIsShieldActive] = useState(true);

  // Modals & Panels
  const [isBinanceOpen, setIsBinanceOpen] = useState(false);
  const [isShieldOpen, setIsShieldOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [inspectedElement, setInspectedElement] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // History State
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('dozzo_browser_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('dozzo_custom_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live Binance top ticker for navbar chip
  const [binanceTicker, setBinanceTicker] = useState({ symbol: 'BTC', price: '68,420' });

  // Map of tabId -> webview element ref
  const webviewRefs = useRef(new Map());

  // Apply theme & accent to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dozzo_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem('dozzo_accent', accentColor);
  }, [accentColor]);

  // Sync Electron IPC Adblock updates
  useEffect(() => {
    if (window.browserAPI?.onAdblockUpdate) {
      const unsubscribe = window.browserAPI.onAdblockUpdate((stats) => {
        if (stats && typeof stats.blockedCount === 'number') {
          setBlockedCount(stats.blockedCount);
          if (typeof stats.isActive === 'boolean') {
            setIsShieldActive(stats.isActive);
          }
        }
      });
      return unsubscribe;
    }
  }, []);

  // Fetch initial stats from Electron
  useEffect(() => {
    if (window.browserAPI?.getAdblockStats) {
      window.browserAPI.getAdblockStats().then((stats) => {
        if (stats) {
          setBlockedCount(stats.blockedCount || 0);
          setIsShieldActive(stats.isActive !== false);
        }
      });
    }
  }, []);

  // Fetch quick ticker for Binance chip
  useEffect(() => {
    const fetchQuickTicker = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (res.ok) {
          const data = await res.json();
          setBinanceTicker({
            symbol: 'BTC',
            price: parseFloat(data.price).toFixed(0)
          });
        }
      } catch (e) {}
    };
    fetchQuickTicker();
    const interval = setInterval(fetchQuickTicker, 15000);
    return () => clearInterval(interval);
  }, []);

  // Listen for Electron download events
  useEffect(() => {
    if (window.browserAPI?.onDownloadEvent) {
      const unsubscribe = window.browserAPI.onDownloadEvent((item) => {
        setDownloads((prev) => {
          const index = prev.findIndex((d) => d.id === item.id);
          if (index !== -1) {
            const next = [...prev];
            next[index] = { ...next[index], ...item };
            return next;
          }
          return [item, ...prev];
        });
      });
      return unsubscribe;
    }
  }, []);

  // Listen for context menu "open link in new tab"
  useEffect(() => {
    if (window.browserAPI?.onOpenNewTabUrl) {
      const unsubscribe = window.browserAPI.onOpenNewTabUrl((url) => {
        handleNewTab(url);
      });
      return unsubscribe;
    }
  }, []);

  // Listen for background auto-updater events
  const [updateInfo, setUpdateInfo] = useState(null);
  useEffect(() => {
    if (window.browserAPI?.onUpdaterMessage) {
      const unsubscribe = window.browserAPI.onUpdaterMessage((data) => {
        if (data && data.status === 'update-downloaded') {
          setUpdateInfo(data);
        }
      });
      return unsubscribe;
    }
  }, []);

  // Keyboard Shortcuts (Ctrl+T, Ctrl+W, Ctrl+R, Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        handleNewTab();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        window.location.reload();
      } else if (e.key === 'F5') {
        e.preventDefault();
        window.location.reload();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleReload();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setIsDownloadsOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, tabs]);

  // History tracking
  const addToHistory = (entry) => {
    if (!entry.url || entry.url.startsWith('about:') || entry.url.includes('localhost:5173')) return;
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.url !== entry.url);
      const updated = [
        {
          id: Date.now().toString(),
          title: entry.title || entry.url,
          url: entry.url,
          timestamp: Date.now(),
          favicon: entry.favicon || null
        },
        ...filtered
      ].slice(0, 500);
      localStorage.setItem('dozzo_browser_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Tab Operations
  const handleNewTab = (url = '') => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: url ? 'Cargando...' : 'Nueva Pestaña',
      url: url,
      favicon: null,
      isLoading: Boolean(url),
      canGoBack: false,
      canGoForward: false,
      isAudioPlaying: false,
      isNewTab: !url
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (tabIdToClose) => {
    if (tabs.length === 1) {
      // If closing the only tab, reset to New Tab page
      setTabs([
        {
          id: `tab-${Date.now()}`,
          title: 'Nueva Pestaña',
          url: '',
          favicon: null,
          isLoading: false,
          canGoBack: false,
          canGoForward: false,
          isAudioPlaying: false,
          isNewTab: true
        }
      ]);
      return;
    }

    const currentIndex = tabs.findIndex((t) => t.id === tabIdToClose);
    const newTabs = tabs.filter((t) => t.id !== tabIdToClose);

    if (activeTabId === tabIdToClose) {
      const nextIndex = Math.max(0, currentIndex - 1);
      setActiveTabId(newTabs[nextIndex].id);
    }
    setTabs(newTabs);
  };

  const handleUpdateTab = (tabId, updates) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === tabId) {
          const next = { ...t, ...updates };
          if (updates.url && updates.url !== t.url) {
            addToHistory({ url: updates.url, title: next.title, favicon: next.favicon });
          } else if (updates.title && next.url && !t.isNewTab) {
            addToHistory({ url: next.url, title: updates.title, favicon: next.favicon });
          }
          return next;
        }
        return t;
      })
    );
  };

  const handleNavigate = (url) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          const webview = webviewRefs.current.get(activeTabId);
          if (webview && !t.isNewTab) {
            webview.loadURL(url);
          }
          return {
            ...t,
            url,
            isNewTab: false,
            isLoading: true
          };
        }
        return t;
      })
    );
  };

  // Active Webview Navigation controls
  const activeWebview = webviewRefs.current.get(activeTabId);

  const handleGoBack = () => {
    if (activeWebview && activeWebview.canGoBack()) {
      activeWebview.goBack();
    }
  };

  const handleGoForward = () => {
    if (activeWebview && activeWebview.canGoForward()) {
      activeWebview.goForward();
    }
  };

  const handleReload = () => {
    if (activeWebview) {
      activeWebview.reload();
    }
  };

  const handleStop = () => {
    if (activeWebview) {
      activeWebview.stop();
    }
  };

  const handleGoHome = () => {
    handleUpdateTab(activeTabId, {
      isNewTab: true,
      url: '',
      title: 'Nueva Pestaña',
      isLoading: false
    });
  };

  // Shield actions
  const handleToggleShield = (active) => {
    setIsShieldActive(active);
    if (window.browserAPI?.toggleShield) {
      window.browserAPI.toggleShield(active);
    }
  };

  const handleResetStats = () => {
    setBlockedCount(0);
    if (window.browserAPI?.resetAdblockStats) {
      window.browserAPI.resetAdblockStats();
    }
  };

  // Bookmarking
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isCurrentBookmarked = bookmarks.some((b) => b.url === activeTab?.url);

  const handleToggleBookmark = () => {
    if (!activeTab || activeTab.isNewTab || !activeTab.url) return;

    if (isCurrentBookmarked) {
      const updated = bookmarks.filter((b) => b.url !== activeTab.url);
      setBookmarks(updated);
      localStorage.setItem('dozzo_custom_bookmarks', JSON.stringify(updated));
    } else {
      const updated = [
        ...bookmarks,
        { title: activeTab.title || activeTab.url, url: activeTab.url }
      ];
      setBookmarks(updated);
      localStorage.setItem('dozzo_custom_bookmarks', JSON.stringify(updated));
    }
  };

  return (
    <div
      className="browser-shell"
      onContextMenu={(e) => {
        // Only trigger custom context menu if not selecting text inside an input
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
        }
      }}
    >
      {/* Top Hover Trigger Zone when bar is auto-hidden or scrolled-hidden */}
      {isHeaderHidden && (
        <div
          className="top-hover-trigger"
          onMouseEnter={() => setIsHoveringTop(true)}
          title="Pasar el cursor por la parte superior para mostrar la barra del explorador"
        >
          {showPillHint && (
            <div className="top-hover-pill pill-fade-out">
              <ChevronDown size={13} />
              <span>Barra Oculta</span>
            </div>
          )}
        </div>
      )}

      {/* Top Header Wrapper (TitleBar, NavigationBar, BookmarksBar) */}
      <div
        className={`top-header-wrapper ${isHeaderHidden ? 'auto-hidden' : ''} ${isHoveringTop ? 'peek' : ''}`}
        onMouseEnter={() => isHeaderHidden && setIsHoveringTop(true)}
        onMouseLeave={() => isHeaderHidden && setIsHoveringTop(false)}
      >
        {/* Custom Window TitleBar & Centered iOS Dock Tabs */}
        <TitleBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={(id) => setActiveTabId(id)}
          onCloseTab={handleCloseTab}
          onNewTab={() => handleNewTab()}
          isMaximized={isMaximized}
        />

        {/* Navigation Toolbar (Omnibar, Privacy Shield, Binance Button, Downloads, Sidebar) */}
        <NavigationBar
          currentUrl={activeTab?.isNewTab ? '' : activeTab?.url}
          isLoading={activeTab?.isLoading}
          canGoBack={activeTab?.canGoBack}
          canGoForward={activeTab?.canGoForward}
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onReload={handleReload}
          onStop={handleStop}
          onGoHome={handleGoHome}
          showBookmarksBar={showBookmarksBar}
          onToggleBookmarksBar={() => {
            const next = !showBookmarksBar;
            setShowBookmarksBar(next);
            localStorage.setItem('dozzo_bookmarks_visible', String(next));
          }}
          blockedCount={blockedCount}
          isShieldActive={isShieldActive}
          onToggleShieldModal={() => setIsShieldOpen(true)}
          onToggleBinance={() => setIsBinanceOpen(!isBinanceOpen)}
          isBinanceOpen={isBinanceOpen}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          accentColor={accentColor}
          onChangeAccent={(acc) => setAccentColor(acc)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          searchEngine={searchEngine}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleBookmark}
          binanceTicker={binanceTicker}
          onToggleDownloads={() => setIsDownloadsOpen(!isDownloadsOpen)}
          downloadsCount={downloads.filter((d) => d.state === 'progressing').length}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onToggleInspector={() => setIsInspectorActive((prev) => !prev)}
          isInspectorActive={isInspectorActive}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          history={history}
          isAutoHidden={isAutoHidden}
          onToggleAutoHide={() => {
            const next = !isAutoHidden;
            setIsAutoHidden(next);
            localStorage.setItem('dozzo_autohide_topbar', String(next));
            if (!next) {
              setIsScrolledHidden(false);
              setIsHoveringTop(false);
            }
          }}
        />

        {/* Optional Bookmarks Bar */}
        {showBookmarksBar && (
          <BookmarksBar
            bookmarks={bookmarks}
            onNavigate={(url) => {
              if (activeTab?.isNewTab) {
                handleNavigate(url);
              } else {
                handleNewTab(url);
              }
            }}
          />
        )}
      </div>

      {/* Dev Mode Banner when inspector is active */}
      {isInspectorActive && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: 'rgba(240, 185, 11, 0.15)',
            borderBottom: '1px solid rgba(240, 185, 11, 0.35)',
            color: 'var(--text-primary)',
            fontSize: '12.5px',
            zIndex: 45
          }}
          className="animate-slide-down"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Code2 size={16} color="var(--accent)" />
            <span>
              {activeTab?.isNewTab ? (
                <>
                  <strong>Modo Dev Studio:</strong> Escribe una URL o abre una página web para seleccionar componentes y convertirlos a <strong>React (JSX)</strong> o <strong>Figma</strong>.
                </>
              ) : (
                <>
                  <strong>Modo Dev Studio Activo:</strong> Mueve el mouse sobre cualquier botón, tarjeta o texto en la página y <strong>haz clic</strong> para clonarlo a <strong>React (JSX)</strong> y <strong>Figma</strong>.
                </>
              )}
            </span>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '11.5px',
              fontWeight: '700',
              border: '1px solid var(--border-subtle)'
            }}
            onClick={() => setIsInspectorActive(false)}
          >
            <X size={14} />
            <span>Cerrar Inspector</span>
          </button>
        </div>
      )}

      {/* Main Webviews & New Tab Pages Viewport */}
      <ErrorBoundary>
        <WebviewContainer
          tabs={tabs}
          activeTabId={activeTabId}
          onUpdateTab={handleUpdateTab}
          onNewTabWithUrl={(url) => handleNewTab(url)}
          onNavigate={handleNavigate}
          searchEngine={searchEngine}
          onChangeSearchEngine={(eng) => setSearchEngine(eng)}
          blockedCount={blockedCount}
          onOpenBinance={() => setIsBinanceOpen(true)}
          webviewRefs={webviewRefs}
          isInspectorActive={isInspectorActive}
          onElementInspected={(data) => {
            setInspectedElement(data);
            setIsInspectorActive(false);
          }}
          onScrollDirection={handleScrollDirection}
        />
      </ErrorBoundary>

      {/* Binance Crypto Hub Drawer */}
      <BinanceWidget
        isOpen={isBinanceOpen}
        onClose={() => setIsBinanceOpen(false)}
        onOpenTradePair={(url) => {
          handleNewTab(url);
          setIsBinanceOpen(false);
        }}
      />

      {/* Downloads Manager Drawer */}
      <DownloadsModal
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        downloads={downloads}
        onClearDownloads={() => setDownloads([])}
      />

      {/* Sidebar Quick Tools (Notes, Crypto Calc, AI) */}
      <SidebarApps
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Dev Studio Element Inspector Drawer (JSX / Figma) */}
      <ErrorBoundary>
        <DevInspectorDrawer
          isOpen={Boolean(inspectedElement)}
          onClose={() => setInspectedElement(null)}
          elementData={inspectedElement}
          onPickAnother={() => {
            setInspectedElement(null);
            setIsInspectorActive(true);
          }}
        />
      </ErrorBoundary>

      {/* Right-click Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0 })}
        canGoBack={activeTab?.canGoBack}
        canGoForward={activeTab?.canGoForward}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onNewTab={() => handleNewTab()}
        onCloseTab={() => handleCloseTab(activeTabId)}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDevTools={() => window.browserAPI?.openDevTools?.()}
      />

      {/* History Manager Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onNavigate={(url) => {
          handleNavigate(url);
          setIsHistoryOpen(false);
        }}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem('dozzo_browser_history');
        }}
        onDeleteItem={(id) => {
          setHistory((prev) => {
            const updated = prev.filter((item) => item.id !== id);
            localStorage.setItem('dozzo_browser_history', JSON.stringify(updated));
            return updated;
          });
        }}
      />

      {/* Dozzo Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onNavigate={handleNavigate}
        onNewTab={(url) => handleNewTab(url)}
        onCloseTab={() => handleCloseTab(activeTabId)}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleInspector={() => setIsInspectorActive((prev) => !prev)}
        onOpenBinance={() => setIsBinanceOpen(true)}
        onExecuteInPage={(code) => {
          const wv = webviewRefs.current.get(activeTabId);
          if (wv && typeof wv.executeJavaScript === 'function') {
            return wv.executeJavaScript(code).catch(() => {});
          }
        }}
      />

      {/* Shield Details Modal */}
      <ShieldModal
        isOpen={isShieldOpen}
        onClose={() => setIsShieldOpen(false)}
        blockedCount={blockedCount}
        isShieldActive={isShieldActive}
        onToggleShield={handleToggleShield}
        onResetStats={handleResetStats}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        searchEngine={searchEngine}
        onChangeSearchEngine={(eng) => {
          setSearchEngine(eng);
          localStorage.setItem('dozzo_engine', eng);
        }}
        theme={theme}
        onToggleTheme={(t) => setTheme(t)}
        accentColor={accentColor}
        onChangeAccent={(acc) => setAccentColor(acc)}
        showBookmarksBar={showBookmarksBar}
        onToggleBookmarksBar={() => {
          const next = !showBookmarksBar;
          setShowBookmarksBar(next);
          localStorage.setItem('dozzo_bookmarks_visible', String(next));
        }}
      />

      {/* Auto-update available notification toast */}
      {updateInfo && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 9999
          }}
          className="animate-slide-down"
        >
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>
              🚀 Actualización v{updateInfo.version} Lista
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Se descargó en segundo plano automáticamente.
            </div>
          </div>
          <button
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            onClick={() => window.browserAPI?.installUpdate?.()}
          >
            Reiniciar y Actualizar
          </button>
        </div>
      )}
    </div>
  );
}
