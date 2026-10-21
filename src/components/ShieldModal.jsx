import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, CheckCircle, X, RotateCcw, EyeOff, Lock } from 'lucide-react';
import { YoutubeIcon } from './Icons';

export default function ShieldModal({ isOpen, onClose, blockedCount, isShieldActive, onToggleShield, onResetStats }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} className="glass-panel animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div
              style={{
                ...styles.shieldIconBadge,
                backgroundColor: isShieldActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isShieldActive ? 'var(--success)' : 'var(--danger)'
              }}
            >
              {isShieldActive ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <div style={styles.title}>Escudo de Privacidad Dozzo</div>
              <div style={styles.subtitle}>
                {isShieldActive ? 'Protección activa al 100%' : 'Protección en pausa'}
              </div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Master Toggle */}
        <div style={styles.toggleRow}>
          <div>
            <div style={styles.toggleLabel}>Estado del Escudo</div>
            <div style={styles.toggleDesc}>Bloquea anuncios, rastreo y telemetría de sitios</div>
          </div>
          <label style={styles.switch}>
            <input
              type="checkbox"
              checked={isShieldActive}
              onChange={(e) => onToggleShield(e.target.checked)}
              style={{ display: 'none' }}
            />
            <div
              style={{
                ...styles.slider,
                backgroundColor: isShieldActive ? 'var(--success)' : 'var(--bg-hover)'
              }}
            >
              <div
                style={{
                  ...styles.sliderThumb,
                  transform: isShieldActive ? 'translateX(20px)' : 'translateX(0)'
                }}
              />
            </div>
          </label>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <EyeOff size={16} color="var(--accent)" />
            </div>
            <div style={styles.statValue}>{blockedCount}</div>
            <div style={styles.statLabel}>Anuncios y Rastreadores Bloqueados</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <YoutubeIcon size={18} color="#FF0000" />
            </div>
            <div style={styles.statValue}>100%</div>
            <div style={styles.statLabel}>YouTube Ad-Free Activo</div>
          </div>
        </div>

        {/* Privacy Guarantees */}
        <div style={styles.guarantees}>
          <div style={styles.guaranteeItem}>
            <CheckCircle size={14} color="var(--success)" />
            <span>Sin telemetría ni envío de datos a servidores externos</span>
          </div>
          <div style={styles.guaranteeItem}>
            <CheckCircle size={14} color="var(--success)" />
            <span>Eliminación automática de scripts invasivos en video</span>
          </div>
          <div style={styles.guaranteeItem}>
            <CheckCircle size={14} color="var(--success)" />
            <span>Navegación protegida contra huella digital (Anti-fingerprinting)</span>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.resetBtn} onClick={onResetStats}>
            <RotateCcw size={12} />
            <span>Reiniciar Contador</span>
          </button>
          <button style={styles.doneBtn} onClick={onClose}>
            Entendido
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
    width: '420px',
    borderRadius: '16px',
    padding: '20px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  shieldIconBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
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
    fontSize: '11.5px',
    color: 'var(--text-muted)'
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    color: 'var(--text-muted)'
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderRadius: '10px',
    background: 'var(--bg-tertiary)',
    marginBottom: '16px',
    border: '1px solid var(--border-subtle)'
  },
  toggleLabel: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  toggleDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  switch: {
    cursor: 'pointer'
  },
  slider: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    padding: '2px',
    transition: 'all 0.2s ease'
  },
  sliderThumb: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '16px'
  },
  statCard: {
    padding: '12px',
    borderRadius: '10px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    textAlign: 'center'
  },
  statIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '6px'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '800',
    fontFamily: 'JetBrains Mono, monospace',
    color: 'var(--text-primary)'
  },
  statLabel: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  guarantees: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-subtle)',
    marginBottom: '16px'
  },
  guaranteeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11.5px',
    color: 'var(--text-secondary)'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '1px solid var(--border-subtle)'
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  doneBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    fontSize: '12px',
    fontWeight: '700'
  }
};
