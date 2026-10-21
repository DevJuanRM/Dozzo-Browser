import React, { useState } from 'react';
import { Code2, Copy, Check, X, MousePointer, Palette, Layers, Sparkles, FileCode } from 'lucide-react';

export default function DevInspectorDrawer({
  isOpen,
  onClose,
  elementData,
  onPickAnother
}) {
  const [activeTab, setActiveTab] = useState('jsx');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !elementData) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const getFigmaSnippet = () => {
    if (!elementData.styles) return '';
    const s = elementData.styles;
    return `/* Dozzo Dev Export -> Figma Properties & CSS */
Font Family: ${s.fontFamily}
Font Size: ${s.fontSize}
Font Weight: ${s.fontWeight}
Line Height: ${s.lineHeight}
Letter Spacing: ${s.letterSpacing || 'normal'}
Color: ${s.color}
Background: ${s.backgroundColor}
Dimensions: ${s.width} × ${s.height}
Border Radius: ${s.borderRadius}
Border: ${s.border}
Box Shadow: ${s.boxShadow}
Padding: ${s.padding}
Margin: ${s.margin}
Auto-Layout: ${s.display} (${s.flexDirection || 'row'}, Gap: ${s.gap})
Alignment: ${s.alignItems || 'stretch'} / ${s.justifyContent || 'flex-start'}
Opacity: ${s.opacity || '1'}`;
  };

  return (
    <div style={styles.container} className="glass-panel animate-slide-down">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBadge}>
            <Code2 size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={styles.title}>
              Dozzo Dev Studio • <span style={styles.tagBadge}>&lt;{elementData.tagName}&gt;</span>
            </div>
            <div style={styles.subtitle}>
              {typeof elementData.className === 'string' && elementData.className
                ? `.${elementData.className.slice(0, 40)}`
                : 'Elemento seleccionado'}
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.pickBtn} onClick={onPickAnother} title="Inspeccionar otro elemento">
            <MousePointer size={14} />
            <span>Seleccionar otro</span>
          </button>
          <button style={styles.closeBtn} onClick={onClose} title="Cerrar Inspector">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsStrip}>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'jsx' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('jsx')}
        >
          <FileCode size={14} />
          <span>React (JSX)</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'html' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('html')}
        >
          <Code2 size={14} />
          <span>HTML Puro</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'figma' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('figma')}
        >
          <Palette size={14} />
          <span>Estilos & Figma</span>
        </button>

        {elementData.svg && (
          <button
            style={{ ...styles.tabBtn, ...(activeTab === 'svg' ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab('svg')}
          >
            <Sparkles size={14} color="var(--accent)" />
            <span>Código SVG</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div style={styles.body}>
        {activeTab === 'jsx' && (
          <div style={styles.codeWrapper}>
            <div style={styles.codeHeader}>
              <span>Listo para copiar y pegar en tus componentes React</span>
              <button style={styles.copyBtn} onClick={() => handleCopy(elementData.jsx)}>
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                <span>{copied ? '¡Copiado!' : 'Copiar JSX'}</span>
              </button>
            </div>
            <pre style={styles.codePre}>
              <code>{elementData.jsx}</code>
            </pre>
          </div>
        )}

        {activeTab === 'html' && (
          <div style={styles.codeWrapper}>
            <div style={styles.codeHeader}>
              <span>Estructura HTML original</span>
              <button style={styles.copyBtn} onClick={() => handleCopy(elementData.html)}>
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                <span>{copied ? '¡Copiado!' : 'Copiar HTML'}</span>
              </button>
            </div>
            <pre style={styles.codePre}>
              <code>{elementData.html}</code>
            </pre>
          </div>
        )}

        {activeTab === 'figma' && (
          <div style={styles.figmaWrapper}>
            <div style={styles.codeHeader}>
              <div style={styles.figmaTip}>
                <span>🎨</span>
                <span>
                  <strong>Componente Figma Completo:</strong> Extraído con {
                    (elementData.figmaSvg?.match(/<(rect|text|g|image)/g) || []).length
                  } capas individuales (fondos, textos editables e iconos).
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  style={{ ...styles.copyBtn, background: 'var(--accent)', color: 'var(--accent-text)', fontWeight: '700' }}
                  onClick={() => handleCopy(elementData.figmaSvg || elementData.svg || '')}
                  title="Copia el componente completo con todas sus capas vectoriales y textos editables listos para pegar en Figma con Ctrl+V"
                >
                  {copied ? <Check size={14} /> : <Sparkles size={14} />}
                  <span>{copied ? '¡Copiado a Figma!' : 'Copiar Capas Vectoriales y Textos (Ctrl+V)'}</span>
                </button>
                <button style={styles.copyBtn} onClick={() => handleCopy(getFigmaSnippet())} title="Copia los valores de estilos CSS">
                  <Copy size={14} />
                  <span>Copiar Especificaciones CSS</span>
                </button>
              </div>
            </div>

            <div style={styles.stylesGrid}>
              <div style={styles.styleCard}>
                <div style={styles.styleLabel}>Tipografía</div>
                <div style={styles.styleValue}>{elementData.styles?.fontFamily || 'Default'}</div>
                <div style={styles.styleSub}>
                  {elementData.styles?.fontSize} • Peso {elementData.styles?.fontWeight}
                </div>
              </div>

              <div style={styles.styleCard}>
                <div style={styles.styleLabel}>Color de Texto</div>
                <div style={styles.colorRow}>
                  <div style={{ ...styles.colorPreview, backgroundColor: elementData.styles?.color }} />
                  <div style={styles.styleValue}>{elementData.styles?.color}</div>
                </div>
              </div>

              <div style={styles.styleCard}>
                <div style={styles.styleLabel}>Fondo</div>
                <div style={styles.colorRow}>
                  <div style={{ ...styles.colorPreview, backgroundColor: elementData.styles?.backgroundColor }} />
                  <div style={styles.styleValue}>{elementData.styles?.backgroundColor}</div>
                </div>
              </div>

              <div style={styles.styleCard}>
                <div style={styles.styleLabel}>Dimensiones & Bordes</div>
                <div style={styles.styleValue}>
                  {elementData.styles?.width} × {elementData.styles?.height}
                </div>
                <div style={styles.styleSub}>Radio: {elementData.styles?.borderRadius}</div>
              </div>

              <div style={styles.styleCard}>
                <div style={styles.styleLabel}>Espaciado Interno (Padding)</div>
                <div style={styles.styleValue}>{elementData.styles?.padding}</div>
              </div>

              <div style={styles.styleCard}>
                <div style={styles.styleLabel}>Sombra (Box Shadow)</div>
                <div style={styles.styleValue}>{elementData.styles?.boxShadow}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'svg' && elementData.svg && (
          <div style={styles.codeWrapper}>
            <div style={styles.codeHeader}>
              <span>Icono vectorial SVG extraído</span>
              <button style={styles.copyBtn} onClick={() => handleCopy(elementData.svg)}>
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                <span>{copied ? '¡Copiado!' : 'Copiar SVG'}</span>
              </button>
            </div>
            <pre style={styles.codePre}>
              <code>{elementData.svg}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '290px',
    background: 'var(--bg-secondary)',
    borderTop: '2px solid var(--accent)',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Lato, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 18px',
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
    background: 'rgba(240, 185, 11, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  tagBadge: {
    color: 'var(--accent)',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px'
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
  pickBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    fontSize: '12px',
    fontWeight: '700'
  },
  closeBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    color: 'var(--text-muted)'
  },
  tabsStrip: {
    display: 'flex',
    gap: '4px',
    padding: '6px 18px',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-subtle)'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  tabBtnActive: {
    background: 'var(--bg-tertiary)',
    color: 'var(--accent)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 18px'
  },
  codeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    flexWrap: 'wrap',
    gap: '8px'
  },
  figmaTip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: 'var(--text-secondary)'
  },
  kbd: {
    padding: '2px 5px',
    background: 'var(--bg-tertiary)',
    borderRadius: '4px',
    border: '1px solid var(--border-subtle)',
    fontFamily: 'monospace',
    fontWeight: '700'
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    fontSize: '11.5px',
    fontWeight: '700'
  },
  codePre: {
    flex: 1,
    maxHeight: '130px',
    overflowY: 'auto',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px',
    color: '#e2e8f0',
    lineHeight: 1.5,
    userSelect: 'text'
  },
  figmaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  stylesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    overflowY: 'auto'
  },
  styleCard: {
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)'
  },
  styleLabel: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '4px'
  },
  styleValue: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'JetBrains Mono, monospace'
  },
  styleSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  colorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  colorPreview: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.2)'
  }
};
