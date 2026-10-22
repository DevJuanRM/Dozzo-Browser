import React from 'react';
import { Monitor, Download, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, X, ExternalLink, HardDrive } from 'lucide-react';
import { GITHUB_REPO, CURRENT_VERSION } from '../utils/updateChecker';

export default function InstallGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const downloadUrl = `https://github.com/${GITHUB_REPO}/releases/latest`;

  return (
    <div style={styles.overlay} onClick={onClose} className="animate-fade-in">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="glass-panel animate-scale-in">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconCircle}>
              <Monitor size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={styles.title}>Guía de Instalación en PC (Windows)</div>
              <div style={styles.subtitle}>Dozzo Browser • Instalación rápida y segura</div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Cerrar">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Guide Content */}
        <div style={styles.body}>
          {/* Step 1 */}
          <div style={styles.stepCard}>
            <div style={styles.stepNumberBadge}>1</div>
            <div style={styles.stepInfo}>
              <div style={styles.stepTitle}>Descargar el Instalador Oficial (.exe)</div>
              <div style={styles.stepText}>
                Descarga siempre la última versión oficial desde el repositorio de GitHub. El archivo suele llamarse{' '}
                <code style={styles.inlineCode}>Dozzo-Browser-Setup-1.0.0.exe</code> o{' '}
                <code style={styles.inlineCode}>Dozzo-Browser-Portable.exe</code>.
              </div>
              <button
                style={styles.stepActionBtn}
                onClick={() => {
                  if (window.browserAPI?.openExternal) window.browserAPI.openExternal(downloadUrl);
                  else window.open(downloadUrl, '_blank');
                }}
              >
                <Download size={13} />
                <span>Ir a Descargar Última Versión</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Step 2: Windows SmartScreen Guidance */}
          <div style={styles.stepCardHighlight}>
            <div style={{ ...styles.stepNumberBadge, backgroundColor: 'var(--accent)', color: '#000' }}>2</div>
            <div style={styles.stepInfo}>
              <div style={styles.stepTitleRow}>
                <span style={styles.stepTitle}>¿Aparece "Windows protegió su PC" (SmartScreen)?</span>
                <span style={styles.pillNormal}>Totalmente Normal</span>
              </div>
              <div style={styles.stepText}>
                Al ser un navegador independiente de código abierto, Microsoft Windows muestra una advertencia preventiva
                hasta que la aplicación acumula millones de descargas. Dozzo es <strong>100% seguro y libre de malware</strong>.
              </div>
              <div style={styles.instructionBanner}>
                <div style={styles.subStep}>
                  <strong>Paso 2.1:</strong> Haz clic en el enlace azul que dice <u>"Más información"</u>.
                </div>
                <div style={styles.subStep}>
                  <strong>Paso 2.2:</strong> Aparecerá el botón <strong>"Ejecutar de todas formas"</strong>. Haz clic ahí para continuar.
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Installation Mode */}
          <div style={styles.stepCard}>
            <div style={styles.stepNumberBadge}>3</div>
            <div style={styles.stepInfo}>
              <div style={styles.stepTitle}>Asistente de Instalación Limpio</div>
              <div style={styles.stepText}>
                El instalador creará automáticamente los accesos directos en el <strong>Escritorio</strong> y en la{' '}
                <strong>Barra de Tareas</strong>. No instala software de terceros ni publicidad oculta.
              </div>
              <div style={styles.featuresRow}>
                <div style={styles.featureItem}>
                  <CheckCircle2 size={13} color="var(--success)" />
                  <span>Sin telemetría invasiva</span>
                </div>
                <div style={styles.featureItem}>
                  <CheckCircle2 size={13} color="var(--success)" />
                  <span>Adblocker preconfigurado</span>
                </div>
                <div style={styles.featureItem}>
                  <CheckCircle2 size={13} color="var(--success)" />
                  <span>Pestañas persistentes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Auto Updates */}
          <div style={styles.stepCard}>
            <div style={styles.stepNumberBadge}>4</div>
            <div style={styles.stepInfo}>
              <div style={styles.stepTitle}>Actualizaciones Automáticas y Avisos</div>
              <div style={styles.stepText}>
                Cada vez que abras Dozzo Browser, el sistema verificará en segundo plano si existe una versión más nueva.
                Si estás en una versión anterior, el navegador te avisará de inmediato con el botón para descargar o
                actualizar en 1-clic sin perder ninguna de tus pestañas.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerInfo}>
            <ShieldCheck size={14} color="var(--accent)" />
            <span>Dozzo Browser v{CURRENT_VERSION} • Verificado y Seguro</span>
          </div>
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
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '16px'
  },
  modal: {
    width: '100%',
    maxWidth: '580px',
    maxHeight: '88vh',
    backgroundColor: 'rgba(12, 13, 18, 0.96)',
    border: '1px solid rgba(240, 185, 11, 0.3)',
    borderRadius: '16px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(240, 185, 11, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: 'rgba(240, 185, 11, 0.15)',
    border: '1px solid rgba(240, 185, 11, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    marginTop: '2px'
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
    justifyContent: 'center'
  },
  body: {
    padding: '20px 24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  stepCard: {
    display: 'flex',
    gap: '14px',
    padding: '14px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px'
  },
  stepCardHighlight: {
    display: 'flex',
    gap: '14px',
    padding: '14px 16px',
    backgroundColor: 'rgba(240, 185, 11, 0.06)',
    border: '1px solid rgba(240, 185, 11, 0.35)',
    borderRadius: '12px'
  },
  stepNumberBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  stepInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  stepTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  },
  stepTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  pillNormal: {
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: 'rgba(38, 166, 91, 0.2)',
    border: '1px solid rgba(38, 166, 91, 0.4)',
    color: 'var(--success)',
    fontSize: '10.5px',
    fontWeight: '700'
  },
  stepText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  inlineCode: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '2px 5px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '11px',
    color: 'var(--accent)'
  },
  stepActionBtn: {
    marginTop: '6px',
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '7px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  instructionBanner: {
    marginTop: '8px',
    padding: '10px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '8px',
    border: '1px solid rgba(240, 185, 11, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '11.5px',
    color: 'var(--text-primary)'
  },
  subStep: {
    lineHeight: '1.4'
  },
  featuresRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '6px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    color: 'var(--text-muted)'
  },
  footer: {
    padding: '14px 24px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  footerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: 'var(--text-muted)'
  },
  doneBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    color: '#000000',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
