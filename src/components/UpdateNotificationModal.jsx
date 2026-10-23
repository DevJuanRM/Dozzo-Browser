import React from 'react';
import { Sparkles, Download, X, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function UpdateNotificationModal({
  isOpen,
  onClose,
  updateData,
  isElectronDownloaded = false,
  onInstallElectronUpdate
}) {
  if (!isOpen || !updateData) return null;

  const { latestVersion, currentVersion, releaseName, releaseNotes, downloadUrl, releaseUrl } = updateData;

  const handleDownload = () => {
    if (isElectronDownloaded && onInstallElectronUpdate) {
      onInstallElectronUpdate();
      return;
    }

    const targetUrl = downloadUrl || releaseUrl || 'https://github.com/DevJuanRM/Dozzo-Browser/releases/latest';
    if (window.browserAPI?.openExternal) {
      window.browserAPI.openExternal(targetUrl);
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose} className="animate-fade-in">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="glass-panel animate-scale-in">
        {/* Glow corner accent */}
        <div style={styles.cornerGlow} />

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconCircle}>
              <Sparkles size={20} color="#000" />
            </div>
            <div>
              <div style={styles.title}>¡Nueva Versión Disponible!</div>
              <div style={styles.versionBadgeRow}>
                <span style={styles.badgeLatest}>v{latestVersion}</span>
                <span style={styles.versionArrow}>←</span>
                <span style={styles.badgeCurrent}>Tu versión: v{currentVersion}</span>
              </div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Recordar más tarde">
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={styles.body}>
          <p style={styles.desc}>
            Hay una versión más reciente de <strong>Dozzo Browser</strong> lista para ti con mejoras de velocidad,
            bloqueo de publicidad avanzado y herramientas de Dev Studio optimizadas.
          </p>

          {/* Release Notes Box */}
          {releaseNotes && (
            <div style={styles.notesBox}>
              <div style={styles.notesHeader}>
                <span style={styles.notesTitle}>Novedades en esta actualización:</span>
              </div>
              <div style={styles.notesContent}>
                {releaseNotes.split('\n').slice(0, 6).map((line, idx) => (
                  <div key={idx} style={styles.noteLine}>
                    {line.trim() ? line : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isElectronDownloaded && (
            <div style={styles.downloadedAlert}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>La actualización ya fue descargada automáticamente en segundo plano.</span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div style={styles.footer}>
          <button style={styles.remindLaterBtn} onClick={onClose}>
            Recordar más tarde
          </button>

          <button style={styles.downloadActionBtn} onClick={handleDownload}>
            {isElectronDownloaded ? (
              <>
                <RefreshCw size={15} />
                <span>Reiniciar y Aplicar Actualización</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Descargar Dozzo v{latestVersion}</span>
              </>
            )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '16px'
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '16px',
    boxShadow: '0 32px 80px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  cornerGlow: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '160px',
    height: '160px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px var(--accent-glow)'
  },
  title: {
    fontSize: '17px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px'
  },
  versionBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  badgeLatest: {
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: 'rgba(240, 185, 11, 0.2)',
    border: '1px solid rgba(240, 185, 11, 0.4)',
    color: 'var(--accent)',
    fontSize: '11px',
    fontWeight: '700'
  },
  versionArrow: {
    color: 'var(--text-muted)',
    fontSize: '11px'
  },
  badgeCurrent: {
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-muted)',
    fontSize: '11px'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  body: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  desc: {
    margin: 0,
    fontSize: '13.5px',
    lineHeight: '1.55',
    color: 'var(--text-secondary)'
  },
  notesBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  notesHeader: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  notesContent: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    maxHeight: '110px',
    overflowY: 'auto'
  },
  noteLine: {
    marginBottom: '3px'
  },
  downloadedAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'rgba(38, 166, 91, 0.15)',
    border: '1px solid rgba(38, 166, 91, 0.3)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '12px'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  remindLaterBtn: {
    padding: '9px 16px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  downloadActionBtn: {
    padding: '9px 20px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    color: '#000000',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 0 16px var(--accent-glow)',
    transition: 'all 0.15s ease'
  }
};
