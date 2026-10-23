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
  Box,
  Eye,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ListTree,
  ChevronDown,
  Terminal,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Moon,
  Sun,
  Image as ImageIcon
} from 'lucide-react';

const DEV_DRAWER_STORAGE_KEY = 'dozzo_dev_drawer_width';

export default function DevInspectorDrawer({
  isOpen,
  onClose,
  elementData,
  onPickAnother,
  onToggleResponsive,
  isResponsiveActive = false
}) {
  const [activeTab, setActiveTab] = useState('visor'); // 'visor' | 'styles' | 'code' | 'figma'
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewBg, setPreviewBg] = useState('checker'); // 'checker' | 'dark' | 'light'
  const [codeMode, setCodeMode] = useState('jsx'); // 'jsx' | 'html'
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState('');
  const [selectedLayerIdx, setSelectedLayerIdx] = useState(0);
  const [drawerWidth, setDrawerWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(DEV_DRAWER_STORAGE_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 380 && val <= 850) return val;
      }
    } catch (_) {}
    return 480;
  });
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(480);

  // Breadcrumb horizontal scroll & tree popup states
  const breadcrumbScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showTreeDropdown, setShowTreeDropdown] = useState(false);
  const isDraggingBreadcrumbRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);

  const checkBreadcrumbScroll = () => {
    if (!breadcrumbScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = breadcrumbScrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  const handleScrollBreadcrumb = (direction) => {
    if (!breadcrumbScrollRef.current) return;
    const offset = direction === 'left' ? -150 : 150;
    breadcrumbScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkBreadcrumbScroll, 220);
  };

  // Reset to first layer & 100% zoom when new element is inspected
  useEffect(() => {
    setSelectedLayerIdx(0);
    setPreviewZoom(1);
    setShowTreeDropdown(false);
  }, [elementData]);

  // Auto-scroll selected element into view and re-check scroll boundaries
  useEffect(() => {
    if (!breadcrumbScrollRef.current) return;
    const activePill = breadcrumbScrollRef.current.querySelector(`[data-layer-idx="${selectedLayerIdx}"]`);
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
    const t = setTimeout(checkBreadcrumbScroll, 200);
    return () => clearTimeout(t);
  }, [selectedLayerIdx, elementData, drawerWidth]);

  // Handle drawer drag resizing from left edge
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(360, Math.min(850, startWidthRef.current + delta));
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        try {
          localStorage.setItem(DEV_DRAWER_STORAGE_KEY, String(drawerWidth));
        } catch (_) {}
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, drawerWidth]);

  if (!isOpen || !elementData) return null;

  const layers = elementData.layers && elementData.layers.length > 0 ? elementData.layers : [elementData];
  const activeElement = layers[selectedLayerIdx] || layers[0] || elementData;
  const s = activeElement.styles || {};

  const handleCopy = async (text, type = 'code') => {
    if (!text) return;
    try {
      if (type === 'figma') {
        const textBlob = new Blob([text], { type: 'text/plain' });
        const svgBlob = new Blob([text], { type: 'image/svg+xml' });
        const htmlBlob = new Blob([text], { type: 'text/html' });

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': textBlob,
              'image/svg+xml': svgBlob,
              'text/html': htmlBlob
            })
          ]);
        } catch (clipErr) {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setCopiedType(type);
      setTimeout(() => {
        setCopied(false);
        setCopiedType('');
      }, 1800);
    } catch (e) {
      try {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setCopiedType(type);
        setTimeout(() => {
          setCopied(false);
          setCopiedType('');
        }, 1800);
      } catch (err2) {}
    }
  };

  const handleCopyAsPng = () => {
    const svgCode = activeElement.figmaSvg || activeElement.svg;
    if (!svgCode) return;
    try {
      const img = new Image();
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const scale = 2; // High-DPI 2x
          const w = Math.max(40, (activeElement.rect?.width || 300)) * scale;
          const h = Math.max(30, (activeElement.rect?.height || 200)) * scale;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          URLObj.revokeObjectURL(blobURL);

          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob })
                ]);
                setCopied(true);
                setCopiedType('png');
                setTimeout(() => {
                  setCopied(false);
                  setCopiedType('');
                }, 1800);
              } catch (clipErr) {
                console.error('Clipboard image write failed:', clipErr);
              }
            }
          }, 'image/png');
        } catch (err) {
          console.error('Error drawing SVG to canvas for PNG copy:', err);
        }
      };
      img.onerror = (e) => {
        console.error('Failed to load SVG for PNG conversion:', e);
      };
      img.src = blobURL;
    } catch (err) {
      console.error('Error in handleCopyAsPng:', err);
    }
  };

  // Convert CSS object to formatted CSS string
  const getCssSnippet = () => {
    if (!s) return '';
    const lines = [];
    if (s.width) lines.push(`  width: ${s.width};`);
    if (s.height) lines.push(`  height: ${s.height};`);
    if (s.display) lines.push(`  display: ${s.display};`);
    if (s.flexDirection && s.display === 'flex') lines.push(`  flex-direction: ${s.flexDirection};`);
    if (s.alignItems) lines.push(`  align-items: ${s.alignItems};`);
    if (s.justifyContent) lines.push(`  justify-content: ${s.justifyContent};`);
    if (s.gap && s.gap !== 'normal') lines.push(`  gap: ${s.gap};`);
    if (s.padding && s.padding !== '0px') lines.push(`  padding: ${s.padding};`);
    if (s.margin && s.margin !== '0px') lines.push(`  margin: ${s.margin};`);
    if (s.backgroundColor && s.backgroundColor !== 'transparent') lines.push(`  background-color: ${s.backgroundColor};`);
    if (s.color) lines.push(`  color: ${s.color};`);
    if (s.fontFamily) lines.push(`  font-family: ${s.fontFamily};`);
    if (s.fontSize) lines.push(`  font-size: ${s.fontSize};`);
    if (s.fontWeight) lines.push(`  font-weight: ${s.fontWeight};`);
    if (s.lineHeight && s.lineHeight !== 'normal') lines.push(`  line-height: ${s.lineHeight};`);
    if (s.borderRadius && s.borderRadius !== '0px') lines.push(`  border-radius: ${s.borderRadius};`);
    if (s.border && s.border !== 'none') lines.push(`  border: ${s.border};`);
    if (s.boxShadow && s.boxShadow !== 'none') lines.push(`  box-shadow: ${s.boxShadow};`);

    return `.${activeElement.className ? activeElement.className.split(' ')[0] : activeElement.tagName.toLowerCase()} {\n${lines.join('\n')}\n}`;
  };

  // Generate clean Tailwind CSS classes estimate
  const getTailwindSnippet = () => {
    const tw = [];
    if (s.display === 'flex') tw.push('flex');
    if (s.flexDirection === 'column') tw.push('flex-col');
    if (s.alignItems === 'center') tw.push('items-center');
    if (s.justifyContent === 'center') tw.push('justify-center');
    if (s.justifyContent === 'space-between') tw.push('justify-between');
    if (s.borderRadius && s.borderRadius !== '0px') {
      const r = parseInt(s.borderRadius, 10);
      if (r >= 16) tw.push('rounded-2xl');
      else if (r >= 12) tw.push('rounded-xl');
      else if (r >= 8) tw.push('rounded-lg');
      else if (r >= 4) tw.push('rounded-md');
    }
    if (s.boxShadow && s.boxShadow !== 'none') tw.push('shadow-lg');
    if (s.fontWeight && parseInt(s.fontWeight, 10) >= 700) tw.push('font-bold');
    else if (s.fontWeight && parseInt(s.fontWeight, 10) >= 600) tw.push('font-semibold');
    return tw.join(' ') || 'flex items-center';
  };

  const getFigmaSnippet = () => {
    if (!activeElement.styles) return '';
    return `/* Dozzo Dev Mode -> Figma Properties */
Element: <${activeElement.tagName}>
Dimensions: ${s.width} × ${s.height}
Font Family: ${s.fontFamily || 'Sans-Serif'}
Font Size: ${s.fontSize || '14px'}
Font Weight: ${s.fontWeight || '400'}
Line Height: ${s.lineHeight || 'normal'}
Color: ${s.color || '#ffffff'}
Background: ${s.backgroundColor || 'transparent'}
Border Radius: ${s.borderRadius || '0px'}
Border: ${s.border || 'none'}
Box Shadow: ${s.boxShadow || 'none'}
Padding: ${s.padding || '0px'}
Margin: ${s.margin || '0px'}
Auto-Layout: ${s.display} (${s.flexDirection || 'row'}, Gap: ${s.gap || '0px'})
Alignment: ${s.alignItems || 'stretch'} / ${s.justifyContent || 'flex-start'}`;
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

  const previewW = activeElement.rect?.width || 0;
  const previewH = activeElement.rect?.height || 0;

  return (
    <>
      {/* Full-screen invisible overlay during resizing so webviews NEVER capture mouse events */}
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999999,
            cursor: 'col-resize',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        />
      )}

      <div
        style={{
          ...styles.container,
          width: `${drawerWidth}px`,
          transition: isResizing ? 'none' : 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="glass-panel animate-slide-left"
      >
        {/* Resizer Handle on Left Edge */}
        <div
          style={styles.resizerHandle}
          onMouseDown={(e) => {
            e.preventDefault();
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
              <Code2 size={15} color="var(--accent)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.title}>Dev Inspector</span>
                <span style={styles.versionBadge}>PRO</span>
              </div>
              <div style={styles.subtitle}>
                <span style={styles.tagBadge}>&lt;{activeElement.tagName.toLowerCase()}&gt;</span>
                {previewW > 0 && <span style={styles.dimBadge}> • {previewW}×{previewH}px</span>}
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
            title="Hacer clic para inspeccionar otro elemento"
          >
            <MousePointer size={13} color="var(--accent)" />
            <span>Inspeccionar</span>
          </button>

          {/* Close */}
          <button style={styles.closeBtn} onClick={onClose} title="Cerrar panel">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* DOM Hierarchy Section (Professional full-width track with dedicated header & intuitive smooth horizontal scroll) */}
      <div style={styles.breadcrumbSection}>
        {/* Top Header Row: Label, Depth Counter, Scroll Controls, and Tree Toggle */}
        <div style={styles.breadcrumbHeaderRow}>
          <div style={styles.breadcrumbHeaderLeft}>
            <Layers size={13} color="var(--accent)" />
            <span style={styles.breadcrumbLabel}>Jerarquía DOM</span>
            <span style={styles.breadcrumbBadge}>{layers.length} niveles</span>
          </div>

          <div style={styles.breadcrumbHeaderRight}>
            {/* Quick left/right scroll arrows */}
            <button
              style={{
                ...styles.scrollArrowBtn,
                opacity: canScrollLeft ? 1 : 0.4,
                cursor: canScrollLeft ? 'pointer' : 'default'
              }}
              onClick={() => handleScrollBreadcrumb('left')}
              title="Deslizar a la izquierda"
              disabled={!canScrollLeft}
            >
              <ChevronLeft size={12} />
            </button>
            <button
              style={{
                ...styles.scrollArrowBtn,
                opacity: canScrollRight ? 1 : 0.4,
                cursor: canScrollRight ? 'pointer' : 'default'
              }}
              onClick={() => handleScrollBreadcrumb('right')}
              title="Deslizar a la derecha"
              disabled={!canScrollRight}
            >
              <ChevronRight size={12} />
            </button>

            {/* Tree View popup button */}
            <button
              style={{
                ...styles.treeToggleBtn,
                ...(showTreeDropdown ? styles.treeToggleBtnActive : {})
              }}
              onClick={() => setShowTreeDropdown((prev) => !prev)}
              title={`Ver árbol DOM completo (${layers.length} componentes)`}
            >
              <ListTree size={12} />
              <span>Árbol DOM</span>
              <ChevronDown
                size={11}
                style={{
                  transform: showTreeDropdown ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>
          </div>
        </div>

        {/* Dedicated 100% Full-Width Breadcrumb Track */}
        <div style={styles.breadcrumbTrackWrapper}>
          <div
            ref={breadcrumbScrollRef}
            style={styles.breadcrumbScroll}
            className="custom-scrollbar"
            onScroll={checkBreadcrumbScroll}
            onWheel={(e) => {
              if (breadcrumbScrollRef.current) {
                breadcrumbScrollRef.current.scrollLeft += (e.deltaY !== 0 ? e.deltaY : e.deltaX) * 1.2;
                checkBreadcrumbScroll();
              }
            }}
            onMouseDown={(e) => {
              if (e.target.closest('button')) return;
              isDraggingBreadcrumbRef.current = true;
              dragStartXRef.current = e.pageX - (breadcrumbScrollRef.current?.offsetLeft || 0);
              dragScrollLeftRef.current = breadcrumbScrollRef.current?.scrollLeft || 0;
            }}
            onMouseMove={(e) => {
              if (!isDraggingBreadcrumbRef.current || !breadcrumbScrollRef.current) return;
              e.preventDefault();
              const x = e.pageX - (breadcrumbScrollRef.current?.offsetLeft || 0);
              const walk = (x - dragStartXRef.current) * 1.5;
              breadcrumbScrollRef.current.scrollLeft = dragScrollLeftRef.current - walk;
              checkBreadcrumbScroll();
            }}
            onMouseUp={() => {
              isDraggingBreadcrumbRef.current = false;
            }}
            onMouseLeave={() => {
              isDraggingBreadcrumbRef.current = false;
            }}
          >
            {layers.map((layer, idx) => {
              const isSelected = idx === selectedLayerIdx;
              const primaryClass = layer.className && typeof layer.className === 'string'
                ? layer.className.trim().split(/\s+/)[0]
                : '';
              const id = layer.id && typeof layer.id === 'string' ? layer.id.trim() : '';

              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight
                      size={11}
                      color="rgba(255, 255, 255, 0.25)"
                      style={{ flexShrink: 0, margin: '0 1px' }}
                    />
                  )}
                  <button
                    data-layer-idx={idx}
                    style={{
                      ...styles.breadcrumbPill,
                      ...(isSelected ? styles.breadcrumbPillActive : {})
                    }}
                    onClick={(e) => {
                      setSelectedLayerIdx(idx);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    title={`<${layer.tagName.toLowerCase()}${id ? '#' + id : ''}${primaryClass ? '.' + primaryClass : ''}> (Nivel ${idx + 1})`}
                  >
                    <span style={styles.breadcrumbTag}>{layer.tagName.toLowerCase()}</span>
                    {id && <span style={styles.breadcrumbId}>#{id.slice(0, 14)}</span>}
                    {primaryClass && <span style={styles.breadcrumbClass}>.{primaryClass.slice(0, 18)}</span>}
                    {isSelected && <span style={styles.activeDot} />}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Tree Dropdown Flyout */}
        {showTreeDropdown && (
          <div style={styles.treeDropdown} className="glass-panel animate-scale-in">
            <div style={styles.treeDropdownHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ListTree size={13} color="var(--accent)" />
                <span>Estructura de Componentes DOM ({layers.length})</span>
              </div>
              <button
                onClick={() => setShowTreeDropdown(false)}
                style={styles.closeTreeBtn}
                title="Cerrar vista de árbol"
              >
                <X size={12} />
              </button>
            </div>
            <div style={styles.treeList} className="custom-scrollbar">
              {layers.map((layer, idx) => {
                const isSelected = idx === selectedLayerIdx;
                const primaryClass = layer.className && typeof layer.className === 'string'
                  ? layer.className.trim().split(' ')[0]
                  : '';
                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.treeItem,
                      ...(isSelected ? styles.treeItemActive : {}),
                      paddingLeft: `${10 + idx * 8}px`
                    }}
                    onClick={() => {
                      setSelectedLayerIdx(idx);
                      setShowTreeDropdown(false);
                    }}
                    title={`Seleccionar <${layer.tagName.toLowerCase()}>`}
                  >
                    <span style={styles.treeItemPrefix}>↳</span>
                    <span style={styles.breadcrumbTag}>&lt;{layer.tagName.toLowerCase()}&gt;</span>
                    {primaryClass && <span style={styles.breadcrumbClass}>.{primaryClass}</span>}
                    {layer.rect && (
                      <span style={styles.treeDim}>
                        {layer.rect.width}×{layer.rect.height}px
                      </span>
                    )}
                    {isSelected && <span style={styles.activeBadge}>Activo</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modern 4-Tab Bar (Visor Visual prominently featured) */}
      <div style={styles.tabsStrip}>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'visor' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('visor')}
        >
          <Eye size={13} />
          <span>Visor Visual & Caja</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'styles' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('styles')}
        >
          <Sliders size={13} />
          <span>Propiedades CSS</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'code' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('code')}
        >
          <FileCode size={13} />
          <span>Código (JSX / HTML)</span>
        </button>

        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'figma' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('figma')}
        >
          <Palette size={13} />
          <span>Figma Dev Mode</span>
        </button>
      </div>

      {/* Body Area */}
      <div style={styles.bodyScroll} className="custom-scrollbar">
        {/* TAB 1: VISOR VISUAL & BOX MODEL */}
        {activeTab === 'visor' && (
          <div style={styles.tabContent}>
            {/* Visual Graphic Representation Card (VISOR VISUAL DEL COMPONENTE) */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleRow}>
                  <Sparkles size={13} color="var(--accent)" />
                  <span style={styles.sectionTitle}>Visor Visual del Componente</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Canvas Background selector */}
                  <div style={styles.bgSwitcher}>
                    <button
                      style={{
                        ...styles.bgBtn,
                        ...(previewBg === 'checker' ? styles.bgBtnActive : {})
                      }}
                      onClick={() => setPreviewBg('checker')}
                      title="Fondo Cuadrícula"
                    >
                      <Grid size={11} />
                    </button>
                    <button
                      style={{
                        ...styles.bgBtn,
                        ...(previewBg === 'dark' ? styles.bgBtnActive : {})
                      }}
                      onClick={() => setPreviewBg('dark')}
                      title="Fondo Oscuro"
                    >
                      <Moon size={11} />
                    </button>
                    <button
                      style={{
                        ...styles.bgBtn,
                        ...(previewBg === 'light' ? styles.bgBtnActive : {})
                      }}
                      onClick={() => setPreviewBg('light')}
                      title="Fondo Claro"
                    >
                      <Sun size={11} />
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div style={styles.zoomControls}>
                    <button
                      style={styles.zoomBtn}
                      onClick={() => setPreviewZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(1))))}
                      title="Reducir Zoom"
                    >
                      <ZoomOut size={12} />
                    </button>
                    <span style={styles.zoomLabel}>{Math.round(previewZoom * 100)}%</span>
                    <button
                      style={styles.zoomBtn}
                      onClick={() => setPreviewZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                      title="Aumentar Zoom"
                    >
                      <ZoomIn size={12} />
                    </button>
                    {previewZoom !== 1 && (
                      <button
                        style={styles.zoomBtn}
                        onClick={() => setPreviewZoom(1)}
                        title="Restablecer 100%"
                      >
                        <RotateCcw size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Graphic Stage Canvas */}
              <div
                style={{
                  ...styles.graphicStage,
                  background:
                    previewBg === 'checker'
                      ? '#0a0b10 radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 0)'
                      : previewBg === 'light'
                      ? '#ffffff'
                      : '#08080d',
                  backgroundSize: previewBg === 'checker' ? '14px 14px' : undefined
                }}
              >
                <div
                  style={{
                    ...styles.graphicRenderBox,
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'center center'
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
                        maxHeight: '175px'
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
                        padding: s.padding && s.padding !== '0px' ? s.padding : '12px 18px',
                        backgroundColor: s.backgroundColor && s.backgroundColor !== 'transparent' ? s.backgroundColor : 'rgba(255,255,255,0.06)',
                        color: s.color || '#ffffff',
                        borderRadius: s.borderRadius || '6px',
                        border: s.border && s.border !== 'none' ? s.border : '1px solid rgba(255,255,255,0.12)',
                        boxShadow: s.boxShadow && s.boxShadow !== 'none' ? s.boxShadow : 'none',
                        fontFamily: s.fontFamily || 'sans-serif',
                        fontSize: s.fontSize || '13px',
                        fontWeight: s.fontWeight || '500',
                        textAlign: s.textAlign || 'center',
                        display: s.display || 'flex',
                        alignItems: s.alignItems || 'center',
                        justifyContent: s.justifyContent || 'center',
                        gap: s.gap || '8px',
                        maxWidth: '340px',
                        maxHeight: '170px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        userSelect: 'none'
                      }}
                    >
                      {activeElement.text || `<${activeElement.tagName.toLowerCase()}>`}
                    </div>
                  )}
                </div>

                {/* Floating Dimension Tag */}
                <div style={styles.dimensionBadge}>
                  <span>{previewW} × {previewH} px</span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div style={styles.quickBar}>
                <button
                  style={styles.quickBtn}
                  onClick={() => handleCopy(getCssSnippet(), 'css')}
                  title="Copiar reglas CSS del elemento seleccionado"
                >
                  {copied && copiedType === 'css' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{copied && copiedType === 'css' ? 'CSS Copiado' : 'Copiar CSS'}</span>
                </button>

                <button
                  style={styles.quickBtn}
                  onClick={() => handleCopy(getTailwindSnippet(), 'tw')}
                  title="Copiar clases equivalentes de Tailwind CSS"
                >
                  {copied && copiedType === 'tw' ? <Check size={12} color="#10B981" /> : <Zap size={12} color="#38BDF8" />}
                  <span>{copied && copiedType === 'tw' ? 'Tailwind Copiado' : 'Copiar Tailwind'}</span>
                </button>

                <button
                  style={{ ...styles.quickBtn, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  onClick={() => handleCopy(activeElement.figmaSvg || activeElement.svg || '', 'figma')}
                  title="Copiar vector SVG listo para pegar con Ctrl+V en Figma"
                >
                  {copied && copiedType === 'figma' ? <Check size={12} color="#10B981" /> : <Sparkles size={12} />}
                  <span>{copied && copiedType === 'figma' ? 'Vector Copiado' : 'Pegar a Figma'}</span>
                </button>

                <button
                  style={{ ...styles.quickBtn, borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38BDF8' }}
                  onClick={handleCopyAsPng}
                  title="Copiar imagen PNG en alta resolución (2x) para pegar en Figma o cualquier app"
                >
                  {copied && copiedType === 'png' ? <Check size={12} color="#10B981" /> : <ImageIcon size={12} />}
                  <span>{copied && copiedType === 'png' ? 'PNG Copiado' : 'Copiar PNG'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Chrome Box Model Diagram */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleRow}>
                  <Box size={13} color="var(--accent)" />
                  <span style={styles.sectionTitle}>Modelo de Caja (Box Model)</span>
                </div>
                <span style={styles.sectionSub}>px</span>
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

            {/* Clean Computed Properties Specs in Organized Cards */}
            <div style={styles.propertiesGrid}>
              {/* Card 1: Layout & Dimensiones */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>📐 Dimensiones & Posición</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>width × height</span>
                  <span style={styles.propVal}>{s.width || `${previewW}px`} × {s.height || `${previewH}px`}</span>
                </div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>display</span>
                  <span style={styles.propVal}>{s.display || 'block'}</span>
                </div>
                {s.position && s.position !== 'static' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>position</span>
                    <span style={styles.propVal}>{s.position}</span>
                  </div>
                )}
                {s.gap && s.gap !== 'normal' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>gap</span>
                    <span style={styles.propVal}>{s.gap}</span>
                  </div>
                )}
              </div>

              {/* Card 2: Tipografía */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>🖋️ Tipografía</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>font-family</span>
                  <span style={styles.propVal}>{s.fontFamily ? s.fontFamily.split(',')[0].replace(/['"]/g, '') : 'Sans-Serif'}</span>
                </div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>size / weight</span>
                  <span style={styles.propVal}>{s.fontSize || '14px'} • {s.fontWeight || '400'}</span>
                </div>
                {s.lineHeight && s.lineHeight !== 'normal' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>line-height</span>
                    <span style={styles.propVal}>{s.lineHeight}</span>
                  </div>
                )}
              </div>

              {/* Card 3: Colores & Fondos */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>🎨 Colores & Fondo</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>color</span>
                  <div
                    style={styles.colorPill}
                    onClick={() => handleCopy(s.color || '#ffffff', 'color')}
                    title="Clic para copiar color"
                  >
                    <div style={{ ...styles.swatch, backgroundColor: s.color || '#fff' }} />
                    <span style={styles.colorText}>{s.color || '#ffffff'}</span>
                  </div>
                </div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>background</span>
                  <div
                    style={styles.colorPill}
                    onClick={() => handleCopy(s.backgroundColor || 'transparent', 'bg')}
                    title="Clic para copiar fondo"
                  >
                    <div style={{ ...styles.swatch, backgroundColor: s.backgroundColor || 'transparent' }} />
                    <span style={styles.colorText}>{s.backgroundColor || 'transparent'}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Bordes & Sombras */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>🔲 Bordes & Sombra</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>border-radius</span>
                  <span style={styles.propVal}>{s.borderRadius || '0px'}</span>
                </div>
                {s.border && s.border !== 'none' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>border</span>
                    <span style={styles.propVal}>{s.border}</span>
                  </div>
                )}
                <div style={styles.propRow}>
                  <span style={styles.propKey}>box-shadow</span>
                  <span style={styles.propVal}>{s.boxShadow && s.boxShadow !== 'none' ? s.boxShadow.slice(0, 22) + '...' : 'none'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROPIEDADES CSS & BOX MODEL */}
        {activeTab === 'styles' && (
          <div style={styles.tabContent}>
            {/* Quick Copy Action Bar */}
            <div style={styles.quickBar}>
              <button
                style={styles.quickBtn}
                onClick={() => handleCopy(getCssSnippet(), 'css')}
                title="Copiar reglas CSS del elemento seleccionado"
              >
                {copied && copiedType === 'css' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                <span>{copied && copiedType === 'css' ? 'CSS Copiado' : 'Copiar CSS'}</span>
              </button>

              <button
                style={styles.quickBtn}
                onClick={() => handleCopy(getTailwindSnippet(), 'tw')}
                title="Copiar clases equivalentes de Tailwind CSS"
              >
                {copied && copiedType === 'tw' ? <Check size={12} color="#10B981" /> : <Zap size={12} color="#38BDF8" />}
                <span>{copied && copiedType === 'tw' ? 'Tailwind Copiado' : 'Copiar Tailwind'}</span>
              </button>

              <button
                style={{ ...styles.quickBtn, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                onClick={() => handleCopy(activeElement.figmaSvg || activeElement.svg || '', 'figma')}
                title="Copiar vector listo para pegar con Ctrl+V en Figma"
              >
                {copied && copiedType === 'figma' ? <Check size={12} color="#10B981" /> : <Sparkles size={12} />}
                <span>{copied && copiedType === 'figma' ? 'Vector Copiado' : 'Pegar a Figma'}</span>
              </button>
            </div>

            {/* Interactive Chrome Box Model Diagram */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleRow}>
                  <Box size={13} color="var(--accent)" />
                  <span style={styles.sectionTitle}>Modelo de Caja (Box Model)</span>
                </div>
                <span style={styles.sectionSub}>px</span>
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

            {/* Clean Computed Properties Specs in Organized Cards */}
            <div style={styles.propertiesGrid}>
              {/* Card 1: Layout & Dimensiones */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>📐 Dimensiones & Posición</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>width × height</span>
                  <span style={styles.propVal}>{s.width || `${previewW}px`} × {s.height || `${previewH}px`}</span>
                </div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>display</span>
                  <span style={styles.propVal}>{s.display || 'block'}</span>
                </div>
                {s.position && s.position !== 'static' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>position</span>
                    <span style={styles.propVal}>{s.position}</span>
                  </div>
                )}
                {s.zIndex && s.zIndex !== 'auto' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>z-index</span>
                    <span style={styles.propVal}>{s.zIndex}</span>
                  </div>
                )}
                {s.gap && s.gap !== 'normal' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>gap</span>
                    <span style={styles.propVal}>{s.gap}</span>
                  </div>
                )}
              </div>

              {/* Card 2: Tipografía */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>🖋️ Tipografía</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>font-family</span>
                  <span style={styles.propVal}>{s.fontFamily ? s.fontFamily.split(',')[0].replace(/['"]/g, '') : 'Sans-Serif'}</span>
                </div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>size / weight</span>
                  <span style={styles.propVal}>{s.fontSize || '14px'} • {s.fontWeight || '400'}</span>
                </div>
                {s.lineHeight && s.lineHeight !== 'normal' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>line-height</span>
                    <span style={styles.propVal}>{s.lineHeight}</span>
                  </div>
                )}
                {s.textAlign && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>text-align</span>
                    <span style={styles.propVal}>{s.textAlign}</span>
                  </div>
                )}
              </div>

              {/* Card 3: Colores & Fondos */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>🎨 Colores & Fondo</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>color</span>
                  <div
                    style={styles.colorPill}
                    onClick={() => handleCopy(s.color || '#ffffff', 'color')}
                    title="Clic para copiar color"
                  >
                    <div style={{ ...styles.swatch, backgroundColor: s.color || '#fff' }} />
                    <span style={styles.colorText}>{s.color || '#ffffff'}</span>
                  </div>
                </div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>background</span>
                  <div
                    style={styles.colorPill}
                    onClick={() => handleCopy(s.backgroundColor || 'transparent', 'bg')}
                    title="Clic para copiar fondo"
                  >
                    <div style={{ ...styles.swatch, backgroundColor: s.backgroundColor || 'transparent' }} />
                    <span style={styles.colorText}>{s.backgroundColor || 'transparent'}</span>
                  </div>
                </div>
                {s.opacity && s.opacity !== '1' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>opacity</span>
                    <span style={styles.propVal}>{s.opacity}</span>
                  </div>
                )}
              </div>

              {/* Card 4: Bordes & Sombras */}
              <div style={styles.propCard}>
                <div style={styles.propCardHeader}>🔲 Bordes & Sombra</div>
                <div style={styles.propRow}>
                  <span style={styles.propKey}>border-radius</span>
                  <span style={styles.propVal}>{s.borderRadius || '0px'}</span>
                </div>
                {s.border && s.border !== 'none' && (
                  <div style={styles.propRow}>
                    <span style={styles.propKey}>border</span>
                    <span style={styles.propVal}>{s.border}</span>
                  </div>
                )}
                <div style={styles.propRow}>
                  <span style={styles.propKey}>box-shadow</span>
                  <span style={styles.propVal}>{s.boxShadow && s.boxShadow !== 'none' ? s.boxShadow.slice(0, 22) + '...' : 'none'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CÓDIGO (JSX & HTML) */}
        {activeTab === 'code' && (
          <div style={styles.tabContent}>
            <div style={styles.codeSubTabs}>
              <button
                style={{
                  ...styles.codeSubBtn,
                  ...(codeMode === 'jsx' ? styles.codeSubBtnActive : {})
                }}
                onClick={() => setCodeMode('jsx')}
              >
                React (JSX)
              </button>
              <button
                style={{
                  ...styles.codeSubBtn,
                  ...(codeMode === 'html' ? styles.codeSubBtnActive : {})
                }}
                onClick={() => setCodeMode('html')}
              >
                HTML Original
              </button>
            </div>

            <div style={styles.codeCard}>
              <div style={styles.codeHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={12} color="var(--accent)" />
                  <span>{codeMode === 'jsx' ? 'Componente React JSX' : 'Estructura HTML'}</span>
                </div>
                <button
                  style={styles.copyCodeBtn}
                  onClick={() => handleCopy(codeMode === 'jsx' ? activeElement.jsx || '' : activeElement.html || '', 'code')}
                >
                  {copied && copiedType === 'code' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{copied && copiedType === 'code' ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre style={styles.codePre}>
                <code>{codeMode === 'jsx' ? activeElement.jsx || '// No hay JSX disponible' : activeElement.html || '<!-- No hay HTML disponible -->'}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: FIGMA DEV MODE */}
        {activeTab === 'figma' && (
          <div style={styles.tabContent}>
            {/* Primary Action Hero */}
            <div style={styles.figmaHeroCard}>
              <div style={styles.figmaHeroHeader}>
                <div style={styles.figmaIconBox}>
                  <Sparkles size={18} color="var(--accent)" />
                </div>
                <div>
                  <div style={styles.figmaHeroTitle}>Exportación Directa a Figma</div>
                  <div style={styles.figmaHeroSub}>
                    Pega directamente con <strong>Ctrl + V</strong> en Figma para crear componentes vectoriales nativos.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{ ...styles.figmaCopyBtn, flex: 1 }}
                  onClick={() => handleCopy(activeElement.figmaSvg || activeElement.svg || '', 'figma')}
                >
                  {copied && copiedType === 'figma' ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied && copiedType === 'figma' ? '¡Vector Copiado!' : 'Copiar Capas Vectoriales (Ctrl+V)'}</span>
                </button>

                <button
                  style={{
                    ...styles.figmaCopyBtn,
                    flex: 1,
                    background: 'rgba(56, 189, 248, 0.15)',
                    borderColor: 'rgba(56, 189, 248, 0.35)',
                    color: '#38BDF8',
                    boxShadow: 'none'
                  }}
                  onClick={handleCopyAsPng}
                  title="Copiar imagen PNG a 2x de resolución"
                >
                  {copied && copiedType === 'png' ? <Check size={15} color="#10B981" /> : <ImageIcon size={15} />}
                  <span>{copied && copiedType === 'png' ? '¡PNG Copiado!' : 'Copiar Imagen PNG (2x)'}</span>
                </button>
              </div>
            </div>

            {/* Design Tokens & Specs */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Tokens de Diseño & Especificaciones</span>
                <button
                  style={styles.quickBtn}
                  onClick={() => handleCopy(getFigmaSnippet(), 'specs')}
                >
                  {copied && copiedType === 'specs' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
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
      </div>
    </div>
    </>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(14, 15, 22, 0.98), rgba(9, 10, 15, 0.99))',
    borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '-16px 0 44px rgba(0, 0, 0, 0.85)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Lato, -apple-system, sans-serif',
    backdropFilter: 'blur(24px)',
    overflow: 'hidden',
    maxWidth: '100vw',
    boxSizing: 'border-box'
  },
  resizerHandle: {
    position: 'absolute',
    left: '-4px',
    top: 0,
    bottom: 0,
    width: '8px',
    cursor: 'col-resize',
    zIndex: 99,
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
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.01em',
    fontFamily: "'Lato', sans-serif"
  },
  versionBadge: {
    fontSize: '9.5px',
    fontWeight: '800',
    padding: '1px 6px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: '0.5px'
  },
  subtitle: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
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
  dimBadge: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    fontFamily: 'JetBrains Mono, monospace'
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
    padding: '5px 11px',
    borderRadius: '7px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontSize: '11.5px',
    fontWeight: '700',
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
  breadcrumbSection: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(10, 11, 16, 0.70)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
    width: '100%',
    position: 'relative',
    boxSizing: 'border-box'
  },
  breadcrumbHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 12px 4px 12px',
    userSelect: 'none'
  },
  breadcrumbHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  breadcrumbLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  breadcrumbBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent)',
    background: 'rgba(240, 185, 11, 0.12)',
    border: '1px solid rgba(240, 185, 11, 0.25)',
    padding: '1px 6px',
    borderRadius: '10px'
  },
  breadcrumbHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  breadcrumbTrackWrapper: {
    width: '100%',
    padding: '0 10px 6px 10px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center'
  },
  breadcrumbScroll: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflowX: 'auto',
    overflowY: 'hidden',
    width: '100%',
    paddingBottom: '4px',
    paddingTop: '2px',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    cursor: 'grab'
  },
  breadcrumbPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 9px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '11px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.15s ease'
  },
  breadcrumbPillActive: {
    background: 'rgba(240, 185, 11, 0.14)',
    borderColor: 'var(--accent)',
    color: '#ffffff',
    boxShadow: '0 0 10px rgba(240, 185, 11, 0.22)'
  },
  breadcrumbTag: {
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '700',
    color: '#38bdf8'
  },
  breadcrumbId: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '10px',
    color: '#fbbf24',
    fontWeight: '600'
  },
  breadcrumbClass: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.55)',
    fontFamily: 'JetBrains Mono, monospace'
  },
  activeDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: 'var(--accent)',
    marginLeft: '2px',
    boxShadow: '0 0 6px var(--accent)'
  },
  scrollArrowBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s ease',
    padding: 0
  },
  treeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 7px',
    borderRadius: '5px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '10.5px',
    fontWeight: '700',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s ease'
  },
  treeToggleBtnActive: {
    background: 'rgba(240, 185, 11, 0.20)',
    borderColor: 'var(--accent)',
    color: '#ffffff'
  },
  treeDropdown: {
    position: 'absolute',
    top: '100%',
    left: '12px',
    right: '12px',
    maxHeight: '260px',
    background: '#0d0f16',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.85)',
    zIndex: 100,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  treeDropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff'
  },
  closeTreeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px'
  },
  treeList: {
    overflowY: 'auto',
    padding: '6px'
  },
  treeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  treeItemActive: {
    background: 'rgba(240, 185, 11, 0.15)',
    border: '1px solid rgba(240, 185, 11, 0.35)',
    color: '#ffffff'
  },
  treeItemPrefix: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontFamily: 'monospace'
  },
  treeDim: {
    marginLeft: 'auto',
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'JetBrains Mono, monospace'
  },
  activeBadge: {
    fontSize: '9.5px',
    padding: '1px 5px',
    borderRadius: '4px',
    background: 'var(--accent)',
    color: '#000000',
    fontWeight: '800',
    marginLeft: '6px'
  },
  tabsStrip: {
    display: 'flex',
    padding: '0 12px',
    background: 'rgba(0, 0, 0, 0.22)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    gap: '4px',
    flexShrink: 0
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 12px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    fontWeight: '700',
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
    gap: '12px'
  },
  quickBar: {
    display: 'flex',
    gap: '6px'
  },
  quickBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '6px 8px',
    borderRadius: '7px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  sectionCard: {
    background: 'rgba(255, 255, 255, 0.035)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
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
    fontSize: '10.5px',
    color: 'rgba(255, 255, 255, 0.45)'
  },
  graphicStage: {
    position: 'relative',
    height: '190px',
    borderRadius: '8px',
    background: '#0a0b10 radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 0)',
    backgroundSize: '14px 14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'background 0.2s ease'
  },
  graphicRenderBox: {
    transition: 'transform 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '92%',
    maxHeight: '92%'
  },
  dimensionBadge: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent)',
    fontFamily: 'JetBrains Mono, monospace'
  },
  bgSwitcher: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.35)',
    borderRadius: '5px',
    padding: '1px 2px',
    gap: '2px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  bgBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.55)',
    cursor: 'pointer',
    padding: '3px 5px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  bgBtnActive: {
    background: 'rgba(255, 255, 255, 0.18)',
    color: '#ffffff'
  },
  zoomControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    background: 'rgba(0, 0, 0, 0.35)',
    borderRadius: '5px',
    padding: '1px 4px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  zoomBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: '3px 4px',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  zoomLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '700',
    fontFamily: 'JetBrains Mono, monospace',
    minWidth: '32px',
    textAlign: 'center'
  },
  boxModelWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '4px 0'
  },
  bmMargin: {
    position: 'relative',
    background: 'rgba(249, 204, 157, 0.12)',
    border: '1px dashed rgba(249, 204, 157, 0.5)',
    borderRadius: '6px',
    padding: '20px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmBorder: {
    position: 'relative',
    background: 'rgba(255, 230, 153, 0.15)',
    border: '1px solid rgba(255, 230, 153, 0.6)',
    borderRadius: '5px',
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmPadding: {
    position: 'relative',
    background: 'rgba(195, 230, 195, 0.15)',
    border: '1px dashed rgba(195, 230, 195, 0.6)',
    borderRadius: '4px',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmContent: {
    background: 'rgba(142, 197, 255, 0.3)',
    border: '1px solid rgba(142, 197, 255, 0.8)',
    borderRadius: '3px',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bmTagMargin: {
    position: 'absolute',
    top: '3px',
    left: '5px',
    fontSize: '9px',
    fontWeight: '700',
    color: 'rgba(249, 204, 157, 0.8)',
    textTransform: 'uppercase'
  },
  bmTagBorder: {
    position: 'absolute',
    top: '3px',
    left: '5px',
    fontSize: '9px',
    fontWeight: '700',
    color: 'rgba(255, 230, 153, 0.8)',
    textTransform: 'uppercase'
  },
  bmTagPadding: {
    position: 'absolute',
    top: '3px',
    left: '5px',
    fontSize: '9px',
    fontWeight: '700',
    color: 'rgba(195, 230, 195, 0.8)',
    textTransform: 'uppercase'
  },
  bmValTop: {
    position: 'absolute',
    top: '3px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff'
  },
  bmValBottom: {
    position: 'absolute',
    bottom: '3px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff'
  },
  bmValLeft: {
    position: 'absolute',
    left: '5px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff'
  },
  bmValRight: {
    position: 'absolute',
    right: '5px',
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
  propertiesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  propCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  propCardHeader: {
    fontSize: '10.5px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '2px'
  },
  propRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11px',
    gap: '6px'
  },
  propKey: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '600'
  },
  propVal: {
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '10.5px',
    textAlign: 'right',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  colorPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '2px 5px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  swatch: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },
  colorText: {
    fontSize: '10px',
    fontFamily: 'JetBrains Mono, monospace',
    color: '#ffffff',
    fontWeight: '700'
  },
  codeSubTabs: {
    display: 'flex',
    gap: '6px',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '3px',
    borderRadius: '8px'
  },
  codeSubBtn: {
    flex: 1,
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  codeSubBtnActive: {
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff'
  },
  codeCard: {
    background: 'rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '11.5px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  copyCodeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '5px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  codePre: {
    margin: 0,
    padding: '12px',
    fontSize: '11px',
    color: '#e2e8f0',
    fontFamily: 'JetBrains Mono, monospace',
    lineHeight: '1.5',
    maxHeight: '440px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  figmaHeroCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  figmaHeroHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  figmaIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  figmaHeroTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#ffffff'
  },
  figmaHeroSub: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: '2px',
    lineHeight: '1.4'
  },
  figmaCopyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#000000',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 16px var(--accent-glow)'
  },
  specsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '280px',
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
  }
};
