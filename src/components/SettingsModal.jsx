import React, { useState } from 'react';
import {
  Sliders,
  X,
  Search,
  Palette,
  Moon,
  Sun,
  Bookmark,
  Check,
  Shield,
  RefreshCw,
  Sparkles,
  Download,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Monitor,
  Apple,
  Cpu,
  Layers,
  Globe,
  Lock
} from 'lucide-react';
import { SEARCH_ENGINES } from '../utils/searchEngines';
import { CURRENT_VERSION, checkForLatestRelease, GITHUB_REPO } from '../utils/updateChecker';
import { CURATED_THEMES } from '../utils/themes';

export default function SettingsModal({
  isOpen,
  onClose,
  searchEngine,
  onChangeSearchEngine,
  theme,
  onSelectTheme,
  showBookmarksBar,
  onToggleBookmarksBar,
  onOpenInstallGuide
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'themes' | 'updates'
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const res = await checkForLatestRelease(true);
      setUpdateStatus({ checked: true, ...res });
    } catch (e) {
      setUpdateStatus({ checked: true, hasUpdate: false });
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const releasesBaseUrl = `https://github.com/${GITHUB_REPO}/releases/latest`;

  const handleOpenExternal = (url) => {
    const target = url || releasesBaseUrl;
    if (window.browserAPI?.openExternal) {
      window.browserAPI.openExternal(target);
    } else {
      window.open(target, '_blank');
    }
  };

  if (!isOpen) return null;

  const engines = SEARCH_ENGINES;

  return (
    <div style={styles.overlay} onClick={onClose} className="animate-fade-in">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="animate-scale-in">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div style={styles.iconBadge}>
              <img
                src="./Logo.svg"
                alt="Dozzo"
                style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={styles.title}>Dozzo Studio & Configuración</div>
              <div style={styles.subtitle}>Escala de Grises Pro • Motor Privado • Rendimiento</div>
            </div>
          </div>

          <button style={styles.closeBtn} onClick={onClose} title="Cerrar ajustes (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div style={styles.navStrip}>
          <button
            style={{ ...styles.navTabBtn, ...(activeTab === 'search' ? styles.navTabBtnActive : {}) }}
            onClick={() => setActiveTab('search')}
          >
            <Search size={13} />
            <span>Motor de Búsqueda</span>
          </button>

          <button
            style={{ ...styles.navTabBtn, ...(activeTab === 'themes' ? styles.navTabBtnActive : {}) }}
            onClick={() => setActiveTab('themes')}
          >
            <Palette size={13} />
            <span>Temas Monochrome</span>
          </button>

          <button
            style={{ ...styles.navTabBtn, ...(activeTab === 'updates' ? styles.navTabBtnActive : {}) }}
            onClick={() => setActiveTab('updates')}
          >
            <Download size={13} />
            <span>Descargas & Versión</span>
          </button>
        </div>

        {/* Body Content */}
        <div style={styles.content} className="custom-scrollbar">

          {/* TAB 2: SEARCH ENGINES */}
          {activeTab === 'search' && (
            <div style={styles.tabSection}>
              <div style={styles.sectionHeader}>
                <Search size={15} color="#ffffff" />
                <span style={styles.sectionHeading}>Motor de Búsqueda Predeterminado</span>
              </div>
              <p style={styles.sectionDesc}>
                Elige el buscador que procesará tus consultas desde la barra omnibox y el home.
              </p>

              <div style={styles.engineGrid}>
                {engines.map((eng) => {
                  const isSelected = searchEngine === eng.id;
                  return (
                    <div
                      key={eng.id}
                      style={{
                        ...styles.bentoCard,
                        borderColor: isSelected ? '#ffffff' : '#27272a',
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.06)' : '#18181b'
                      }}
                      onClick={() => onChangeSearchEngine(eng.id)}
                    >
                      <div style={styles.cardHeaderRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={styles.radio}>
                            {isSelected && <div style={styles.radioDot} />}
                          </div>
                          <span style={styles.cardTitle}>{eng.name}</span>
                        </div>
                        {eng.badge && (
                          <span style={styles.badgePill}>{eng.badge}</span>
                        )}
                      </div>
                      <p style={styles.cardDesc}>{eng.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Bookmarks bar option */}
              <div style={{ ...styles.bentoCard, marginTop: 16 }}>
                <div style={styles.cardHeaderRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bookmark size={15} color="#ffffff" />
                    <span style={styles.cardTitle}>Barra de Marcadores Superior</span>
                  </div>
                  <button
                    style={{
                      ...styles.pillToggleBtn,
                      backgroundColor: showBookmarksBar ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      color: showBookmarksBar ? '#000000' : '#a1a1aa'
                    }}
                    onClick={onToggleBookmarksBar}
                  >
                    {showBookmarksBar ? 'Visible' : 'Oculta'}
                  </button>
                </div>
                <p style={styles.cardDesc}>
                  Muestra la barra de acceso directo a tus páginas favoritas debajo de la barra de navegación.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: THEMES */}
          {activeTab === 'themes' && (
            <div style={styles.tabSection}>
              <div style={styles.sectionHeader}>
                <Palette size={15} color="#ffffff" />
                <span style={styles.sectionHeading}>Colección de Temas Visuales</span>
              </div>
              <p style={styles.sectionDesc}>
                Por defecto, Dozzo utiliza una paleta blanco y negro monocromática. Puedes cambiar de estilo aquí.
              </p>

              <div style={styles.themesGrid}>
                {CURATED_THEMES.map((thm) => {
                  const isSelected =
                    theme === thm.id ||
                    (theme === 'dark' && thm.id === 'obsidian-aurora') ||
                    (theme === 'light' && thm.id === 'mac-snow');

                  return (
                    <div
                      key={thm.id}
                      onClick={() => onSelectTheme && onSelectTheme(thm.id)}
                      style={{
                        ...styles.bentoCard,
                        borderColor: isSelected ? '#ffffff' : '#27272a',
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : '#18181b',
                        padding: '14px 16px'
                      }}
                    >
                      <div style={styles.cardHeaderRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              backgroundColor: thm.primaryColor,
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              boxShadow: isSelected ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none'
                            }}
                          />
                          <span style={styles.cardTitle}>{thm.name}</span>
                        </div>
                        {isSelected && (
                          <span style={{ ...styles.badgePill, backgroundColor: '#ffffff', color: '#000000' }}>
                            Activo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: UPDATES & DOWNLOADS */}
          {activeTab === 'updates' && (
            <div style={styles.tabSection}>
              <div style={styles.sectionHeader}>
                <Download size={15} color="#ffffff" />
                <span style={styles.sectionHeading}>Centro de Descargas & Actualizaciones</span>
              </div>
              <p style={styles.sectionDesc}>
                Descarga la última versión para Windows o Mac, o comprueba si hay actualizaciones pendientes.
              </p>

              {/* Status Card */}
              <div style={styles.bentoCard}>
                <div style={styles.cardHeaderRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src="./Logo.svg" alt="Dozzo" style={{ width: 34, height: 34, borderRadius: 8 }} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                        Dozzo Browser v{CURRENT_VERSION}
                      </div>
                      <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                        Canal Oficial de Lanzamientos GitHub
                      </div>
                    </div>
                  </div>

                  <button
                    style={{
                      ...styles.actionBtn,
                      opacity: isCheckingUpdates ? 0.7 : 1
                    }}
                    onClick={handleCheckUpdates}
                    disabled={isCheckingUpdates}
                  >
                    <RefreshCw size={13} className={isCheckingUpdates ? 'animate-spin' : ''} />
                    <span>{isCheckingUpdates ? 'Comprobando...' : 'Comprobar Actualizaciones'}</span>
                  </button>
                </div>

                {/* Status message */}
                {updateStatus?.checked && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #27272a' }}>
                    {updateStatus.hasUpdate ? (
                      <div style={styles.alertBoxWarning}>
                        <Sparkles size={16} color="#ffffff" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#ffffff' }}>
                            ¡Nueva versión v{updateStatus.latestVersion} disponible!
                          </div>
                          <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                            Incluye nuevas optimizaciones y funciones.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.alertBoxSuccess}>
                        <CheckCircle2 size={16} color="#ffffff" />
                        <span style={{ fontSize: 12.5, color: '#ffffff', fontWeight: 500 }}>
                          ¡Tienes instalada la versión más reciente! (v{CURRENT_VERSION})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Download Platforms Grid */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                  Descargas Oficiales por Plataforma
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {/* Windows Installer */}
                  <div style={styles.bentoCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Monitor size={22} color="#ffffff" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Windows (.exe)</div>
                        <div style={{ fontSize: 11.5, color: '#a1a1aa' }}>Instalador oficial para Windows 10/11</div>
                      </div>
                    </div>
                    <button
                      style={{ ...styles.downloadButton, marginTop: 12 }}
                      onClick={() => handleOpenExternal(updateData?.windowsDownloadUrl || `https://github.com/${GITHUB_REPO}/releases/download/v${CURRENT_VERSION}/Dozzo.Browser.Setup.${CURRENT_VERSION}.exe`)}
                    >
                      <Download size={13} />
                      <span>Descargar para Windows</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>

                  {/* macOS DMG */}
                  <div style={styles.bentoCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Apple size={22} color="#ffffff" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Apple Mac (.dmg)</div>
                        <div style={{ fontSize: 11.5, color: '#a1a1aa' }}>Universal para Mac M1/M2/M3 & Intel</div>
                      </div>
                    </div>
                    <button
                      style={{ ...styles.downloadButton, marginTop: 12 }}
                      onClick={() => handleOpenExternal(updateData?.macDownloadUrl || `https://github.com/${GITHUB_REPO}/releases/download/v${CURRENT_VERSION}/Dozzo.Browser-${CURRENT_VERSION}-arm64.dmg`)}
                    >
                      <Download size={13} />
                      <span>Descargar para Mac</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                {/* Additional Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <button
                    style={{ ...styles.bentoSecondaryBtn, flex: 1 }}
                    onClick={() => {
                      if (onOpenInstallGuide) onOpenInstallGuide();
                    }}
                  >
                    <HelpCircle size={14} />
                    <span>Guía de Instalación en PC</span>
                  </button>

                  <button
                    style={{ ...styles.bentoSecondaryBtn, flex: 1 }}
                    onClick={() => handleOpenExternal(releasesBaseUrl)}
                  >
                    <ExternalLink size={14} />
                    <span>Ver Todas las Versiones en GitHub</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerInfo}>
            <span>Dozzo Browser • Código abierto & 100% privado</span>
          </div>
          <button style={styles.doneBtn} onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '20px'
  },
  modal: {
    width: '100%',
    maxWidth: '820px',
    maxHeight: '88vh',
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '20px',
    boxShadow: '0 32px 80px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
    borderBottom: '1px solid #27272a',
    backgroundColor: '#18181b',
    flexShrink: 0
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconBadge: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.2px'
  },
  subtitle: {
    fontSize: '12px',
    color: '#a1a1aa',
    marginTop: '2px'
  },
  closeBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  navStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 22px',
    backgroundColor: '#09090b',
    borderBottom: '1px solid #27272a',
    flexShrink: 0,
    overflowX: 'auto'
  },
  navTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 14px',
    borderRadius: '9px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  },
  navTabBtnActive: {
    backgroundColor: '#18181b',
    borderColor: '#3f3f46',
    color: '#ffffff'
  },
  content: {
    padding: '20px 22px',
    overflowY: 'auto',
    flex: 1,
    minHeight: '380px'
  },
  tabSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sectionHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff'
  },
  sectionDesc: {
    fontSize: '12.5px',
    color: '#a1a1aa',
    margin: '4px 0 16px',
    lineHeight: 1.4
  },
  engineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  themesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  bentoCard: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '14px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  },
  cardTitle: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#ffffff'
  },
  cardDesc: {
    fontSize: '12px',
    color: '#a1a1aa',
    margin: '6px 0 0',
    lineHeight: 1.4
  },
  badgePill: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff'
  },
  radio: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  radioDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#ffffff'
  },
  pillToggleBtn: {
    padding: '4px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '9px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease'
  },
  downloadButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '8px 14px',
    borderRadius: '9px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease'
  },
  bentoSecondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '9px 14px',
    borderRadius: '10px',
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  alertBoxSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)'
  },
  alertBoxWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.18)'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 22px',
    borderTop: '1px solid #27272a',
    backgroundColor: '#18181b',
    flexShrink: 0
  },
  footerInfo: {
    fontSize: '11.5px',
    color: '#71717a'
  },
  doneBtn: {
    padding: '6px 18px',
    borderRadius: '9px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
