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

  // Closed tabs history for Ctrl+Shift+T restoration
  const [closedTabsHistory, setClosedTabsHistory] = useState([]);

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

  // ==========================================
  // Comprehensive Keyboard Shortcuts Suite (50+ Shortcuts)
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;
      const key = e.key;
      const lowerKey = key.toLowerCase();
      const code = e.code;
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      );

      const curWv = webviewRefs.current.get(activeTabId);

      // --- GRUPO 1: PESTAÑAS Y VENTANAS ---
      // 1. Ctrl + T: Nueva Pestaña
      if (isCmdOrCtrl && !isShift && !isAlt && lowerKey === 't') {
        e.preventDefault();
        handleNewTab();
        return;
      }
      // 2. Ctrl + Shift + T: Restaurar Pestaña Cerrada
      if (isCmdOrCtrl && isShift && !isAlt && (lowerKey === 't' || key === 'T')) {
        e.preventDefault();
        handleRestoreClosedTab();
        return;
      }
      // 3. Ctrl + W: Cerrar Pestaña Actual
      if (isCmdOrCtrl && !isShift && !isAlt && lowerKey === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
        return;
      }
      // 4. Ctrl + Shift + W: Cerrar Todas las Pestañas
      if (isCmdOrCtrl && isShift && !isAlt && (lowerKey === 'w' || key === 'W')) {
        e.preventDefault();
        handleCloseAllTabs();
        return;
      }
      // 5. Ctrl + Tab: Pestaña Siguiente
      if (isCmdOrCtrl && !isShift && !isAlt && (key === 'Tab' || code === 'Tab')) {
        e.preventDefault();
        if (tabs.length > 1) {
          const idx = tabs.findIndex((t) => t.id === activeTabId);
          const nextIdx = (idx + 1) % tabs.length;
          handleSelectTab(tabs[nextIdx].id);
        }
        return;
      }
      // 6. Ctrl + Shift + Tab: Pestaña Anterior
      if (isCmdOrCtrl && isShift && !isAlt && (key === 'Tab' || code === 'Tab')) {
        e.preventDefault();
        if (tabs.length > 1) {
          const idx = tabs.findIndex((t) => t.id === activeTabId);
          const prevIdx = (idx - 1 + tabs.length) % tabs.length;
          handleSelectTab(tabs[prevIdx].id);
        }
        return;
      }
      // 7-14. Ctrl + 1..8: Ir directamente a pestaña 1 a 8
      if (isCmdOrCtrl && !isShift && !isAlt && /^[1-8]$/.test(key)) {
        e.preventDefault();
        const targetIndex = parseInt(key, 10) - 1;
        if (tabs[targetIndex]) {
          handleSelectTab(tabs[targetIndex].id);
        }
        return;
      }
      // 15. Ctrl + 9: Ir a la última pestaña
      if (isCmdOrCtrl && !isShift && !isAlt && key === '9') {
        e.preventDefault();
        if (tabs.length > 0) {
          handleSelectTab(tabs[tabs.length - 1].id);
        }
        return;
      }
      // 16. Ctrl + N: Nueva Ventana
      if (isCmdOrCtrl && !isShift && !isAlt && lowerKey === 'n') {
        e.preventDefault();
        if (window.browserAPI?.openNewWindow) {
          window.browserAPI.openNewWindow();
        } else {
          window.open(window.location.origin, '_blank');
        }
        return;
      }
      // 17. Ctrl + Shift + N: Ventana Privada / Incógnito
      if (isCmdOrCtrl && isShift && !isAlt && (lowerKey === 'n' || key === 'N')) {
        e.preventDefault();
        if (window.browserAPI?.openIncognitoWindow) {
          window.browserAPI.openIncognitoWindow();
        } else {
          handleNewTab('https://duckduckgo.com');
        }
        return;
      }
      // 18. Ctrl + M: Minimizar Ventana
      if (isCmdOrCtrl && !isShift && !isAlt && lowerKey === 'm') {
        e.preventDefault();
        if (window.browserAPI?.minimizeWindow) {
          window.browserAPI.minimizeWindow();
        }
        return;
      }

      // --- GRUPO 2: NAVEGACIÓN Y RECARGA ---
      // 19. Alt + Left / Backspace: Retroceder
      if ((isAlt && key === 'ArrowLeft') || (!isInput && key === 'Backspace' && !isCmdOrCtrl && !isAlt)) {
        e.preventDefault();
        handleGoBack();
        return;
      }
      // 20. Alt + Right / Shift + Backspace: Avanzar
      if ((isAlt && key === 'ArrowRight') || (!isInput && isShift && key === 'Backspace')) {
        e.preventDefault();
        handleGoForward();
        return;
      }
      // 21. Ctrl + R / F5: Recargar Página Web
      if ((isCmdOrCtrl && !isShift && lowerKey === 'r') || (key === 'F5' && !isShift && !isCmdOrCtrl)) {
        e.preventDefault();
        handleReload();
        return;
      }
      // 22. Ctrl + Shift + R / Ctrl + F5: Recarga Forzada (Hard Reload)
      if ((isCmdOrCtrl && isShift && (lowerKey === 'r' || key === 'R')) || (isCmdOrCtrl && key === 'F5')) {
        e.preventDefault();
        if (curWv && typeof curWv.reloadIgnoringCache === 'function') {
          curWv.reloadIgnoringCache();
        } else {
          window.location.reload();
        }
        return;
      }
      // 23. Escape: Detener Carga o Cerrar Modales Activos
      if (key === 'Escape') {
        e.preventDefault();
        if (isUpdateModalOpen) setIsUpdateModalOpen(false);
        else if (isInstallGuideOpen) setIsInstallGuideOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isDownloadsOpen) setIsDownloadsOpen(false);
        else if (isHistoryOpen) setIsHistoryOpen(false);
        else if (isShieldOpen) setIsShieldOpen(false);
        else if (isBinanceOpen) setIsBinanceOpen(false);
        else if (activeSideApp) setActiveSideApp(null);
        else if (isInspectorActive) setIsInspectorActive(false);
        else handleStop();
        return;
      }
      // 24. Alt + Home: Ir a Inicio / Nueva Pestaña Dozzo
      if (isAlt && key === 'Home') {
        e.preventDefault();
        handleGoHome();
        return;
      }
      // 25. Ctrl + L / Alt + D / F6: Enfocar Barra de Direcciones
      if ((isCmdOrCtrl && !isShift && lowerKey === 'l') || (isAlt && lowerKey === 'd') || key === 'F6') {
        e.preventDefault();
        const omni = document.querySelector('.omni-input, .dozzo-omni-input, input[placeholder*="Buscar"], input[placeholder*="Search"]');
        if (omni) {
          omni.focus();
          omni.select?.();
        }
        return;
      }
      // 26. Ctrl + K / Ctrl + E: Búsqueda Rápida
      if (isCmdOrCtrl && (lowerKey === 'k' || lowerKey === 'e')) {
        e.preventDefault();
        const omni = document.querySelector('.omni-input, .dozzo-omni-input, input[placeholder*="Buscar"]');
        if (omni) {
          omni.focus();
          omni.select?.();
        }
        return;
      }

      // --- GRUPO 3: VISTA DIVIDIDA Y MULTITAREA (SPLIT VIEW) ---
      // 27. Alt + 1: Vista Individual (1 Pantalla)
      if (isAlt && !isCmdOrCtrl && key === '1') {
        e.preventDefault();
        handleSplitModeChange('single');
        return;
      }
      // 28. Alt + 2: Vista Dividida Horizontal (2 Pantallas)
      if (isAlt && !isCmdOrCtrl && key === '2') {
        e.preventDefault();
        handleSplitModeChange('dual-horizontal');
        return;
      }
      // 29. Alt + 3: Vista Dividida Vertical (2 Pantallas)
      if (isAlt && !isCmdOrCtrl && key === '3') {
        e.preventDefault();
        handleSplitModeChange('dual-vertical');
        return;
      }
      // 30. Alt + 4: Vista Cuadrícula (4 Pantallas)
      if (isAlt && !isCmdOrCtrl && key === '4') {
        e.preventDefault();
        handleSplitModeChange('grid-4');
        return;
      }
      // 31. Alt + S: Desacoplar Pestaña (Pop Out en ventana separada)
      if (isAlt && !isCmdOrCtrl && lowerKey === 's') {
        e.preventDefault();
        handlePopOutTab(activeTabId);
        return;
      }

      // --- GRUPO 4: PANELES LATERALES, HISTORIAL Y MODALES ---
      // 32. Ctrl + J: Panel de Descargas
      if (isCmdOrCtrl && !isShift && lowerKey === 'j') {
        e.preventDefault();
        setIsDownloadsOpen((prev) => !prev);
        return;
      }
      // 33. Ctrl + H / Ctrl + Y: Historial de Navegación
      if (isCmdOrCtrl && !isShift && (lowerKey === 'h' || lowerKey === 'y')) {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
        return;
      }
      // 34. Ctrl + D: Guardar / Quitar Marcador (Bookmark)
      if (isCmdOrCtrl && !isShift && lowerKey === 'd') {
        e.preventDefault();
        handleToggleBookmark();
        return;
      }
      // 35. Ctrl + B / Ctrl + Shift + B: Barra / Gestor de Marcadores
      if (isCmdOrCtrl && lowerKey === 'b') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
        return;
      }
      // 36. Ctrl + , (Coma): Configuración de Dozzo
      if (isCmdOrCtrl && (key === ',' || code === 'Comma')) {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
        return;
      }
      // 37. Alt + B: Panel Cripto & Binance Watchlist
      if (isAlt && !isCmdOrCtrl && lowerKey === 'b') {
        e.preventDefault();
        setIsBinanceOpen((prev) => !prev);
        return;
      }
      // 38. Alt + C: SideApp ChatGPT IA
      if (isAlt && !isCmdOrCtrl && lowerKey === 'c') {
        e.preventDefault();
        setActiveSideApp((prev) => (prev === 'chatgpt' ? null : 'chatgpt'));
        return;
      }
      // 39. Alt + W: SideApp WhatsApp
      if (isAlt && !isCmdOrCtrl && lowerKey === 'w') {
        e.preventDefault();
        setActiveSideApp((prev) => (prev === 'whatsapp' ? null : 'whatsapp'));
        return;
      }
      // 40. Alt + P: Dozzo Shield (Bloqueador de Anuncios)
      if (isAlt && !isCmdOrCtrl && lowerKey === 'p') {
        e.preventDefault();
        setIsShieldOpen((prev) => !prev);
        return;
      }
      // 41. Alt + N: SideApp Notas Rápidas
      if (isAlt && !isCmdOrCtrl && lowerKey === 'n') {
        e.preventDefault();
        setActiveSideApp((prev) => (prev === 'notes' ? null : 'notes'));
        return;
      }
      // 42. Alt + T: Alternar Tema Claro / Oscuro
      if (isAlt && !isCmdOrCtrl && lowerKey === 't') {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
        return;
      }

      // --- GRUPO 5: ZOOM, PANTALLA Y VISUALIZACIÓN ---
      // 43. Ctrl + + / Ctrl + = / Ctrl + NumpadAdd: Aumentar Zoom
      if (isCmdOrCtrl && (key === '+' || key === '=' || code === 'NumpadAdd')) {
        e.preventDefault();
        if (curWv && typeof curWv.getZoomLevel === 'function') {
          curWv.getZoomLevel((lvl) => curWv.setZoomLevel(lvl + 0.5));
        }
        return;
      }
      // 44. Ctrl + - / Ctrl + _ / Ctrl + NumpadSubtract: Reducir Zoom
      if (isCmdOrCtrl && (key === '-' || key === '_' || code === 'NumpadSubtract')) {
        e.preventDefault();
        if (curWv && typeof curWv.getZoomLevel === 'function') {
          curWv.getZoomLevel((lvl) => curWv.setZoomLevel(lvl - 0.5));
        }
        return;
      }
      // 45. Ctrl + 0 / Ctrl + Numpad0: Restablecer Zoom al 100%
      if (isCmdOrCtrl && (key === '0' || code === 'Numpad0')) {
        e.preventDefault();
        if (curWv && typeof curWv.setZoomLevel === 'function') {
          curWv.setZoomLevel(0);
        }
        return;
      }
      // 46. F11: Pantalla Completa
      if (key === 'F11') {
        e.preventDefault();
        if (window.browserAPI?.toggleFullScreen) {
          window.browserAPI.toggleFullScreen();
        } else if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        return;
      }
      // 47. Alt + Up: Scroll Hacia Arriba Rápido
      if (isAlt && key === 'ArrowUp' && !isInput) {
        e.preventDefault();
        if (curWv && typeof curWv.executeJavaScript === 'function') {
          curWv.executeJavaScript('window.scrollBy({ top: -450, behavior: "smooth" })');
        } else {
          window.scrollBy({ top: -450, behavior: 'smooth' });
        }
        return;
      }
      // 48. Alt + Down: Scroll Hacia Abajo Rápido
      if (isAlt && key === 'ArrowDown' && !isInput) {
        e.preventDefault();
        if (curWv && typeof curWv.executeJavaScript === 'function') {
          curWv.executeJavaScript('window.scrollBy({ top: 450, behavior: "smooth" })');
        } else {
          window.scrollBy({ top: 450, behavior: 'smooth' });
        }
        return;
      }

      // --- GRUPO 6: HERRAMIENTAS DE DESARROLLADOR Y DEV STUDIO ---
      // 49. F12 / Ctrl + Shift + I: Inspeccionar / Alternar DevTools
      if (key === 'F12' || (isCmdOrCtrl && isShift && (lowerKey === 'i' || key === 'I'))) {
        e.preventDefault();
        if (curWv && typeof curWv.openDevTools === 'function') {
          if (curWv.isDevToolsOpened && curWv.isDevToolsOpened()) {
            curWv.closeDevTools();
          } else {
            curWv.openDevTools();
          }
        }
        return;
      }
      // 50. Ctrl + Shift + M: Modo Dispositivo Responsive (Mobile DevMode)
      if (isCmdOrCtrl && isShift && (lowerKey === 'm' || key === 'M')) {
        e.preventDefault();
        setResponsiveMode((prev) => ({ ...prev, enabled: !prev.enabled }));
        return;
      }
      // 51. Ctrl + Shift + C: Selector de Elemento Inspector
      if (isCmdOrCtrl && isShift && (lowerKey === 'c' || key === 'C')) {
        e.preventDefault();
        setIsInspectorActive((prev) => !prev);
        return;
      }
      // 52. Ctrl + U: Ver Código Fuente de la Página
      if (isCmdOrCtrl && !isShift && !isAlt && lowerKey === 'u') {
        e.preventDefault();
        const tab = tabs.find((t) => t.id === activeTabId);
        if (tab && tab.url && !tab.isNewTab) {
          handleNewTab(`view-source:${tab.url}`);
        }
        return;
      }

      // --- GRUPO 7: ACCIONES DE PÁGINA Y PORTAPAPELES ---
      // 53. Ctrl + P: Imprimir Página Web
      if (isCmdOrCtrl && !isShift && !isAlt && lowerKey === 'p') {
        e.preventDefault();
        if (curWv && typeof curWv.print === 'function') {
          curWv.print();
        } else {
          window.print();
        }
        return;
      }
      // 54. Ctrl + Shift + Delete: Limpiar Historial y Datos de Navegación
      if (isCmdOrCtrl && isShift && (key === 'Delete' || code === 'Delete')) {
        e.preventDefault();
        setHistory([]);
        localStorage.removeItem('dozzo_browser_history');
        setIsHistoryOpen(true);
        return;
      }
      // 55. Space / Shift + Space: Scroll Por Pantalla
      if (key === ' ' && !isInput && !isCmdOrCtrl && !isAlt) {
        e.preventDefault();
        const scrollDelta = isShift ? -window.innerHeight * 0.8 : window.innerHeight * 0.8;
        if (curWv && typeof curWv.executeJavaScript === 'function') {
          curWv.executeJavaScript(`window.scrollBy({ top: ${scrollDelta}, behavior: "smooth" })`);
        } else {
          window.scrollBy({ top: scrollDelta, behavior: 'smooth' });
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTabId,
    tabs,
    closedTabsHistory,
    isUpdateModalOpen,
    isInstallGuideOpen,
    isSettingsOpen,
    isDownloadsOpen,
    isHistoryOpen,
    isShieldOpen,
    isBinanceOpen,
    activeSideApp,
    isInspectorActive,
    responsiveMode
  ]);

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
    const tabClosing = tabs.find((t) => t.id === tabIdToClose);
    if (tabClosing && tabClosing.url && !tabClosing.isNewTab) {
      setClosedTabsHistory((prev) => [tabClosing, ...prev].slice(0, 30));
    }

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

  const handleRestoreClosedTab = () => {
    if (!closedTabsHistory || closedTabsHistory.length === 0) return;
    const [tabToRestore, ...rest] = closedTabsHistory;
    setClosedTabsHistory(rest);
    if (tabToRestore && tabToRestore.url) {
      handleNewTab(tabToRestore.url);
    }
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
