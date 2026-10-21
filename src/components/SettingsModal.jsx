import React from 'react';
import { Sliders, X, Search, Palette, Moon, Sun, Bookmark, Check, Shield } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  searchEngine,
  onChangeSearchEngine,
  theme,
  onToggleTheme,
  accentColor,
  onChangeAccent,
  showBookmarksBar,
  onToggleBookmarksBar
}) {
  if (!isOpen) return null;

  const engines = [
    {
      id: 'duckduckgo',
      name: 'DuckDuckGo',
      desc: 'Búsquedas privadas sin rastreo ni perfiles de usuario (Predeterminado)',
      url: 'https://duckduckgo.com'
    },
    {
      id: 'brave',
      name: 'Brave Search',
      desc: 'Índice de búsqueda 100% independiente de Google',
      url: 'https://search.brave.com'
    },
    {
      id: 'startpage',
      name: 'Startpage',
      desc: 'Resultados de calidad con protección de privacidad holandesa',
      url: 'https://startpage.com'
    }
  ];

  const accents = [
    { id: 'gold', name: 'Binance Gold', color: '#F0B90B' },
    { id: 'cyan', name: 'Cyber Cyan', color: '#06B6D4' },
    { id: 'emerald', name: 'Emerald Green', color: '#10B981' },
    { id: 'purple', name: 'Royal Violet', color: '#8B5CF6' },
    { id: 'orange', name: 'Sunset Flame', color: '#F97316' },
    { id: 'crimson', name: 'Ruby Crimson', color: '#EF4444' }
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} className="glass-panel animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div style={styles.iconBadge}>
              <Sliders size={18} color="var(--accent)" />
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
                    <div style={styles.engineName}>{eng.name}</div>
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
              <span>Apariencia y Colores</span>
            </div>

            <div style={styles.themeToggleRow}>
              <span>Tema de la Interfaz</span>
              <div style={styles.themeBtns}>
                <button
                  style={{
                    ...styles.themeOptionBtn,
                    background: theme === 'dark' ? 'var(--accent)' : 'transparent',
                    color: theme === 'dark' ? 'var(--accent-text)' : 'var(--text-secondary)'
                  }}
                  onClick={() => onToggleTheme('dark')}
                >
                  <Moon size={14} />
                  <span>Oscuro (Pro)</span>
                </button>
                <button
                  style={{
                    ...styles.themeOptionBtn,
                    background: theme === 'light' ? 'var(--accent)' : 'transparent',
                    color: theme === 'light' ? 'var(--accent-text)' : 'var(--text-secondary)'
                  }}
                  onClick={() => onToggleTheme('light')}
                >
                  <Sun size={14} />
                  <span>Claro</span>
                </button>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Color de Acento
              </div>
              <div style={styles.accentsGrid}>
                {accents.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => onChangeAccent(acc.id)}
                    style={{
                      ...styles.accentBox,
                      backgroundColor: acc.color,
                      boxShadow: accentColor === acc.id ? '0 0 0 2px white, 0 0 10px ' + acc.color : 'none'
                    }}
                    title={acc.name}
                  >
                    {accentColor === acc.id && <Check size={14} color="#000" strokeWidth={3} />}
                  </div>
                ))}
              </div>
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
