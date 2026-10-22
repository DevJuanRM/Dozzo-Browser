import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  Maximize2,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Move,
  Globe
} from 'lucide-react';

export default function PictureInPicture({
  tab,
  pipBounds,
  onUpdatePipBounds,
  onReturnToTab,
  onClosePip,
  onTogglePlayPause,
  onToggleMute,
  isPlaying = true,
  isMuted = false
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSizePreset, setActiveSizePreset] = useState('md');
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, startLeft: 0, startTop: 0 });
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, startWidth: 0, startHeight: 0 });

  const displayTitle = tab?.title || 'Reproduciendo video';

  // Size Presets (16:9 aspect ratio)
  const presets = {
    sm: { width: 320, height: 180 },
    md: { width: 440, height: 248 },
    lg: { width: 580, height: 326 }
  };

  const setPreset = (presetName) => {
    setActiveSizePreset(presetName);
    const { width, height } = presets[presetName];
    // Keep bottom-right anchor if not moved, or keep current top/left
    const newLeft = Math.max(20, Math.min(window.innerWidth - width - 20, pipBounds.left));
    const newTop = Math.max(60, Math.min(window.innerHeight - height - 20, pipBounds.top));
    onUpdatePipBounds({
      left: newLeft,
      top: newTop,
      width,
      height
    });
  };

  // Dragging handler
  const handleMouseDownDrag = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startLeft: pipBounds.left,
      startTop: pipBounds.top
    };

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;
      const maxLeft = window.innerWidth - pipBounds.width - 15;
      const maxTop = window.innerHeight - pipBounds.height - 15;

      const nextLeft = Math.max(15, Math.min(maxLeft, dragStartRef.current.startLeft + dx));
      const nextTop = Math.max(50, Math.min(maxTop, dragStartRef.current.startTop + dy));

      onUpdatePipBounds({
        left: nextLeft,
        top: nextTop,
        width: pipBounds.width,
        height: pipBounds.height
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Corner Resize Handler (Top-Left corner drag)
  const handleMouseDownResize = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    isResizingRef.current = true;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startWidth: pipBounds.width,
      startHeight: pipBounds.height,
      startLeft: pipBounds.left,
      startTop: pipBounds.top
    };

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const dx = resizeStartRef.current.x - moveEvent.clientX;
      const nextWidth = Math.max(280, Math.min(800, resizeStartRef.current.startWidth + dx));
      const nextHeight = Math.round(nextWidth * (9 / 16));
      const nextLeft = resizeStartRef.current.startLeft - (nextWidth - resizeStartRef.current.startWidth);
      const nextTop = resizeStartRef.current.startTop - (nextHeight - resizeStartRef.current.startHeight);

      if (nextLeft >= 10 && nextTop >= 50) {
        onUpdatePipBounds({
          left: nextLeft,
          top: nextTop,
          width: nextWidth,
          height: nextHeight
        });
        setActiveSizePreset('custom');
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!tab) return null;

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: '9999px',
          background: 'rgba(15, 15, 15, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid var(--accent, rgba(255, 255, 255, 0.5))',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8), 0 0 16px var(--accent-glow)',
          cursor: 'default'
        }}
        className="animate-slide-up"
      >
        <div style={styles.playingEqualizer} title="Reproduciendo audio">
          <span style={{ ...styles.eqBar, animationDelay: '0.1s' }} />
          <span style={{ ...styles.eqBar, animationDelay: '0.3s' }} />
          <span style={{ ...styles.eqBar, animationDelay: '0.2s' }} />
        </div>

        <div style={styles.minimizedTitle} title={displayTitle}>
          {displayTitle}
        </div>

        <button
          style={styles.pipActionBtn}
          onClick={onTogglePlayPause}
          title={isPlaying ? 'Pausar video' : 'Reproducir video'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button
          style={styles.pipActionBtn}
          onClick={() => setIsMinimized(false)}
          title="Restaurar ventana flotante"
        >
          <Maximize2 size={13} />
        </button>

        <button
          style={styles.pipActionBtn}
          onClick={() => onReturnToTab(tab.id)}
          title="Volver a la pestaña completa"
        >
          <ExternalLink size={13} />
        </button>

        <button
          style={{ ...styles.pipActionBtn, color: '#EF4444' }}
          onClick={() => onClosePip(tab.id)}
          title="Cerrar ventana flotante"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Expanded Floating Glass Video Window
  return (
    <div
      style={{
        position: 'fixed',
        left: `${pipBounds.left}px`,
        top: `${pipBounds.top}px`,
        width: `${pipBounds.width}px`,
        height: `${pipBounds.height}px`,
        zIndex: 9995,
        pointerEvents: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate-fade-in"
    >
      {/* Top Glass Header Overlay */}
      <div
        style={{
          ...styles.pipHeader,
          opacity: isHovered ? 1 : 0.85,
          pointerEvents: 'auto'
        }}
        onMouseDown={handleMouseDownDrag}
        title="Arrastra para mover la ventana flotante"
      >
        {/* Favicon & Title */}
        <div style={styles.pipHeaderLeft}>
          <div style={styles.pipFaviconBox}>
            {tab.favicon ? (
              <img src={tab.favicon} alt="" style={styles.pipFavicon} />
            ) : (
              <Globe size={13} color="var(--accent)" />
            )}
          </div>
          <span style={styles.pipTitleText} title={displayTitle}>
            {displayTitle}
          </span>
        </div>

        {/* Action Controls */}
        <div style={styles.pipHeaderActions} onMouseDown={(e) => e.stopPropagation()}>
          {/* Quick Size Preset Buttons */}
          <div style={styles.sizePresetGroup}>
            {['sm', 'md', 'lg'].map((sz) => (
              <button
                key={sz}
                style={{
                  ...styles.sizePresetBtn,
                  background: activeSizePreset === sz ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                  color: activeSizePreset === sz ? '#000000' : 'var(--text-secondary)'
                }}
                onClick={() => setPreset(sz)}
                title={`Tamaño ${sz.toUpperCase()}`}
              >
                {sz.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Minimize into floating pill */}
          <button
            style={styles.pipHeaderBtn}
            onClick={() => setIsMinimized(true)}
            title="Minimizar a píldora compacta"
          >
            <Minus size={13} />
          </button>

          {/* Return to Full Tab */}
          <button
            style={styles.pipHeaderBtn}
            onClick={() => onReturnToTab(tab.id)}
            title="Volver a la pestaña (Pantalla completa)"
          >
            <Maximize2 size={13} />
          </button>

          {/* Close PiP */}
          <button
            style={{ ...styles.pipHeaderBtn, ...styles.pipCloseBtn }}
            onClick={() => onClosePip(tab.id)}
            title="Cerrar ventana flotante"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Center Media Controls Overlay on Hover */}
      {isHovered && (
        <div style={styles.centerControlsOverlay}>
          <button
            style={styles.centerMediaBtn}
            onClick={onTogglePlayPause}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
          </button>
          <button
            style={styles.centerMuteBtn}
            onClick={onToggleMute}
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}

      {/* Corner Resize Grip (Top-Left corner) */}
      <div
        style={styles.resizeHandle}
        onMouseDown={handleMouseDownResize}
        title="Arrastra para cambiar el tamaño a gusto"
      >
        <Move size={12} />
      </div>
    </div>
  );
}

const styles = {
  pipHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 10px',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.45) 80%, transparent 100%)',
    borderTopLeftRadius: '14px',
    borderTopRightRadius: '14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    userSelect: 'none',
    cursor: 'move',
    zIndex: 10,
    transition: 'opacity 0.2s ease'
  },
  pipHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
    marginRight: '8px'
  },
  pipFaviconBox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  pipFavicon: {
    width: '16px',
    height: '16px',
    borderRadius: '50%'
  },
  pipTitleText: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pipHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0
  },
  sizePresetGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: 'rgba(255, 255, 255, 0.06)',
    padding: '2px',
    borderRadius: '6px',
    marginRight: '4px'
  },
  sizePresetBtn: {
    fontSize: '9.5px',
    fontWeight: '800',
    padding: '2px 5px',
    borderRadius: '4px',
    transition: 'all 0.15s ease'
  },
  pipHeaderBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    transition: 'all 0.15s ease'
  },
  pipCloseBtn: {
    color: '#EF4444',
    background: 'rgba(239, 68, 68, 0.12)'
  },
  centerControlsOverlay: {
    position: 'absolute',
    top: '38px',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'rgba(0, 0, 0, 0.35)',
    pointerEvents: 'auto',
    animation: 'fadeIn 0.15s ease'
  },
  centerMediaBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.75)',
    border: '1.5px solid rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    transition: 'transform 0.15s ease'
  },
  centerMuteBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.75)',
    border: '1.5px solid rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease'
  },
  resizeHandle: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    background: 'rgba(0, 0, 0, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'nwse-resize',
    pointerEvents: 'auto',
    zIndex: 15
  },
  minimizedTitle: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#ffffff',
    maxWidth: '130px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pipActionBtn: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
    transition: 'all 0.15s ease'
  },
  playingEqualizer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    height: '14px'
  },
  eqBar: {
    width: '3px',
    height: '100%',
    background: 'var(--accent, #10B981)',
    borderRadius: '2px',
    animation: 'equalize 0.8s ease-in-out infinite alternate'
  }
};
