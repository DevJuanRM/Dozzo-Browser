import React from 'react';
import { Download, Folder, File, CheckCircle2, AlertCircle, X, Trash2, ExternalLink } from 'lucide-react';

export default function DownloadsModal({ isOpen, onClose, downloads, onClearDownloads }) {
  if (!isOpen) return null;

  const handleOpenFile = (path) => {
    if (window.browserAPI?.openPath) {
      window.browserAPI.openPath(path);
    }
  };

  const handleShowInFolder = (path) => {
    if (window.browserAPI?.showItemInFolder) {
      window.browserAPI.showItemInFolder(path);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} className="glass-panel animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div style={styles.iconBadge}>
              <img src="./Logo.svg" alt="Dozzo Logo" style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={styles.title}>Descargas</div>
              <div style={styles.subtitle}>
                {downloads.length > 0 ? `${downloads.length} archivos descargados` : 'Sin descargas recientes'}
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            {downloads.length > 0 && (
              <button style={styles.clearBtn} onClick={onClearDownloads} title="Limpiar lista">
                <Trash2 size={14} />
              </button>
            )}
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Downloads List */}
        <div style={styles.list}>
          {downloads.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <img src="./Logo.svg" alt="Dozzo Logo" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'contain', opacity: 0.9 }} />
              </div>
              <div style={styles.emptyTitle}>No hay descargas activas</div>
              <div style={styles.emptySubtitle}>Los archivos que descargues aparecerán aquí automáticamente.</div>
            </div>
          ) : (
            downloads.map((item) => {
              const percent = item.totalBytes > 0 ? Math.round((item.receivedBytes / item.totalBytes) * 100) : 0;
              const isCompleted = item.state === 'completed';
              const isInterrupted = item.state === 'interrupted' || item.state === 'cancelled';

              return (
                <div key={item.id} style={styles.card}>
                  <div style={styles.fileIconBox}>
                    <File size={20} color="var(--accent)" />
                  </div>

                  <div style={styles.info}>
                    <div style={styles.fileName} title={item.fileName}>
                      {item.fileName}
                    </div>

                    <div style={styles.metaRow}>
                      <span>{formatBytes(item.receivedBytes)} {item.totalBytes > 0 ? `/ ${formatBytes(item.totalBytes)}` : ''}</span>
                      {isCompleted && (
                        <span style={styles.completedBadge}>
                          <CheckCircle2 size={11} color="var(--success)" /> Completado
                        </span>
                      )}
                      {isInterrupted && (
                        <span style={styles.interruptedBadge}>
                          <AlertCircle size={11} color="var(--danger)" /> Cancelado
                        </span>
                      )}
                    </div>

                    {!isCompleted && !isInterrupted && (
                      <div style={styles.progressBarBg}>
                        <div style={{ ...styles.progressBarFill, width: `${percent}%` }} />
                      </div>
                    )}
                  </div>

                  {isCompleted && item.savePath && (
                    <div style={styles.itemActions}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => handleOpenFile(item.savePath)}
                        title="Abrir archivo"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        style={styles.actionBtn}
                        onClick={() => handleShowInFolder(item.savePath)}
                        title="Mostrar en carpeta"
                      >
                        <Folder size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
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
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(3px)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  drawer: {
    width: '420px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border-subtle)',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
    padding: '20px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '11.5px',
    color: 'var(--text-muted)'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  clearBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    color: 'var(--text-muted)'
  },
  closeBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    color: 'var(--text-muted)'
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    transition: 'all 0.15s ease'
  },
  fileIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  info: {
    flex: 1,
    minWidth: 0
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '3px'
  },
  completedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    color: 'var(--success)'
  },
  interruptedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    color: 'var(--danger)'
  },
  progressBarBg: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.08)',
    marginTop: '6px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: '2px',
    transition: 'width 0.2s ease'
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  actionBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-secondary)'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  emptySubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    maxWidth: '220px'
  }
};
