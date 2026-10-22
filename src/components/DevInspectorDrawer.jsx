import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  X,
  MousePointer,
  Palette,
  Layers,
  Sparkles,
  FileCode,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  Eye,
  Sliders
} from 'lucide-react';

export default function DevInspectorDrawer({
  isOpen,
  onClose,
  elementData,
  onPickAnother,
  onToggleResponsive,
  isResponsiveActive = false
}) {
  const [activeTab, setActiveTab] = useState('visual');
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState('');
  const [selectedLayerIdx, setSelectedLayerIdx] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [drawerWidth, setDrawerWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(480);

  // Reset to first layer when new element is inspected
  useEffect(() => {
    setSelectedLayerIdx(0);
  }, [elementData]);

  // Handle drawer drag resizing from left edge
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(380, Math.min(760, startWidthRef.current + delta));
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!isOpen || !elementData) return null;

  const layers = elementData.layers && elementData.layers.length > 0 ? elementData.layers : [elementData];
  const activeElement = layers[selectedLayerIdx] || layers[0] || elementData;
  const s = activeElement.styles || {};

  const handleCopy = (text, type = 'code') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedType(type);
    setTimeout(() => {
      setCopied(false);
      setCopiedType('');
    }, 1800);
  };

  const getFigmaSnippet = () => {
    if (!activeElement.styles) return '';
    return `/* Dozzo Dev Studio -> Figma Properties */
Element: <${activeElement.tagName}>
Dimensions: ${s.width} × ${s.height}
Font Family: ${s.fontFamily}
Font Size: ${s.fontSize}
Font Weight: ${s.fontWeight}
Line Height: ${s.lineHeight}
Letter Spacing: ${s.letterSpacing || 'normal'}
Color: ${s.color}
Background: ${s.backgroundColor}
Border Radius: ${s.borderRadius}
Border: ${s.border}
Box Shadow: ${s.boxShadow}
Padding: ${s.padding}
Margin: ${s.margin}
Auto-Layout: ${s.display} (${s.flexDirection || 'row'}, Gap: ${s.gap})
Alignment: ${s.alignItems || 'stretch'} / ${s.justifyContent || 'flex-start'}
Opacity: ${s.opacity || '1'}`;
  };

  // Parse Box Model values into clean pixel representations
  const parseBoxValues = (str) => {
    if (!str || typeof str !== 'string') return { top: '0', right: '0', bottom: '0', left: '0' };
    const parts = str.trim().split(/\s+/).map((p) => p.replace('px', '').trim());
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
    if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    return { top: '0', right: '0', bottom: '0', left: '0' };
  };

  const paddingVals = parseBoxValues(s.padding);
  const marginVals = parseBoxValues(s.margin);
  const borderVal = s.borderWidth ? s.borderWidth.replace('px', '') : '0';

  const previewW = activeElement.rect?.width || 120;
  const previewH = activeElement.rect?.height || 40;

  return (
    <div
      style={{
        ...styles.container,
        width: `${drawerWidth}px`
      }}
      className="glass-panel animate-slide-left"
    >
      {/* Resizer Handle on Left Edge */}
      <div
        style={styles.resizerHandle}
        onMouseDown={(e) => {
          setIsResizing(true);
          startXRef.current = e.clientX;
          startWidthRef.current = drawerWidth;
        }}
        title="Arrastrar para ajustar ancho del panel"
      />

      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBadge}>
            <Code2 size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={styles.title}>
              Dozzo Dev Studio
            </div>
            <div style={styles.subtitle}>
              <span style={styles.tagBadge}>&lt;{activeElement.tagName}&gt;</span>
              {activeElement.rect ? ` • ${activeElement.rect.width}×${activeElement.rect.height}px` : ''}
              {activeElement.className && typeof activeElement.className === 'string'
                ? ` (.${activeElement.className.split(' ')[0].slice(0, 20)})`
                : ''}
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          {/* Toggle Responsive Mode */}
          {onToggleResponsive && (
            <button
              style={{
                ...styles.iconActionBtn,
                ...(isResponsiveActive ? styles.iconActionBtnActive : {})
              }}
              onClick={onToggleResponsive}
              title={isResponsiveActive ? 'Desactivar Modo Responsive' : 'Activar Modo Responsive (Móvil / Tablet)'}
            >
              <Smartphone size={14} />
            </button>
          )}

          {/* Pick another element crosshair */}
          <button
            style={styles.pickBtn}
            onClick={onPickAnother}
            title="Hacer clic para inspeccionar otro elemento en la página"
          >
            <MousePointer size={13} />
            <span>Inspeccionar</span>
          </button>

          {/* Close */}
          <button style={styles.closeBtn} onClick={onClose} title="Cerrar panel">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Hierarchy / Layers Carousel */}
      {layers.length > 1 && (
        <div style={styles.layersBar}>
          <div style={styles.layersHeader}>
            <Layers size={13} color="var(--accent)" />
            <span>Jerarquía de Capas ({layers.length}):</span>
          </div>
          <div style={styles.layersChipsList}>
            {layers.map((layer, idx) => {
              const isSelected = idx === selectedLayerIdx;
              return (
                <button
                  key={idx}
                  style={{
                    ...styles.layerChip,
                    ...(isSelected ? styles.layerChipSelected : {})
                  }}
                  onClick={() => setSelectedLayerIdx(idx)}
                  title={`Ver capa ${idx + 1}: ${layer.layerName} - <${layer.tagName}>`}
                >
                  <span style={styles.layerIdx}>{idx + 1}</span>
                  <span style={styles.layerTag}>&lt;{layer.tagName}&gt;</span>
                  {layer.rect && (
                    <span style={styles.layerDim}>
                      {layer.rect.width}×{layer.rect.height}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={styles.tabsStrip}>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'visual' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('visual')}
        >
          <Eye size={13} />
          <span>Visual & Box Model</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'figma' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('figma')}
        >
          <Palette size={13} />
          <span>Figma & Estilos</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'jsx' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('jsx')}
        >
          <FileCode size={13} />
          <span>React (JSX)</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'html' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('html')}
        >
          <Code2 size={13} />
          <span>HTML</span>
        </button>
      </div>

      {/* Body Area */}
      <div style={styles.bodyScroll}>
        {/* TAB 1: VISUAL & CHROME BOX MODEL */}
        {activeTab === 'visual' && (
          <div style={styles.tabContent}>
            {/* Visual Graphic Representation Card */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleRow}>
                  <Sparkles size={14} color="var(--accent)" />
                  <span style={styles.sectionTitle}>Referencia Gráfica del Elemento</span>
                </div>
                <div style={styles.zoomControls}>
                  <button
                    style={styles.zoomBtn}
                    onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                    title="Reducir zoom"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <span style={styles.zoomLabel}>{Math.round(previewZoom * 100)}%</span>
                  <button
                    style={styles.zoomBtn}
                    onClick={() => setPreviewZoom((z) => Math.min(2.5, z + 0.25))}
                    title="Aumentar zoom"
                  >
                    <ZoomIn size={12} />
                  </button>
                </div>
              </div>

              {/* Graphic Stage Canvas */}
              <div style={styles.graphicStage}>
                <div
                  style={{
                    ...styles.graphicRenderBox,
                    transform: `scale(${previewZoom})`
                  }}
                >
                  {activeElement.figmaSvg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: activeElement.figmaSvg }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxWidth: '100%',
                        maxHeight: '180px'
                      }}
                    />
                  ) : activeElement.svg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: activeElement.svg }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: s.color || '#fff'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        padding: `${s.paddingTop || '10px'} ${s.paddingRight || '14px'} ${s.paddingBottom || '10px'} ${s.paddingLeft || '14px'}`,
                        backgroundColor: s.backgroundColor && s.backgroundColor !== 'transparent' ? s.backgroundColor : 'rgba(255,255,255,0.06)',
                        color: s.color || '#ffffff',
                        borderRadius: s.borderRadius || '6px',
                        border: s.border && s.border !== 'none' ? s.border : '1px solid rgba(255,255,255,0.12)',
                        boxShadow: s.boxShadow !== 'none' ? s.boxShadow : 'none',
                        fontFamily: s.fontFamily || 'sans-serif',
                        fontSize: s.fontSize || '13px',
                        fontWeight: s.fontWeight || '500',
                        textAlign: 'center',
                        maxWidth: '320px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {activeElement.text || `<${activeElement.tagName}>`}
                    </div>
                  )}
                </div>

                {/* Floating Dimension Tag */}
                <div style={styles.dimensionBadge}>
                  <span>{previewW} × {previewH} px</span>
                </div>
              </div>

              {/* Quick Copy Action Bar */}
              <div style={styles.quickActionsBar}>
                <button
                  style={{ ...styles.primaryActionBtn, background: 'var(--accent)', color: '#000000' }}
                  onClick={() => handleCopy(activeElement.figmaSvg || activeElement.svg || '', 'figma')}
                  title="Copia el componente como vector Figma listo para pegar directamente con Ctrl+V"
                >
                  {copied && copiedType === 'figma' ? <Check size={14} /> : <Sparkles size={14} />}
                  <span>{copied && copiedType === 'figma' ? '¡Copiado a Figma!' : 'Copiar para Figma (Ctrl+V)'}</span>
                </button>

                <button
                  style={styles.secondaryActionBtn}
                  onClick={() => handleCopy(activeElement.jsx || '', 'jsx')}
                  title="Copiar código del componente en formato React JSX"
                >
                  {copied && copiedType === 'jsx' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                  <span>Copiar JSX</span>
                </button>
              </div>
            </div>

            {/* Interactive Chrome Box Model Diagram */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleRow}>
                  <Box size={14} color="var(--accent)" />
                  <span style={styles.sectionTitle}>Modelo de Caja (Box Model)</span>
                </div>
                <span style={styles.sectionSub}>Valores en píxeles</span>
              </div>

              <div style={styles.boxModelWrapper}>
                {/* Margin Box (Orange) */}
                <div style={styles.bmMargin}>
                  <span style={styles.bmTagMargin}>margin</span>
                  <span style={styles.bmValTop}>{marginVals.top}</span>
                  <span style={styles.bmValLeft}>{marginVals.left}</span>
                  <span style={styles.bmValRight}>{marginVals.right}</span>
                  <span style={styles.bmValBottom}>{marginVals.bottom}</span>

                  {/* Border Box (Yellow) */}
                  <div style={styles.bmBorder}>
                    <span style={styles.bmTagBorder}>border</span>
                    <span style={styles.bmValTop}>{borderVal}</span>
                    <span style={styles.bmValLeft}>{borderVal}</span>
                    <span style={styles.bmValRight}>{borderVal}</span>
                    <span style={styles.bmValBottom}>{borderVal}</span>

                    {/* Padding Box (Green) */}
                    <div style={styles.bmPadding}>
                      <span style={styles.bmTagPadding}>padding</span>
                      <span style={styles.bmValTop}>{paddingVals.top}</span>
                      <span style={styles.bmValLeft}>{paddingVals.left}</span>
                      <span style={styles.bmValRight}>{paddingVals.right}</span>
                      <span style={styles.bmValBottom}>{paddingVals.bottom}</span>

                      {/* Content Box (Blue) */}
                      <div style={styles.bmContent}>
                        <span style={styles.bmContentText}>
                          {previewW} × {previewH}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Tipografía</div>
                <div style={styles.metricVal}>{s.fontFamily || 'Sans-serif'}</div>
                <div style={styles.metricSub}>{s.fontSize} • Peso {s.fontWeight}</div>
              </div>

              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Colores</div>
                <div style={styles.colorRow}>
                  <div style={{ ...styles.swatch, backgroundColor: s.color || '#fff' }} />
                  <span style={styles.colorHex}>{s.color || '#ffffff'}</span>
                </div>
                <div style={styles.colorRow}>
                  <div style={{ ...styles.swatch, backgroundColor: s.backgroundColor || 'transparent' }} />
                  <span style={styles.colorHex}>{s.backgroundColor || 'transparent'}</span>
                </div>
              </div>

              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Bordes & Sombra</div>
                <div style={styles.metricVal}>Radio: {s.borderRadius || '0px'}</div>
                <div style={styles.metricSub}>Sombra: {s.boxShadow !== 'none' ? 'Sí' : 'Ninguna'}</div>
              </div>

              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Layout (Auto-Layout)</div>
                <div style={styles.metricVal}>{s.display || 'block'} {s.flexDirection ? `(${s.flexDirection})` : ''}</div>
                <div style={styles.metricSub}>Gap: {s.gap || '0px'}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIGMA & ESTILOS */}
        {activeTab === 'figma' && (
          <div style={styles.tabContent}>
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleRow}>
                  <Sparkles size={14} color="var(--accent)" />
                  <span style={styles.sectionTitle}>Exportación Directa a Figma</span>
                </div>
                <button
                  style={{ ...styles.primaryActionBtn, background: 'var(--accent)', color: '#000' }}
                  onClick={() => handleCopy(activeElement.figmaSvg || activeElement.svg || '', 'figma')}
                >
                  {copied && copiedType === 'figma' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied && copiedType === 'figma' ? '¡Copiado!' : 'Copiar Capas Vectoriales'}</span>
                </button>
              </div>
              <p style={styles.tipText}>
                Pega directamente en el lienzo de Figma con <strong>Ctrl + V</strong>. Todas las capas, textos editables, fondos e iconos se crearán como componentes vectoriales nativos.
              </p>
            </div>

            {/* Complete Styles Specs */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Tokens CSS & Especificaciones</span>
                <button
                  style={styles.secondaryActionBtn}
                  onClick={() => handleCopy(getFigmaSnippet(), 'specs')}
                >
                  {copied && copiedType === 'specs' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                  <span>Copiar Especificaciones</span>
                </button>
              </div>
              <div style={styles.specsList}>
                {Object.entries(s).map(([key, val]) => {
                  if (!val || val === 'none' || val === 'normal') return null;
                  return (
                    <div key={key} style={styles.specRow}>
                      <span style={styles.specKey}>{key}</span>
                      <span style={styles.specVal}>{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REACT JSX */}
        {activeTab === 'jsx' && (
          <div style={styles.tabContent}>
            <div style={styles.codeCard}>
              <div style={styles.codeHeader}>
                <span>Componente React (JSX limpio)</span>
                <button
                  style={styles.secondaryActionBtn}
                  onClick={() => handleCopy(activeElement.jsx || '', 'jsx')}
                >
                  {copied && copiedType === 'jsx' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                  <span>{copied && copiedType === 'jsx' ? '¡Copiado!' : 'Copiar JSX'}</span>
                </button>
              </div>
              <pre style={styles.codePre}>
                <code>{activeElement.jsx}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: HTML PURO */}
        {activeTab === 'html' && (
          <div style={styles.tabContent}>
            <div style={styles.codeCard}>
              <div style={styles.codeHeader}>
                <span>Estructura HTML original</span>
                <button
                  style={styles.secondaryActionBtn}
                  onClick={() => handleCopy(activeElement.html || '', 'html')}
                >
                  {copied && copiedType === 'html' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                  <span>{copied && copiedType === 'html' ? '¡Copiado!' : 'Copiar HTML'}</span>
                </button>
              </div>
              <pre style={styles.codePre}>
                <code>{activeElement.html}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(16, 17, 24, 0.98), rgba(10, 11, 16, 0.98))',
    borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.75)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Lato, -apple-system, sans-serif',
    backdropFilter: 'blur(20px)',
    transition: 'width 0.05s ease'
  },
  resizerHandle: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '6px',
    cursor: 'ew-resize',
    zIndex: 10,
    background: 'transparent',
    transition: 'background 0.2s'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.03)',
    flexShrink: 0
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  iconBadge: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  title: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '0.3px'
  },
  subtitle: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  tagBadge: {
    color: 'var(--accent)',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '700'
  },
  iconActionBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  iconActionBtnActive: {
    background: 'var(--accent)',
    color: '#000000',
    borderColor: 'var(--accent)'
  },
  pickBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  layersBar: {
    padding: '8px 14px',
    background: 'rgba(0, 0, 0, 0.35)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    flexShrink: 0
  },
  layersHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '6px'
  },
  layersChipsList: {
    display: 'flex',
    gap: '5px',
    overflowX: 'auto',
    paddingBottom: '2px'
  },
  layerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '5px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '11px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  layerChipSelected: {
    background: 'rgba(255, 255, 255, 0.16)',
    borderColor: 'var(--accent)',
    color: '#ffffff'
  },
  layerIdx: {
    fontSize: '9px',
    fontWeight: '800',
    color: 'var(--accent)',
    background: 'rgba(0,0,0,0.4)',
    padding: '1px 4px',
    borderRadius: '3px'
  },
  layerTag: {
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '600'
  },
  layerDim: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.45)'
  },
  tabsStrip: {
    display: 'flex',
    padding: '0 12px',
    background: 'rgba(0, 0, 0, 0.25)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    gap: '4px',
    flexShrink: 0
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabBtnActive: {
    color: '#ffffff',
    borderBottomColor: 'var(--accent)'
  },
  bodyScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px'
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  sectionCard: {
    background: 'rgba(255, 255, 255, 0.035)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '0.2px'
  },
  sectionSub: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.45)'
  },
  zoomControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
    padding: '1px 4px'
  },
  zoomBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: '2px'
  },
  zoomLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600'
  },
  graphicStage: {
    position: 'relative',
    height: '190px',
    borderRadius: '8px',
    background: '#0a0b10 radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 0)',
    backgroundSize: '16px 16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  graphicRenderBox: {
    transition: 'transform 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90%',
    maxHeight: '90%'
  },
  dimensionBadge: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent)',
    fontFamily: 'JetBrains Mono, monospace'
  },
  quickActionsBar: {
    display: 'flex',
    gap: '8px'
  },
  primaryActionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '7px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  secondaryActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 12px',
    borderRadius: '7px',
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  boxModelWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '6px 0'
  },
  bmMargin: {
    position: 'relative',
    background: 'rgba(249, 204, 157, 0.12)',
    border: '1px dashed rgba(249, 204, 157, 0.5)',
    borderRadius: '6px',
    padding: '22px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmBorder: {
    position: 'relative',
    background: 'rgba(255, 230, 153, 0.15)',
    border: '1px solid rgba(255, 230, 153, 0.6)',
    borderRadius: '5px',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmPadding: {
    position: 'relative',
    background: 'rgba(195, 230, 195, 0.15)',
    border: '1px dashed rgba(195, 230, 195, 0.6)',
    borderRadius: '4px',
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmContent: {
    background: 'rgba(142, 197, 255, 0.3)',
    border: '1px solid rgba(142, 197, 255, 0.8)',
    borderRadius: '3px',
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmTagMargin: {
    position: 'absolute',
    top: '3px',
    left: '5px',
    fontSize: '9px',
    color: 'rgba(249, 204, 157, 0.85)',
    fontWeight: '700'
  },
  bmTagBorder: {
    position: 'absolute',
    top: '3px',
    left: '5px',
    fontSize: '9px',
    color: 'rgba(255, 230, 153, 0.85)',
    fontWeight: '700'
  },
  bmTagPadding: {
    position: 'absolute',
    top: '3px',
    left: '5px',
    fontSize: '9px',
    color: 'rgba(195, 230, 195, 0.85)',
    fontWeight: '700'
  },
  bmValTop: {
    position: 'absolute',
    top: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff'
  },
  bmValBottom: {
    position: 'absolute',
    bottom: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff'
  },
  bmValLeft: {
    position: 'absolute',
    left: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff'
  },
  bmValRight: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff'
  },
  bmContentText: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'JetBrains Mono, monospace'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '9px 12px'
  },
  metricLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '3px'
  },
  metricVal: {
    fontSize: '12px',
    color: '#ffffff',
    fontWeight: '700'
  },
  metricSub: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '2px'
  },
  colorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '3px'
  },
  swatch: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    border: '1px solid rgba(255, 255, 255, 0.25)'
  },
  colorHex: {
    fontSize: '11px',
    color: '#ffffff',
    fontFamily: 'JetBrains Mono, monospace'
  },
  tipText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: '1.4',
    margin: 0
  },
  specsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '260px',
    overflowY: 'auto'
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 6px',
    borderRadius: '4px',
    background: 'rgba(0, 0, 0, 0.2)',
    fontSize: '11px'
  },
  specKey: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '600'
  },
  specVal: {
    color: 'var(--accent)',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '600'
  },
  codeCard: {
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  codePre: {
    margin: 0,
    padding: '12px',
    fontSize: '11px',
    color: '#e2e8f0',
    fontFamily: 'JetBrains Mono, monospace',
    lineHeight: '1.5',
    maxHeight: '400px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
};
