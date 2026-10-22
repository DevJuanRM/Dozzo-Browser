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
  Monitor
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

  const downloadUrl = `https://github.com/${GITHUB_REPO}/releases/latest`;

  if (!isOpen) return null;

  const engines = SEARCH_ENGINES;


  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} className="glass-panel animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div style={styles.iconBadge}>
              <img src="./Logo.svg" alt="Dozzo" style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={styles.title}>Ajustes de Dozzo Browser</div>
              <div style={styles.subtitle}>Personalización, Búsqueda Privada y Rendimiento</div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Section: Search Engine */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <Search size={14} color="var(--accent)" />
              <span>Motor de Búsqueda 100% Privado</span>
            </div>
            <div style={styles.engineList}>
              {engines.map((eng) => (
                <div
                  key={eng.id}
                  style={{
                    ...styles.engineCard,
                    borderColor: searchEngine === eng.id ? 'var(--accent)' : 'var(--border-subtle)',
                    background: searchEngine === eng.id ? 'rgba(255, 255, 255, 0.04)' : 'var(--bg-tertiary)'
                  }}
                  onClick={() => onChangeSearchEngine(eng.id)}
                >
                  <div style={styles.radio}>
                    {searchEngine === eng.id && <div style={styles.radioDot} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={styles.engineName}>{eng.name}</div>
                      {eng.badge && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: '700' }}>
                          {eng.badge}
                        </span>
                      )}
                    </div>
                    <div style={styles.engineDesc}>{eng.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Appearance */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <Palette size={14} color="var(--accent)" />
              <span>Colección de Temas (10 Modos)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px' }}>
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: isSelected ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                      border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: thm.primaryColor,
                          border: `2px solid ${thm.accentColor}`,
                          boxShadow: `0 0 6px ${thm.accentColor}55`,
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: isSelected ? '700' : '600', color: 'var(--text-primary)' }}>
                          {thm.name}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {thm.badge}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} color="var(--accent)" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          </div>


          {/* Section: Bookmarks Bar */}
          <div style={styles.section}>
            <div style={styles.toggleRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={14} color="var(--text-muted)" />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>Mostrar barra de marcadores</span>
              </div>
              <button
                style={{
                  ...styles.simpleToggle,
                  background: showBookmarksBar ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: showBookmarksBar ? 'var(--accent-text)' : 'var(--text-secondary)'
                }}
                onClick={onToggleBookmarksBar}
              >
                {showBookmarksBar ? 'Activada' : 'Oculta'}
              </button>
            </div>
          </div>

          {/* Section: System Version & Updates */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <Sparkles size={14} color="var(--accent)" />
              <span>Versión y Actualizaciones</span>
            </div>

            <div style={styles.updateCard}>
              <div style={styles.updateHeaderRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="./Logo.svg" alt="Dozzo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} />
                  <div>
                    <div style={styles.versionLabel}>Dozzo Browser v{CURRENT_VERSION}</div>
                    <div style={styles.versionSub}>Canal Oficial de Actualizaciones GitHub</div>
                  </div>
                </div>

                <button
                  style={{
                    ...styles.checkUpdateBtn,
                    opacity: isCheckingUpdates ? 0.7 : 1
                  }}
                  onClick={handleCheckUpdates}
                  disabled={isCheckingUpdates}
                >
                  <RefreshCw size={13} className={isCheckingUpdates ? 'animate-spin' : ''} />
                  <span>{isCheckingUpdates ? 'Comprobando...' : 'Comprobar Actualizaciones'}</span>
                </button>
              </div>

              {/* Status Banner when checked */}
              {updateStatus?.checked && (
                <div style={styles.statusResultBox}>
                  {updateStatus.hasUpdate ? (
                    <div style={styles.updateAvailableNotice}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={15} color="var(--accent)" />
                        <span style={{ fontWeight: '700', fontSize: '12.5px' }}>
                          ¡Nueva versión disponible: v{updateStatus.latestVersion}!
                        </span>
                      </div>
                      <p style={{ margin: '6px 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        Hay una actualización con mejoras de rendimiento y correcciones para ti.
                      </p>
                      <button
                        style={styles.downloadUpdateBtn}
                        onClick={() => {
                          if (window.browserAPI?.openExternal) {
                            window.browserAPI.openExternal(updateStatus.downloadUrl || downloadUrl);
                          } else {
                            window.open(updateStatus.downloadUrl || downloadUrl, '_blank');
                          }
                        }}
                      >
                        <Download size={13} />
                        <span>Descargar Dozzo v{updateStatus.latestVersion} (.exe)</span>
                      </button>
                    </div>
                  ) : (
                    <div style={styles.upToDateNotice}>
                      <CheckCircle2 size={15} color="var(--success)" />
                      <span>¡Tienes la versión más reciente instalada! (v{CURRENT_VERSION})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Windows Install Guide Button */}
              <div style={styles.guideActionRow}>
                <button
                  style={styles.guideBtn}
                  onClick={() => {
                    if (onOpenInstallGuide) onOpenInstallGuide();
                  }}
                >
                  <Monitor size={14} color="var(--accent)" />
                  <span>Guía e Instrucciones de Instalación en PC (.exe)</span>
                </button>

                <button
                  style={styles.releasesLinkBtn}
                  onClick={() => {
                    if (window.browserAPI?.openExternal) window.browserAPI.openExternal(downloadUrl);
                    else window.open(downloadUrl, '_blank');
                  }}
                  title="Ver todas las versiones en GitHub Releases"
                >
                  <ExternalLink size={13} />
                  <span>Releases GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.browserInfo}>
            <Shield size={12} color="var(--success)" />
            <span>Dozzo Browser v1.0 • Motor Chromium Privado</span>
          </div>
          <button style={styles.doneBtn} onClick={onClose}>
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    width: '460px',
    borderRadius: '16px',
    padding: '22px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    color: 'var(--text-muted)'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  section: {
    padding: '12px',
    borderRadius: '12px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '10px',
    color: 'var(--text-primary)'
  },
  engineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  engineCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  radio: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  radioDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)'
  },
  engineName: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  engineDesc: {
    fontSize: '10.5px',
    color: 'var(--text-muted)'
  },
  themeToggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: '600'
  },
  themeBtns: {
    display: 'flex',
    gap: '4px',
    background: 'var(--bg-tertiary)',
    padding: '3px',
    borderRadius: '8px'
  },
  themeOptionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600'
  },
  accentsGrid: {
    display: 'flex',
    gap: '10px'
  },
  accentBox: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  simpleToggle: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    border: '1px solid var(--border-subtle)'
  },
  updateCard: {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  updateHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  },
  versionLabel: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  versionSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  checkUpdateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '7px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  statusResultBox: {
    marginTop: '4px'
  },
  updateAvailableNotice: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(240, 185, 11, 0.12)',
    border: '1px solid rgba(240, 185, 11, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  downloadUpdateBtn: {
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '7px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    color: '#000000',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px'
  },
  upToDateNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(38, 166, 91, 0.12)',
    border: '1px solid rgba(38, 166, 91, 0.3)',
    color: 'var(--text-primary)',
    fontSize: '12px'
  },
  guideActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '10px',
    marginTop: '2px'
  },
  guideBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '7px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  releasesLinkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 10px',
    borderRadius: '7px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-subtle)',
    marginTop: '16px'
  },
  browserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  doneBtn: {
    padding: '6px 16px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    fontSize: '12px',
    fontWeight: '700'
  }
};
