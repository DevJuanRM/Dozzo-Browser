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
import MobileBrowserUI from './components/MobileBrowserUI';
import ResponsiveDeviceBar from './components/ResponsiveDeviceBar';
import UpdateNotificationModal from './components/UpdateNotificationModal';
import InstallGuideModal from './components/InstallGuideModal';
import { checkForLatestRelease } from './utils/updateChecker';

export default function App() {
  const initialTabUrl = new URLSearchParams(window.location.search).get('initialUrl') || '';

  // Responsive Mobile Detection (Dedicated Mobile Experience)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTouchMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return window.innerWidth <= 768 || isTouchMobile;
  });

  useEffect(() => {
    const handleResize = () => {
      const isTouchMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(window.innerWidth <= 768 || isTouchMobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tabs State
  const [tabs, setTabs] = useState([
    {
      id: 'tab-1',
      title: initialTabUrl ? 'Cargando...' : 'Nueva Pestaña',
      url: initialTabUrl,
      favicon: null,
      isLoading: Boolean(initialTabUrl),
      canGoBack: false,
      canGoForward: false,
      isAudioPlaying: false,
      isNewTab: !initialTabUrl
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Appearance & Themes (Default to pure pitch black 'none', zero tint by default)
  const [theme, setTheme] = useState(() => localStorage.getItem('dozzo_theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('dozzo_accent') || 'none');
  const [splitMode, setSplitMode] = useState(() => localStorage.getItem('dozzo_split_mode') || 'single');
  const [searchEngine, setSearchEngine] = useState(() => localStorage.getItem('dozzo_engine') || 'duckduckgo');
  const [showBookmarksBar, setShowBookmarksBar] = useState(() => localStorage.getItem('dozzo_bookmarks_visible') !== 'false');
  const [isAutoHidden, setIsAutoHidden] = useState(() => localStorage.getItem('dozzo_autohide_topbar') === 'true');
  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [showPillHint, setShowPillHint] = useState(false);
  const [isScrolledHidden, setIsScrolledHidden] = useState(false);
  const pillTimeoutRef = useRef(null);

  const handleSplitModeChange = (mode) => {
    setSplitMode(mode);
    localStorage.setItem('dozzo_split_mode', mode);
  };

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
  const [selectedCryptoBroker, setSelectedCryptoBroker] = useState(() => localStorage.getItem('dozzo_crypto_broker') || 'bitcoin');
  const [isSpotifyDismissed, setIsSpotifyDismissed] = useState(false);
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

  // Responsive Device Mode state (Chrome DevTools style)
  const [responsiveMode, setResponsiveMode] = useState({
    enabled: false,
    preset: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    scale: 1,
    isRotated: false,
    showFrame: true
  });

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

  // Auto-updater and Version Management
  const [updateInfo, setUpdateInfo] = useState(null);
  const [activeUpdateData, setActiveUpdateData] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isElectronDownloaded, setIsElectronDownloaded] = useState(false);

  // 1. Proactive GitHub Releases check on launch
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const release = await checkForLatestRelease();
        if (release && release.hasUpdate) {
          const dismissedVer = localStorage.getItem(`dozzo_dismissed_v${release.latestVersion}`);
          if (!dismissedVer) {
            setActiveUpdateData(release);
            setIsUpdateModalOpen(true);
          }
        }
      } catch (e) {}
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // 2. Electron background updater listener
  useEffect(() => {
    if (window.browserAPI?.onUpdaterMessage) {
      const unsubscribe = window.browserAPI.onUpdaterMessage((data) => {
        if (!data) return;
        if (data.status === 'update-available') {
          setActiveUpdateData((prev) => ({
            ...prev,
            hasUpdate: true,
            latestVersion: data.version,
            releaseNotes: data.releaseNotes || prev?.releaseNotes || 'Mejoras continuas y parches de seguridad.',
            releaseDate: data.releaseDate || prev?.releaseDate || ''
          }));
          setIsUpdateModalOpen(true);
        } else if (data.status === 'update-downloaded') {
          setIsElectronDownloaded(true);
          setUpdateInfo(data);
          setActiveUpdateData((prev) => ({
            ...prev,
            hasUpdate: true,
            latestVersion: data.version
          }));
          setIsUpdateModalOpen(true);
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

  const handleCloseAllTabs = () => {
    const newId = `tab-${Date.now()}`;
    setTabs([
      {
        id: newId,
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
    setActiveTabId(newId);
  };

  const handlePopOutTab = async (tabIdToPop) => {
    const tabToPop = tabs.find((t) => t.id === tabIdToPop);
    if (!tabToPop || tabToPop.isNewTab || !tabToPop.url) return;

    let targetUrl = tabToPop.url;
    const wv = webviewRefs.current.get(tabIdToPop);
    if (wv && typeof wv.executeJavaScript === 'function') {
      try {
        const timeSec = await wv.executeJavaScript(`
          (() => {
            const v = document.querySelector('video');
            if (v && v.currentTime > 0) {
              return Math.floor(v.currentTime);
            }
            return 0;
          })()
        `);
        if (timeSec && timeSec > 0) {
          try {
            const urlObj = new URL(targetUrl);
            if (urlObj.hostname.includes('youtube.com')) {
              urlObj.searchParams.set('t', `${timeSec}s`);
              targetUrl = urlObj.toString();
            } else if (urlObj.hostname.includes('youtu.be')) {
              urlObj.searchParams.set('t', String(timeSec));
              targetUrl = urlObj.toString();
            } else {
              urlObj.searchParams.set('t', String(timeSec));
              targetUrl = urlObj.toString();
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    if (window.browserAPI?.openNewWindow) {
      window.browserAPI.openNewWindow(targetUrl);
    } else {
      window.open(targetUrl, '_blank');
    }
    handleCloseTab(tabIdToPop);
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
      {/* Responsive Header: Dedicated Mobile Browser UI vs Desktop TitleBar & NavigationBar */}
      {isMobile ? (
        <MobileBrowserUI
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={(id) => setActiveTabId(id)}
          onCloseTab={handleCloseTab}
          onNewTab={() => handleNewTab()}
          onCloseAllTabs={handleCloseAllTabs}
          currentUrl={activeTab?.isNewTab ? '' : activeTab?.url}
          isLoading={activeTab?.isLoading}
          canGoBack={activeTab?.canGoBack}
          canGoForward={activeTab?.canGoForward}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onReload={handleReload}
          onStop={handleStop}
          onNavigate={handleNavigate}
          blockedCount={blockedCount}
          onToggleShieldModal={() => setIsShieldOpen(true)}
          selectedCryptoBroker={selectedCryptoBroker}
          onOpenBinance={() => setIsBinanceOpen(true)}
          onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          onOpenDownloads={() => setIsDownloadsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleBookmark}
        />
      ) : (
        <>
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
              splitMode={splitMode}
              onChangeSplitMode={handleSplitModeChange}
              onToggleAutoHide={() => {
                const next = !isAutoHidden;
                setIsAutoHidden(next);
                localStorage.setItem('dozzo_autohide_topbar', String(next));
                if (!next) {
                  setIsScrolledHidden(false);
                  setIsHoveringTop(false);
                }
              }}
              isAutoHidden={isAutoHidden}
              onGoHome={handleGoHome}
              onToggleBookmarksBar={() => {
                const next = !showBookmarksBar;
                setShowBookmarksBar(next);
                localStorage.setItem('dozzo_bookmarks_visible', String(next));
              }}
              showBookmarksBar={showBookmarksBar}
              onPopOutTab={handlePopOutTab}
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
              isShieldOpen={isShieldOpen}
              onToggleShieldModal={() => setIsShieldOpen(true)}
              onToggleBinance={() => setIsBinanceOpen(!isBinanceOpen)}
              isBinanceOpen={isBinanceOpen}
              selectedCryptoBroker={selectedCryptoBroker}
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
        </>
      )}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: responsiveMode.enabled ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: responsiveMode.enabled ? '#000000' : 'var(--text-primary)',
                fontSize: '11.5px',
                fontWeight: '700',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
              onClick={() => setResponsiveMode((prev) => ({ ...prev, enabled: !prev.enabled }))}
            >
              <span>{responsiveMode.enabled ? 'Cerrar Modo Responsive' : 'Modo Responsive (Móvil / Tablet)'}</span>
            </button>
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
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
              onClick={() => setIsInspectorActive(false)}
            >
              <X size={14} />
              <span>Cerrar Inspector</span>
            </button>
          </div>
        </div>
      )}

      {/* Spotify DRM Helper banner when on Spotify Web */}
      {activeTab?.url && activeTab.url.includes('spotify.com') && !isSpotifyDismissed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 16px',
            background: 'linear-gradient(90deg, rgba(29, 185, 84, 0.16), rgba(12, 12, 14, 0.95))',
            borderBottom: '1px solid rgba(29, 185, 84, 0.35)',
            color: '#fff',
            fontSize: '12px',
            zIndex: 44
          }}
          className="animate-slide-down"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px' }}>🎵</span>
            <span>
              <strong>Spotify Web Playback:</strong> Spotify Web requiere firma propietaria VMP de Google para reproducir audio DRM. Puedes reproducir al instante en la App de Spotify (1-Click) o usar YouTube Music sin restricciones.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                if (window.browserAPI?.openExternal) {
                  window.browserAPI.openExternal('spotify:');
                } else {
                  window.open('spotify:');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#1DB954',
                color: '#000',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Abrir App de Spotify
            </button>
            <button
              onClick={() => handleNavigate('https://music.youtube.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer'
              }}
            >
              Usar YouTube Music
            </button>
            <button
              onClick={() => setIsSpotifyDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title="Cerrar aviso"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Chrome DevTools Responsive Device Toolbar */}
      {responsiveMode.enabled && !isMobile && (
        <ResponsiveDeviceBar
          responsiveMode={responsiveMode}
          onChangeResponsiveMode={(upd) => setResponsiveMode((prev) => ({ ...prev, ...upd }))}
          onClose={() => setResponsiveMode((prev) => ({ ...prev, enabled: false }))}
        />
      )}

      {/* Main Webviews & New Tab Pages Viewport */}
      <ErrorBoundary>
        <WebviewContainer
          isMobile={isMobile}
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={(id) => setActiveTabId(id)}
          onCloseTab={handleCloseTab}
          onNewTab={() => handleNewTab()}
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
          splitMode={splitMode}
          onChangeSplitMode={handleSplitModeChange}
          responsiveMode={responsiveMode}
          isDevInspectorOpen={Boolean(inspectedElement)}
          devDrawerWidth={480}
        />
      </ErrorBoundary>

      {/* Binance Crypto Hub Drawer */}
      <BinanceWidget
        isOpen={isBinanceOpen}
        onClose={() => setIsBinanceOpen(false)}
        selectedBrokerId={selectedCryptoBroker}
        onSelectBroker={(brokerId) => {
          setSelectedCryptoBroker(brokerId);
          localStorage.setItem('dozzo_crypto_broker', brokerId);
        }}
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
          isResponsiveActive={responsiveMode.enabled}
          onToggleResponsive={() => setResponsiveMode((prev) => ({ ...prev, enabled: !prev.enabled }))}
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
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
      />

      {/* Proactive Update Notification Modal */}
      <UpdateNotificationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          if (activeUpdateData?.latestVersion) {
            localStorage.setItem(`dozzo_dismissed_v${activeUpdateData.latestVersion}`, 'true');
          }
        }}
        updateData={activeUpdateData}
        isElectronDownloaded={isElectronDownloaded}
        onInstallElectronUpdate={() => window.browserAPI?.installUpdate?.()}
      />

      {/* Windows PC Installation Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />
    </div>
  );
}
