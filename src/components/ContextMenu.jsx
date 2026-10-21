import React, { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Plus, X, Copy, Download, Shield, Sliders, ExternalLink, Code, History } from 'lucide-react';

export default function ContextMenu({
  x,
  y,
  isOpen,
  onClose,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onReload,
  onNewTab,
  onCloseTab,
  onOpenDownloads,
  onOpenHistory,
  onOpenSettings,
  onOpenDevTools
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', onClose);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', onClose);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Keep within screen bounds
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  return (
    <div
      ref={menuRef}
      style={{
        ...styles.menu,
        top: `${adjustedY}px`,
        left: `${adjustedX}px`
      }}
      className="glass-panel animate-slide-down"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Navigation Quick Row */}
      <div style={styles.navRow}>
        <button
          style={{ ...styles.navBtn, opacity: canGoBack ? 1 : 0.35 }}
          onClick={() => {
            onGoBack();
            onClose();
          }}
          disabled={!canGoBack}
          title="Atrás"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          style={{ ...styles.navBtn, opacity: canGoForward ? 1 : 0.35 }}
          onClick={() => {
            onGoForward();
            onClose();
          }}
          disabled={!canGoForward}
          title="Adelante"
        >
          <ArrowRight size={15} />
        </button>
        <button
          style={styles.navBtn}
          onClick={() => {
            onReload();
            onClose();
          }}
          title="Recargar"
        >
          <RotateCw size={14} />
        </button>
      </div>

      <div style={styles.separator} />

      {/* Tab Actions */}
      <div
        style={styles.item}
        onClick={() => {
          onNewTab();
          onClose();
        }}
      >
        <div style={styles.itemLeft}>
          <Plus size={14} />
          <span>Nueva Pestaña</span>
        </div>
        <span style={styles.shortcut}>Ctrl+T</span>
      </div>

      <div
        style={styles.item}
        onClick={() => {
          onCloseTab();
          onClose();
        }}
      >
        <div style={styles.itemLeft}>
          <X size={14} />
          <span>Cerrar Pestaña</span>
        </div>
        <span style={styles.shortcut}>Ctrl+W</span>
      </div>

      <div style={styles.separator} />

      {/* Downloads */}
      <div
        style={styles.item}
        onClick={() => {
          onOpenDownloads();
          onClose();
        }}
      >
        <div style={styles.itemLeft}>
          <Download size={14} />
          <span>Ver Descargas</span>
        </div>
        <span style={styles.shortcut}>Ctrl+J</span>
      </div>

      {/* History */}
      <div
        style={styles.item}
        onClick={() => {
          onOpenHistory?.();
          onClose();
        }}
      >
        <div style={styles.itemLeft}>
          <History size={14} />
          <span>Historial</span>
        </div>
        <span style={styles.shortcut}>Ctrl+H</span>
      </div>

      {/* Settings */}
      <div
        style={styles.item}
        onClick={() => {
          onOpenSettings();
          onClose();
        }}
      >
        <div style={styles.itemLeft}>
          <Sliders size={14} />
          <span>Ajustes y Privacidad</span>
        </div>
      </div>

      <div style={styles.separator} />

      {/* Inspect Element */}
      <div
        style={styles.item}
        onClick={() => {
          onOpenDevTools();
          onClose();
        }}
      >
        <div style={styles.itemLeft}>
          <Code size={14} />
          <span>Inspeccionar Elemento</span>
        </div>
        <span style={styles.shortcut}>F12</span>
      </div>
    </div>
  );
}

const styles = {
  menu: {
    position: 'fixed',
    width: '210px',
    borderRadius: '12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
    padding: '6px',
    zIndex: 9999,
    userSelect: 'none'
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '4px 0'
  },
  navBtn: {
    width: '32px',
    height: '28px',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    background: 'transparent'
  },
  separator: {
    height: '1px',
    background: 'var(--border-subtle)',
    margin: '4px 0'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'background 0.12s ease'
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  shortcut: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    fontFamily: 'JetBrains Mono, monospace'
  }
};
