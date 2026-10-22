import React from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  ZoomIn,
  X,
  Sliders,
  Check,
  ChevronDown
} from 'lucide-react';

export const DEVICE_PRESETS = [
  { name: 'Responsive', width: 400, height: 750, type: 'custom' },
  { name: 'iPhone 15 Pro', width: 393, height: 852, type: 'mobile' },
  { name: 'iPhone 14 / 13', width: 390, height: 844, type: 'mobile' },
  { name: 'iPhone SE', width: 375, height: 667, type: 'mobile' },
  { name: 'Samsung Galaxy S22', width: 360, height: 780, type: 'mobile' },
  { name: 'Google Pixel 7', width: 412, height: 915, type: 'mobile' },
  { name: 'iPad Mini', width: 768, height: 1024, type: 'tablet' },
  { name: 'iPad Air / Pro 11"', width: 820, height: 1180, type: 'tablet' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet' },
  { name: 'MacBook Air', width: 1280, height: 800, type: 'desktop' },
  { name: 'Full HD Desktop', width: 1920, height: 1080, type: 'desktop' }
];

export default function ResponsiveDeviceBar({
  responsiveMode,
  onChangeResponsiveMode,
  onClose
}) {
  const { width, height, scale, preset, isRotated, showFrame } = responsiveMode;

  const handleSelectPreset = (e) => {
    const selectedName = e.target.value;
    const found = DEVICE_PRESETS.find((p) => p.name === selectedName);
    if (found) {
      onChangeResponsiveMode({
        preset: found.name,
        width: isRotated ? found.height : found.width,
        height: isRotated ? found.width : found.height
      });
    }
  };

  const handleRotate = () => {
    onChangeResponsiveMode({
      isRotated: !isRotated,
      width: height,
      height: width
    });
  };

  const handleWidthChange = (val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 100 && num <= 3840) {
      onChangeResponsiveMode({ width: num, preset: 'Personalizado' });
    }
  };

  const handleHeightChange = (val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 100 && num <= 2160) {
      onChangeResponsiveMode({ height: num, preset: 'Personalizado' });
    }
  };

  const handleScaleChange = (newScale) => {
    onChangeResponsiveMode({ scale: newScale });
  };

  return (
    <div style={styles.barContainer} className="glass-panel animate-slide-down">
      <div style={styles.leftGroup}>
        {/* Device Icon Badge */}
        <div style={styles.iconBadge}>
          {preset?.includes('iPad') || preset?.includes('Tablet') ? (
            <Tablet size={15} color="var(--accent)" />
          ) : preset?.includes('MacBook') || preset?.includes('Desktop') ? (
            <Monitor size={15} color="var(--accent)" />
          ) : (
            <Smartphone size={15} color="var(--accent)" />
          )}
        </div>

        <span style={styles.titleText}>Modo Responsive</span>

        {/* Device Presets Select */}
        <div style={styles.selectWrapper}>
          <select
            value={preset || 'iPhone 15 Pro'}
            onChange={handleSelectPreset}
            style={styles.presetSelect}
          >
            {DEVICE_PRESETS.map((p) => (
              <option key={p.name} value={p.name} style={{ background: '#12131a', color: '#fff' }}>
                {p.name} {p.type !== 'custom' ? `(${p.width} × ${p.height})` : ''}
              </option>
            ))}
            {preset === 'Personalizado' && (
              <option value="Personalizado" style={{ background: '#12131a', color: '#fff' }}>
                Personalizado ({width} × {height})
              </option>
            )}
          </select>
          <ChevronDown size={13} style={styles.selectArrow} />
        </div>

        {/* Dimension inputs */}
        <div style={styles.dimInputGroup}>
          <input
            type="number"
            value={width}
            onChange={(e) => handleWidthChange(e.target.value)}
            style={styles.dimInput}
            title="Ancho en píxeles (Width)"
          />
          <span style={styles.dimCross}>×</span>
          <input
            type="number"
            value={height}
            onChange={(e) => handleHeightChange(e.target.value)}
            style={styles.dimInput}
            title="Alto en píxeles (Height)"
          />
          <span style={styles.pxLabel}>px</span>
        </div>

        {/* Rotate Button */}
        <button
          style={{ ...styles.actionBtn, ...(isRotated ? styles.actionBtnActive : {}) }}
          onClick={handleRotate}
          title={isRotated ? 'Girar a orientación vertical (Portrait)' : 'Girar a orientación horizontal (Landscape)'}
        >
          <RotateCw size={14} />
          <span>{isRotated ? 'Horizontal' : 'Vertical'}</span>
        </button>
      </div>

      <div style={styles.rightGroup}>
        {/* Zoom / Scale Selector */}
        <div style={styles.scaleGroup}>
          <ZoomIn size={14} color="var(--text-muted)" />
          {[0.5, 0.75, 1].map((s) => (
            <button
              key={s}
              style={{
                ...styles.scaleBtn,
                ...(scale === s ? styles.scaleBtnActive : {})
              }}
              onClick={() => handleScaleChange(s)}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>

        {/* Toggle Frame / Bezel */}
        <button
          style={{ ...styles.actionBtn, ...(showFrame ? styles.actionBtnActive : {}) }}
          onClick={() => onChangeResponsiveMode({ showFrame: !showFrame })}
          title="Mostrar / ocultar marco físico del dispositivo"
        >
          <Sliders size={13} />
          <span>Marco {showFrame ? 'On' : 'Off'}</span>
        </button>

        {/* Close Responsive Mode Button */}
        <button
          style={styles.closeBtn}
          onClick={onClose}
          title="Salir del Modo Responsive"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  barContainer: {
    height: '42px',
    background: 'linear-gradient(180deg, rgba(20, 22, 30, 0.98), rgba(14, 15, 22, 0.96))',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 14px',
    zIndex: 40,
    fontFamily: 'Lato, -apple-system, sans-serif',
    flexShrink: 0
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  iconBadge: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '0.2px'
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  presetSelect: {
    appearance: 'none',
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '4px 26px 4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s ease'
  },
  selectArrow: {
    position: 'absolute',
    right: '8px',
    pointerEvents: 'none',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  dimInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    padding: '2px 8px'
  },
  dimInput: {
    width: '52px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'JetBrains Mono, monospace'
  },
  dimCross: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  pxLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  actionBtnActive: {
    background: 'rgba(255, 255, 255, 0.16)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)'
  },
  scaleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '2px 4px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  scaleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  scaleBtnActive: {
    background: 'var(--accent)',
    color: '#000000',
    fontWeight: '800'
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};
