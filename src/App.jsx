import React, { useState, useEffect, useRef } from 'react';
import { Code2, X, ChevronDown, ChevronUp } from 'lucide-react';
import MacSidebar from './components/MacSidebar';
import SideAppDrawer from './components/SideAppDrawer';
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
import MobileBrowserUI from './components/MobileBrowserUI';
import ResponsiveDeviceBar from './components/ResponsiveDeviceBar';
import UpdateNotificationModal from './components/UpdateNotificationModal';
import InstallGuideModal from './components/InstallGuideModal';
import { checkForLatestRelease } from './utils/updateChecker';

export default function App() {
  const initialTabUrl = new URLSearchParams(window.location.search).get('initialUrl') || '';

  // Responsive Mobile & Tablet Detection (Dedicated Mobile Experience <= 1024px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTouchMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return window.innerWidth <= 1024 || isTouchMobile;
  });

  // Mobile Launch Splash Screen (0.3s black screen with Dozzo logo in center)
  const [showMobileSplash, setShowMobileSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTouchMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return window.innerWidth <= 1024 || isTouchMobile;
  });
  const [isSplashFading, setIsSplashFading] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileSplash(false);
      return;
    }
    const fadeTimer = setTimeout(() => {
      setIsSplashFading(true);
    }, 300); // 0.3s
    const hideTimer = setTimeout(() => {
      setShowMobileSplash(false);
    }, 550); // smooth fade duration
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const isTouchMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(window.innerWidth <= 1024 || isTouchMobile);
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
  const [isViewingHome, setIsViewingHome] = useState(() => !initialTabUrl);

  // Appearance & Curated 10 Themes System (Default: 'obsidian-aurora')
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('dozzo_theme');
    if (!saved || saved === 'dark') return 'obsidian-aurora';
    if (saved === 'light') return 'mac-snow';
    return saved;
  });
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('dozzo_accent') || 'none');
  const [splitMode, setSplitMode] = useState(() => localStorage.getItem('dozzo_split_mode') || 'single');
  const [searchEngine, setSearchEngine] = useState(() => localStorage.getItem('dozzo_engine') || 'duckduckgo');
  const [showBookmarksBar, setShowBookmarksBar] = useState(() => localStorage.getItem('dozzo_bookmarks_visible') !== 'false');
  // Dual Auto-Hiding Overlays (Top Navbar & Lateral Sidebar)
  const [activeSideApp, setActiveSideApp] = useState(null);
  const [isHeaderPinned, setIsHeaderPinned] = useState(() => {
    return localStorage.getItem('dozzo_header_pinned') === 'true';
  });
  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [isOmniFocused, setIsOmniFocused] = useState(false);
  const topHoverTimerRef = useRef(null);

  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const sidebarHoverTimerRef = useRef(null);

  const handleTogglePinHeader = () => {
    setIsHeaderPinned((prev) => {
      const next = !prev;
      localStorage.setItem('dozzo_header_pinned', String(next));
      if (next) {
        setIsHoveringTop(true);
      }
      return next;
    });
  };

  const handleTopMouseEnter = () => {
    if (topHoverTimerRef.current) {
      clearTimeout(topHoverTimerRef.current);
      topHoverTimerRef.current = null;
    }
    setIsHoveringTop(true);
  };

  const handleTopMouseLeave = () => {
    if (topHoverTimerRef.current) {
      clearTimeout(topHoverTimerRef.current);
    }
    topHoverTimerRef.current = setTimeout(() => {
      // Don't auto-hide if user is actively interacting with the Omnibar or header is pinned
      if (!isOmniFocused && !isHeaderPinned) {
        setIsHoveringTop(false);
      }
    }, 450); // 450ms smooth buffer
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarHoverTimerRef.current) {
      clearTimeout(sidebarHoverTimerRef.current);
      sidebarHoverTimerRef.current = null;
    }
    setIsHoveringSidebar(true);
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarHoverTimerRef.current) {
      clearTimeout(sidebarHoverTimerRef.current);
    }
    sidebarHoverTimerRef.current = setTimeout(() => {
      // Keep open if user has an active side app drawer open (WhatsApp, Instagram, etc.)
      if (!activeSideApp) {
        setIsHoveringSidebar(false);
      }
    }, 450); // 450ms smooth buffer
  };

  const isTopBarVisible = isHeaderPinned || isHoveringTop || isOmniFocused;
  const isSidebarVisible = isHoveringSidebar || Boolean(activeSideApp);

  const handleSplitModeChange = (mode) => {
    setSplitMode(mode);
    localStorage.setItem('dozzo_split_mode', mode);
  };

  const handleScrollDirection = (direction) => {
    // Canvas handles scroll natively without layout thrashing
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
      } catch (e) { }
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

  // Close side app drawer when clicking outside with safety margin (Request 4)
  useEffect(() => {
    if (!activeSideApp) return;

    const handleWindowMouseDown = (e) => {
      // Don't close if clicking inside left sidebar dock or the side drawer element itself
      if (e.target && (e.target.closest?.('.dozzo-mac-sidebar') || e.target.closest?.('.dozzo-side-drawer'))) {
        return;
      }
      if (e.clientX <= 54) return;

      let currentDrawerW = 440;
      try {
        const drawerEl = document.querySelector('.dozzo-side-drawer');
        if (drawerEl) {
          currentDrawerW = drawerEl.getBoundingClientRect().width;
        } else {
          const saved = localStorage.getItem('dozzo_side_drawer_width');
          if (saved) {
            const val = parseInt(saved, 10);
            if (!isNaN(val)) currentDrawerW = val;
          }
        }
      } catch (_) {}

      // Add 28px safety buffer margin so dragging/resizing near the edge never triggers premature closing
      const boundaryX = 54 + currentDrawerW + 28;
      if (e.clientX > boundaryX) {
        setActiveSideApp(null);
      }
    };

    window.addEventListener('mousedown', handleWindowMouseDown);
    return () => window.removeEventListener('mousedown', handleWindowMouseDown);
  }, [activeSideApp]);

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
      } catch (e) { }
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

  const handleCheckUpdates = async () => {
    try {
      const release = await checkForLatestRelease(true);
      if (release && release.hasUpdate) {
        setActiveUpdateData(release);
        setIsUpdateModalOpen(true);
      } else {
        setIsSettingsOpen(true);
      }
    } catch (e) {
      setIsSettingsOpen(true);
    }
  };

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
      const existing = prev.find((h) => h.url === entry.url);
      const filtered = prev.filter((h) => h.url !== entry.url);
      const updated = [
        {
          id: Date.now().toString(),
          title: entry.title || entry.url,
          url: entry.url,
          timestamp: Date.now(),
          favicon: entry.favicon || existing?.favicon || null,
          preview: entry.preview || existing?.preview || null
        },
        ...filtered
      ].slice(0, 500);
      try {
        localStorage.setItem('dozzo_browser_history', JSON.stringify(updated));
      } catch (err) {
        // Prune older screenshots to fit in localStorage quota
        const pruned = updated.map((item, idx) => idx > 15 ? { ...item, preview: null } : item);
        try { localStorage.setItem('dozzo_browser_history', JSON.stringify(pruned)); } catch (_) { }
      }
      return updated;
    });
  };

  // Tab Operations
  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab && targetTab.url && !targetTab.isNewTab) {
      setIsViewingHome(false);
    } else {
      setIsViewingHome(true);
    }
  };

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
    setIsViewingHome(!url);
  };

  const handleOpenApp = (url) => {
    setIsViewingHome(false);
    try {
      const targetHost = new URL(url).hostname;
      const existingTab = tabs.find((t) => t.url && t.url.includes(targetHost));
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }
    } catch (_) { }
    handleNewTab(url);
  };

  const handleCloseTab = (tabIdToClose) => {
    const newTabs = tabs.filter((t) => t.id !== tabIdToClose);

    // If no tabs remain, create a fresh New Tab and immediately update activeTabId and isViewingHome
    if (newTabs.length === 0) {
      const resetId = `tab-${Date.now()}`;
      const defaultTab = {
        id: resetId,
        title: 'Nueva Pestaña',
        url: '',
        favicon: null,
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        isAudioPlaying: false,
        isNewTab: true
      };
      setTabs([defaultTab]);
      setActiveTabId(resetId);
      setIsViewingHome(true);
      return;
    }

    const currentIndex = tabs.findIndex((t) => t.id === tabIdToClose);
    if (activeTabId === tabIdToClose) {
      const nextIndex = Math.max(0, Math.min(currentIndex, newTabs.length - 1));
      const nextTab = newTabs[nextIndex];
      setActiveTabId(nextTab.id);
      setIsViewingHome(Boolean(!nextTab.url || nextTab.isNewTab));
    }
    setTabs(newTabs);
  };

  const handleGoHome = () => {
    const curTab = tabs.find((t) => t.id === activeTabId);
    if (!curTab || curTab.isNewTab || !curTab.url) {
      setIsViewingHome(true);
      return;
    }
    handleNewTab();
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
    setIsViewingHome(true);
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
          } catch (e) { }
        }
      } catch (e) { }
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
            addToHistory({ url: updates.url, title: next.title, favicon: next.favicon, preview: next.preview });
          } else if (updates.title && next.url && !t.isNewTab) {
            addToHistory({ url: next.url, title: updates.title, favicon: next.favicon, preview: next.preview });
          } else if (updates.preview && next.url && !t.isNewTab) {
            addToHistory({ url: next.url, title: next.title, favicon: next.favicon, preview: updates.preview });
          }
          return next;
        }
        return t;
      })
    );
  };

  const handleNavigate = (url) => {
    setIsViewingHome(false);
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
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <MobileBrowserUI
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
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
            searchEngine={searchEngine}
            blockedCount={blockedCount}
            onToggleShieldModal={() => setIsShieldOpen(true)}
            selectedCryptoBroker={selectedCryptoBroker}
            onOpenBinance={() => setIsBinanceOpen(true)}
            onOpenDownloads={() => setIsDownloadsOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'mac-snow' ? 'obsidian-aurora' : 'mac-snow')}
            isBookmarked={isCurrentBookmarked}
            onToggleBookmark={handleToggleBookmark}
          />

          {/* Dedicated Mobile Webview & NewTabPage Viewport between top bar (56px) and bottom bar (56px) */}
          <div
            style={{
              position: 'absolute',
              top: '56px',
              bottom: '56px',
              left: 0,
              right: 0,
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10
            }}
          >
            <ErrorBoundary>
              <WebviewContainer
                isMobile={true}
                tabs={tabs}
                activeTabId={activeTabId}
                isViewingHome={isViewingHome}
                history={history}
                onSelectTab={handleSelectTab}
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
                isInspectorActive={false}
                splitMode="single"
                responsiveMode={null}
              />
            </ErrorBoundary>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1, minHeight: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Top Edge Hover Trigger (activates sliding top navbar) */}
          <div
            className="top-hover-trigger"
            onMouseEnter={handleTopMouseEnter}
          />

          {/* Left Edge Hover Trigger (activates sliding lateral sidebar) */}
          <div
            className="sidebar-hover-trigger"
            onMouseEnter={handleSidebarMouseEnter}
          />

          {/* 1. TOP NAVBAR SLIDING OVERLAY (macOS Traffic Dots on Left + Omnibar + Nav controls) */}
          <div
            className="top-navbar-sliding-overlay"
            style={{
              transform: isTopBarVisible ? 'translateY(0)' : 'translateY(-100%)',
              opacity: isTopBarVisible ? 1 : 0,
              pointerEvents: isTopBarVisible ? 'auto' : 'none',
              boxShadow: isTopBarVisible ? '0 12px 36px rgba(0, 0, 0, 0.65)' : 'none'
            }}
            onMouseEnter={handleTopMouseEnter}
            onMouseLeave={handleTopMouseLeave}
          >
            <NavigationBar
              currentUrl={isViewingHome || activeTab?.isNewTab ? '' : activeTab?.url}
              isLoading={activeTab?.isLoading}
              canGoBack={activeTab?.canGoBack}
              canGoForward={activeTab?.canGoForward}
              onNavigate={handleNavigate}
              onGoBack={handleGoBack}
              onGoForward={handleGoForward}
              onReload={handleReload}
              onStop={handleStop}
              searchEngine={searchEngine}
              isBookmarked={isCurrentBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onToggleInspector={() => setIsInspectorActive((prev) => !prev)}
              isInspectorActive={isInspectorActive}
              history={history}
              onCloseWindow={() => window.browserAPI?.close?.()}
              onMinimizeWindow={() => window.browserAPI?.minimize?.()}
              onMaximizeWindow={() => window.browserAPI?.maximize?.()}
              onFocusChange={(focused) => setIsOmniFocused(focused)}
              isHeaderPinned={isHeaderPinned}
              onTogglePinHeader={handleTogglePinHeader}
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
                    <strong>Modo Dev Studio Activo:</strong> Mueve el mouse sobre cualquier botón, tarjeta o elemento y <strong>haz clic</strong> para inspeccionarlo y clonarlo a <strong>React (JSX)</strong> y <strong>Figma</strong>.
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
          </div>

          {/* 2. LATERAL SIDEBAR SLIDING OVERLAY (macOS Vertical Tabs & Quick Apps) */}
          <div
            className="sidebar-sliding-overlay"
            style={{
              transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
              opacity: isSidebarVisible ? 1 : 0,
              pointerEvents: isSidebarVisible ? 'auto' : 'none',
              boxShadow: isSidebarVisible ? '12px 0 36px rgba(0, 0, 0, 0.65)' : 'none'
            }}
            onMouseEnter={handleSidebarMouseEnter}
            onMouseLeave={handleSidebarMouseLeave}
          >
            <MacSidebar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={(id) => {
                setIsViewingHome(false);
                setActiveTabId(id);
              }}
              onCloseTab={handleCloseTab}
              onNewTab={() => handleNewTab()}
              onGoHome={handleGoHome}
              onTabContextMenu={(e, tabId) => {
                setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetTabId: tabId });
              }}
              onSelectSideApp={(app) => {
                if (activeSideApp?.id === app.id) {
                  setActiveSideApp(null);
                } else {
                  setActiveSideApp(app);
                  setIsHoveringSidebar(true);
                }
              }}
              activeSideApp={activeSideApp}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Floating Flyout Drawer for WhatsApp, Instagram, etc. */}
            <SideAppDrawer
              app={activeSideApp}
              isOpen={Boolean(activeSideApp)}
              onClose={() => setActiveSideApp(null)}
              onOpenInMainTab={(url) => {
                handleNewTab(url);
                setActiveSideApp(null);
              }}
            />
          </div>

          {/* 3. MAIN FULL-CANVAS WEBVIEW CONTAINER */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              paddingTop: isHeaderPinned ? (showBookmarksBar ? '78px' : '46px') : 0,
              transition: 'padding-top 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
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
                isViewingHome={isViewingHome}
                history={history}
                onSelectTab={handleSelectTab}
                onCloseTab={handleCloseTab}
                onNewTab={() => handleNewTab()}
                onCloseAllTabs={handleCloseAllTabs}
                onUpdateTab={handleUpdateTab}
                onNewTabWithUrl={(url) => handleNewTab(url)}
                onNavigate={handleNavigate}
                searchEngine={searchEngine}
                onChangeSearchEngine={(eng) => setSearchEngine(eng)}
                blockedCount={blockedCount}
                onOpenBinance={() => setIsBinanceOpen(true)}
                onOpenDownloads={() => setIsDownloadsOpen(true)}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onToggleShieldModal={() => setIsShieldOpen(true)}
                theme={theme}
                onToggleTheme={() => setTheme(theme === 'mac-snow' ? 'obsidian-aurora' : 'mac-snow')}
                isBookmarked={isCurrentBookmarked}
                onToggleBookmark={handleToggleBookmark}
                onGoBack={handleGoBack}
                onGoForward={handleGoForward}
                onReload={handleReload}
                onStop={handleStop}
                selectedCryptoBroker={selectedCryptoBroker}
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
          </div>
        </div>
      )}

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
        onCloseTab={() => handleCloseTab(contextMenu.targetTabId || activeTabId)}
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

      {/* Shield Details Modal */}
      <ShieldModal
        isOpen={isShieldOpen}
        onClose={() => setIsShieldOpen(false)}
        blockedCount={blockedCount}
        isShieldActive={isShieldActive}
        onToggleShield={handleToggleShield}
        onResetStats={handleResetStats}
      />

      {/* Settings Modal (10 Themes Included) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        searchEngine={searchEngine}
        onChangeSearchEngine={(eng) => {
          setSearchEngine(eng);
          localStorage.setItem('dozzo_engine', eng);
        }}
        theme={theme}
        onSelectTheme={(t) => setTheme(t)}
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

      {/* Mobile Native 0.3s Splash Screen: Black Background with Centered Dozzo Logo */}
      {showMobileSplash && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            opacity: isSplashFading ? 0 : 1,
            pointerEvents: isSplashFading ? 'none' : 'auto',
            transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <img
            src="./Logo.svg"
            alt="Dozzo"
            style={{
              width: '84px',
              height: '84px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 24px rgba(255, 255, 255, 0.35))'
            }}
          />
        </div>
      )}
    </div>

  );
}
