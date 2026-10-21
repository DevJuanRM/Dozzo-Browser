import React, { useState } from 'react';
import { History, Search, Trash2, X, ExternalLink, Globe, Clock, Check } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, history = [], onNavigate, onClearHistory, onDeleteItem }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q))
    );
  });

  const formatTime = (ts) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (ts) => {
    try {
      const date = new Date(ts);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) return 'Hoy';
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  // Group by date
  const grouped = filteredHistory.reduce((acc, item) => {
    const d = formatDate(item.timestamp);
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} className="glass-panel animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconBadge}>
              <History size={16} color="var(--accent)" />
            </div>
            <div>
              <div style={styles.title}>Historial de Navegación</div>
              <div style={styles.subtitle}>{history.length} páginas visitadas recientemente</div>
            </div>
          </div>

          <div style={styles.headerRight}>
            {confirmClear ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--danger)' }}>¿Seguro?</span>
                <button
                  style={{ ...styles.clearBtn, background: 'var(--danger)', color: '#fff' }}
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                >
                  <Check size={12} />
                  <span>Sí, vaciar</span>
                </button>
                <button style={styles.cancelBtn} onClick={() => setConfirmClear(false)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                style={styles.clearBtn}
                onClick={() => setConfirmClear(true)}
                disabled={history.length === 0}
                title="Vaciar todo el historial"
              >
                <Trash2 size={13} />
                <span>Vaciar historial</span>
              </button>
            )}
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en el historial por título o enlace..."
            style={styles.searchInput}
            autoFocus
          />
          {searchQuery && (
            <button style={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* List */}
        <div style={styles.list}>
          {Object.keys(grouped).length === 0 ? (
            <div style={styles.emptyState}>
              <Clock size={36} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '8px' }} />
              <div style={styles.emptyTitle}>
                {searchQuery ? 'No se encontraron resultados' : 'El historial está vacío'}
              </div>
              <div style={styles.emptySub}>
                {searchQuery ? 'Intenta con otras palabras clave' : 'Las páginas que visites aparecerán aquí'}
              </div>
            </div>
          ) : (
            Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} style={styles.groupContainer}>
                <div style={styles.groupHeader}>{dateLabel}</div>
                <div style={styles.groupItems}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={styles.historyRow}
                      onClick={() => {
                        onNavigate(item.url);
                        onClose();
                      }}
                    >
                      <div style={styles.faviconBox}>
                        {item.favicon ? (
                          <img
                            src={item.favicon}
                            alt=""
                            style={styles.favicon}
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                        ) : (
                          <Globe size={13} color="var(--text-muted)" />
                        )}
                      </div>

                      <div style={styles.infoBox}>
                        <div style={styles.rowTitle}>{item.title || item.url}</div>
                        <div style={styles.rowUrl}>{item.url}</div>
                      </div>

                      <div style={styles.timeLabel}>{formatTime(item.timestamp)}</div>

                      <button
                        style={styles.deleteRowBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        title="Eliminar del historial"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
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
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    width: '680px',
    maxWidth: '92vw',
    height: '560px',
    maxHeight: '85vh',
    borderRadius: '16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-tertiary)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  iconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(240, 185, 11, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontSize: '11.5px',
    fontWeight: '600'
  },
  cancelBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '11.5px',
    color: 'var(--text-muted)'
  },
  closeBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    color: 'var(--text-muted)'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-primary)'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px'
  },
  clearSearchBtn: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    color: 'var(--text-muted)'
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 20px'
  },
  groupContainer: {
    marginBottom: '16px'
  },
  groupHeader: {
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  },
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  historyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  },
  faviconBox: {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  favicon: {
    width: '16px',
    height: '16px',
    borderRadius: '2px'
  },
  infoBox: {
    flex: 1,
    minWidth: 0
  },
  rowTitle: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  rowUrl: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  timeLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    flexShrink: 0
  },
  deleteRowBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    opacity: 0.6,
    flexShrink: 0,
    transition: 'all 0.15s ease'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  emptySub: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  }
};
