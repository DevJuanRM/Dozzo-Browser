'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState
} from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence
} from 'framer-motion';
import {
  Plus,
  X,
  Volume2,
  Globe,
  FileText,
  Bot,
  Settings,
  Home
} from 'lucide-react';

// Official SVG Brand Icons with pixel-perfect vectors (Strictly Monochrome)
const AppIcons = {
  WhatsApp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1 3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9.5 9a.5.5 0 0 0-.5.5v.5c0 2 2.5 4.5 4.5 4.5h.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5l-1-.2a.5.5 0 0 0-.5.2l-.3.3c-.5-.3-1.1-.9-1.4-1.4l.3-.3a.5.5 0 0 0 .2-.5l-.2-1a.5.5 0 0 0-.5-.5z" />
    </svg>
  ),
  Instagram: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Figma: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.666 0 3.019-1.353 3.019-3.019s-1.353-3.019-3.019-3.019h-3.117V7.51zm0 1.471h-4.588c-2.476 0-4.49-2.015-4.49-4.491S5.671 0 8.147 0h4.588v8.981zm-4.588-7.51c-1.666 0-3.019 1.353-3.019 3.019s1.353 3.019 3.019 3.019h3.117V1.471H8.147zm0 15.019c-2.476 0-4.49-2.015-4.49-4.491 0-2.476 2.014-4.49 4.49-4.49h4.588v8.981H8.147zm0-7.51c-1.666 0-3.019 1.353-3.019 3.019s1.353 3.019 3.019 3.019h3.117V8.98H8.147zm0 15.02c-2.476 0-4.49-2.015-4.49-4.491 0-2.476 2.014-4.49 4.49-4.49h1.471v4.49c0 2.477-2.014 4.491-4.49 4.491zm0-7.51c-1.666 0-3.019 1.353-3.019 3.019s1.353 3.019 3.019 3.019h1.471v-6.038H8.147zm7.705-1.472c2.476 0 4.49-2.014 4.49-4.49 0-2.476-2.014-4.491-4.49-4.491h-4.588v8.981h4.588zm0-7.51c1.666 0 3.019 1.353 3.019 3.019s-1.353 3.019-3.019 3.019h-3.117V8.98h3.117z" />
    </svg>
  ),
  Slack: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  ),
  TwitterX: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Notes: () => <FileText size={18} strokeWidth={2} />,
  AI: () => <Bot size={18} strokeWidth={2} />,
  Coinbase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-19.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm-2.25 5.25h4.5a2.25 2.25 0 0 1 2.25 2.25v0a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 7.5 12v0a2.25 2.25 0 0 1 2.25-2.25z" />
    </svg>
  ),
  Polymarket: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7.7v8.6L12 22l10-5.7V7.7L12 2zm0 2.9l7.5 4.3v6.6L12 19.1l-7.5-4.3V9.2L12 4.9zm-4.5 4.8L12 12l4.5-2.3L12 7.4 7.5 9.7zm0 4.6L12 16.6l4.5-2.3L12 12l-4.5 2.3z" />
    </svg>
  ),
  Settings: () => <Settings size={18} strokeWidth={2} />
};

// Exactly 7 quick apps requested by user (Strictly monochrome, neutral styling)
const QUICK_APPS = [
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: AppIcons.WhatsApp },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', icon: AppIcons.Instagram },
  { id: 'figma', name: 'Figma', url: 'https://www.figma.com', icon: AppIcons.Figma },
  { id: 'slack', name: 'Slack', url: 'https://app.slack.com/client', icon: AppIcons.Slack },
  { id: 'twitter', name: 'Twitter / X', url: 'https://x.com', icon: AppIcons.TwitterX },
  { id: 'notes', name: 'Notas', isCustomComponent: true, icon: AppIcons.Notes },
  { id: 'ai', name: 'ChatGPT IA', url: 'https://chatgpt.com', icon: AppIcons.AI }
];

// Vertical Dock Context
const VerticalDockContext = createContext({
  mouseY: null,
  distance: 100,
  maxScale: 1.38,
  spring: { mass: 0.1, stiffness: 260, damping: 22 }
});

function useVerticalDock() {
  return useContext(VerticalDockContext);
}

/**
 * DockItem with 100% jitter-free GPU transform magnification:
 * - Uses a fixed 38x38px layout slot so neighboring items NEVER push each other or cause layout feedback oscillation.
 * - Center Y is stable and never fluctuates during spring animation.
 * - Absolutely zero trembling ("sin temblores"), perfectly smooth Apple macOS Dock feel.
 */
function DockItem({ children, onClick, onContextMenu, active = false, className = "", style = {} }) {
  const slotRef = useRef(null);
  const { mouseY, distance, maxScale, spring } = useVerticalDock();
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState(null);

  const mouseDistance = useTransform(mouseY, (val) => {
    const domEl = slotRef.current;
    if (!domEl) return 999;
    const domRect = domEl.getBoundingClientRect();
    const centerY = domRect.top + domRect.height / 2;
    return val - centerY;
  });

  const scaleTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [1, maxScale, 1]
  );
  const scale = useSpring(scaleTransform, spring);

  const handleMouseEnter = () => {
    if (slotRef.current) {
      setRect(slotRef.current.getBoundingClientRect());
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={slotRef}
      style={{
        width: '38px',
        height: '38px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={onContextMenu}
    >
      <motion.div
        style={{
          width: '38px',
          height: '38px',
          scale,
          transformOrigin: 'center center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '11px',
          cursor: 'pointer',
          userSelect: 'none',
          willChange: 'transform',
          ...style
        }}
        className={className}
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        {React.Children.map(children, (child) => {
          if (!child || child.type === DockLabel) return null;
          return React.cloneElement(child, {
            isHovered,
            isTabActive: active
          });
        })}
      </motion.div>

      {/* Render tooltip label directly beside the icon, immune to parent CSS transform scale bugs */}
      {React.Children.map(children, (child) => {
        if (!child || child.type !== DockLabel) return null;
        return React.cloneElement(child, {
          isHovered
        });
      })}
    </div>
  );
}

/**
 * DockLabel:
 * Rendered alongside the 38x38 icon slot so it is perfectly aligned horizontally and vertically.
 */
function DockLabel({ children, isHovered }) {
  if (!isHovered) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -6, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -4, scale: 0.94 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        style={{
          position: 'absolute',
          left: 'calc(100% + 12px)',
          top: '50%',
          transform: 'translateY(-50%)',
          whiteSpace: 'nowrap',
          borderRadius: '9px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          background: 'rgba(18, 19, 26, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 99999,
          pointerEvents: 'auto',
          fontFamily: "'Lato', sans-serif"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function MacSidebar({
  tabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onGoHome,
  onTabContextMenu,
  onSelectSideApp,
  activeSideApp = null,
  onOpenSettings
}) {
  const mouseY = useMotionValue(Infinity);
  const dockValue = {
    mouseY,
    distance: 100,
    maxScale: 1.38,
    spring: { mass: 0.1, stiffness: 260, damping: 22 }
  };

  return (
    <aside
      style={styles.sidebar}
      className="dozzo-mac-sidebar no-select"
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
    >
      <VerticalDockContext.Provider value={dockValue}>
        {/* TOP SECTION: HOME & TAB LIST */}
        <div style={styles.tabsSection}>
          {/* Home button: click to go home or open a new search */}
          <button
            style={styles.homeButton}
            onClick={() => onGoHome && onGoHome()}
            title="Inicio / Nueva Búsqueda (Home)"
          >
            <Home size={16} />
          </button>

          {/* List of open tabs */}
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const title = tab.title || (tab.isNewTab ? 'Nueva Pestaña' : 'Cargando...');

            return (
              <DockItem
                key={tab.id}
                active={isActive}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.24)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.4)' : 'none'
                }}
                onClick={() => onSelectTab && onSelectTab(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTabContextMenu && onTabContextMenu(e, tab.id);
                }}
              >
                {/* Clean Favicon Box - 100% Monochrome */}
                <TabIconBox tab={tab} isActive={isActive} />

                {/* Active Indicator Bar on Left - Pure Crisp White, ZERO blue */}
                {isActive && <div style={styles.activeDotPill} />}

                {/* Hover Tooltip: Tab Name with [X] Close button beside the name */}
                <DockLabel>
                  <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title}
                  </span>
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab && onCloseTab(tab.id);
                      }}
                      title="Cerrar pestaña"
                      style={styles.tabCloseBtnBeside}
                    >
                      <X size={10} />
                    </button>
                  )}
                </DockLabel>
              </DockItem>
            );
          })}

          <div style={styles.divider} />
        </div>

        {/* CENTER SECTION: QUICK APPS (Vertically Centered in screen space, breathing room!) */}
        <div style={styles.appsSection}>
          {QUICK_APPS.map((app) => {
            const IconComp = app.icon;
            const isAppActive = activeSideApp?.id === app.id;

            return (
              <DockItem
                key={app.id}
                active={isAppActive}
                style={{
                  background: isAppActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  border: isAppActive ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid transparent'
                }}
                onClick={() => onSelectSideApp && onSelectSideApp(app)}
              >
                <AppIconContainer isAppActive={isAppActive}>
                  <IconComp />
                </AppIconContainer>

                {isAppActive && <div style={styles.appActiveIndicator} />}

                {/* Tooltip on hover showing app name */}
                <DockLabel>
                  <span>{app.name}</span>
                </DockLabel>
              </DockItem>
            );
          })}
        </div>

        {/* BOTTOM SECTION: COINBASE & POLYMARKET (with margin) + SETTINGS */}
        <div style={styles.settingsSection}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px' }}>
            {/* Coinbase Quick App */}
            <DockItem
              active={activeSideApp?.id === 'coinbase'}
              onClick={() =>
                onSelectSideApp &&
                onSelectSideApp({
                  id: 'coinbase',
                  name: 'Coinbase',
                  url: 'https://www.coinbase.com/explore',
                  icon: AppIcons.Coinbase
                })
              }
            >
              <AppIconContainer isAppActive={activeSideApp?.id === 'coinbase'}>
                <AppIcons.Coinbase />
              </AppIconContainer>
              <DockLabel>
                <span>Coinbase</span>
              </DockLabel>
            </DockItem>

            {/* Polymarket Quick App */}
            <DockItem
              active={activeSideApp?.id === 'polymarket'}
              onClick={() =>
                onSelectSideApp &&
                onSelectSideApp({
                  id: 'polymarket',
                  name: 'Polymarket',
                  url: 'https://polymarket.com',
                  icon: AppIcons.Polymarket
                })
              }
            >
              <AppIconContainer isAppActive={activeSideApp?.id === 'polymarket'}>
                <AppIcons.Polymarket />
              </AppIconContainer>
              <DockLabel>
                <span>Polymarket</span>
              </DockLabel>
            </DockItem>
          </div>

          <div style={styles.divider} />

          <DockItem
            active={false}
            onClick={() => onOpenSettings && onOpenSettings()}
          >
            <AppIconContainer isAppActive={false}>
              <AppIcons.Settings />
            </AppIconContainer>

            <DockLabel>
              <span>Configuración</span>
            </DockLabel>
          </DockItem>
        </div>
      </VerticalDockContext.Provider>
    </aside>
  );
}

/**
 * TabIconBox (Strictly Monochrome - NO BLUE)
 */
function TabIconBox({ tab, isActive }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {tab.isLoading ? (
        <div style={styles.miniSpinner} />
      ) : tab.favicon ? (
        <img
          src={tab.favicon}
          alt=""
          style={styles.tabFaviconImg}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <Globe size={18} color={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)'} />
      )}

      {tab.isAudioPlaying && (
        <div style={styles.audioBadge}>
          <Volume2 size={9} color="#ffffff" />
        </div>
      )}
    </div>
  );
}

/**
 * AppIconContainer scales inner icon with lens magnification and strictly monochrome coloring
 */
function AppIconContainer({ children, isAppActive, isHovered }) {
  const isHighlit = isAppActive || isHovered;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHighlit ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
        transition: 'color 0.16s ease'
      }}
    >
      {children}
    </div>
  );
}

const styles = {
  sidebar: {
    width: '52px',
    height: '100%',
    background: 'rgba(12, 13, 18, 0.90)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    position: 'relative',
    zIndex: 140,
    boxSizing: 'border-box'
  },
  tabsSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    paddingTop: '50px'
  },
  homeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  newTabButton: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    marginBottom: '2px'
  },
  tabFaviconImg: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    objectFit: 'contain'
  },
  miniSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  audioBadge: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    background: 'rgba(0, 0, 0, 0.85)',
    borderRadius: '50%',
    padding: '2px'
  },
  activeDotPill: {
    position: 'absolute',
    left: '2px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '14px',
    borderRadius: '2px',
    background: '#ffffff',
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
  },
  tabCloseBtnBeside: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.12)',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    padding: 0,
    transition: 'background 0.15s ease'
  },
  divider: {
    width: '26px',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '6px 0'
  },
  appsSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flex: 1,
    margin: 'auto 0'
  },
  settingsSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0
  },
  appActiveIndicator: {
    position: 'absolute',
    left: '2px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '12px',
    borderRadius: '2px',
    background: '#ffffff'
  }
};
