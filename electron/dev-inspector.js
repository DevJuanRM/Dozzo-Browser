// Injected inspector engine into webviews for developers
(function () {
  let overlay = document.getElementById('__dozzo_inspector_overlay');
  let label = document.getElementById('__dozzo_inspector_label');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = '__dozzo_inspector_overlay';
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
      border: 2px solid #F0B90B;
      background: rgba(240, 185, 11, 0.15);
      border-radius: 4px;
      display: none;
      transition: all 0.08s ease;
      box-shadow: 0 0 12px rgba(240, 185, 11, 0.4);
    `;

    label = document.createElement('div');
    label.id = '__dozzo_inspector_label';
    label.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 0;
      margin-bottom: 4px;
      background: #0f172a;
      color: #F0B90B;
      border: 1px solid rgba(240, 185, 11, 0.4);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    overlay.appendChild(label);
  }

  function ensureOverlayAttached() {
    const parent = document.body || document.documentElement;
    if (parent && !parent.contains(overlay)) {
      try {
        parent.appendChild(overlay);
      } catch (e) {}
    }
  }
  ensureOverlayAttached();

  let isActive = false;
  let hoveredElement = null;

  function updateOverlay(el) {
    if (!el || el === overlay || el === label || el.contains(overlay)) {
      if (overlay) overlay.style.display = 'none';
      return;
    }
    ensureOverlayAttached();
    const rect = el.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      if (overlay) overlay.style.display = 'none';
      return;
    }
    overlay.style.display = 'block';
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    const dims = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;

    label.innerHTML = `<span>&lt;${tag}${id}${cls}&gt;</span> <span style="color: #94a3b8; font-weight: normal;">${dims}</span>`;
  }

  function cleanHTMLToJSX(html) {
    if (!html) return '';
    let jsx = html
      .replace(/\bclass=/g, 'className=')
      .replace(/\bfor=/g, 'htmlFor=')
      .replace(/\bautocomplete=/g, 'autoComplete=')
      .replace(/\bautofocus=/g, 'autoFocus=')
      .replace(/\bstroke-width=/g, 'strokeWidth=')
      .replace(/\bstroke-linecap=/g, 'strokeLinecap=')
      .replace(/\bstroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/\bclip-rule=/g, 'clipRule=')
      .replace(/\bfill-rule=/g, 'fillRule=')
      .replace(/\btabindex=/g, 'tabIndex=')
      .replace(/\bsrcset=/g, 'srcSet=');

    // Convert inline style="prop: val; ..." to style={{ prop: 'val' }}
    jsx = jsx.replace(/style="([^"]*)"/g, (match, styleStr) => {
      try {
        const rules = styleStr.split(';').filter((r) => r.trim());
        const props = [];
        rules.forEach((rule) => {
          const idx = rule.indexOf(':');
          if (idx !== -1) {
            const rawProp = rule.substring(0, idx).trim();
            const rawVal = rule.substring(idx + 1).trim();
            const camel = rawProp.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
            props.push(`${camel}: '${rawVal.replace(/'/g, "\\'")}'`);
          }
        });
        return props.length > 0 ? `style={{ ${props.join(', ')} }}` : '';
      } catch (e) {
        return match;
      }
    });

    return jsx;
  }

  function escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function serializeToFigmaComponentSvg(rootEl) {
    if (rootEl.tagName.toLowerCase() === 'svg') {
      return rootEl.outerHTML;
    }
    const closestSvg = rootEl.closest('svg');
    if (closestSvg && rootEl.parentElement === closestSvg) {
      return closestSvg.outerHTML;
    }

    const rootRect = rootEl.getBoundingClientRect();
    const rootW = Math.max(20, Math.round(rootRect.width));
    const rootH = Math.max(16, Math.round(rootRect.height));
    const rootStyles = window.getComputedStyle(rootEl);

    const rootBg = rootStyles.backgroundColor;
    const hasRootBg =
      rootBg &&
      rootBg !== 'transparent' &&
      rootBg !== 'rgba(0, 0, 0, 0)' &&
      !rootBg.endsWith(', 0)');
    const rootRx = parseInt(rootStyles.borderRadius) || 0;

    const svgLayers = [];

    // Root background layer
    if (hasRootBg) {
      svgLayers.push(`<rect width="${rootW}" height="${rootH}" rx="${rootRx}" fill="${rootBg}" />`);
    } else {
      svgLayers.push(`<rect width="${rootW}" height="${rootH}" fill="none" />`);
    }

    // Direct text nodes on rootEl
    for (const node of Array.from(rootEl.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          const fontFam = (rootStyles.fontFamily || 'sans-serif').split(',')[0].replace(/['"]/g, '').trim();
          const fontSz = rootStyles.fontSize || '14px';
          const fontWt = rootStyles.fontWeight || '400';
          const textColor = rootStyles.color || '#ffffff';
          let textX = 10;
          let textY = Math.round(rootH * 0.76);
          try {
            const range = document.createRange();
            range.selectNode(node);
            const r = range.getBoundingClientRect();
            if (r.width > 0) {
              textX = Math.round(r.left - rootRect.left);
              textY = Math.round(r.top - rootRect.top + r.height * 0.78);
            }
          } catch (e) {}
          svgLayers.push(
            `<text x="${textX}" y="${textY}" fill="${textColor}" font-family="${escapeXml(fontFam)}" font-size="${fontSz}" font-weight="${fontWt}">${escapeXml(text)}</text>`
          );
        }
      }
    }

    // Traverse all descendants up to 250 elements
    const descendants = Array.from(rootEl.querySelectorAll('*')).slice(0, 250);
    const processedSvgs = new Set();

    for (const child of descendants) {
      if (child.closest('svg') && processedSvgs.has(child.closest('svg'))) {
        continue;
      }

      const rect = child.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;

      const comp = window.getComputedStyle(child);
      if (comp.visibility === 'hidden' || comp.display === 'none' || comp.opacity === '0') continue;

      const relX = Math.round(rect.left - rootRect.left);
      const relY = Math.round(rect.top - rootRect.top);
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      if (relX + w < -10 || relY + h < -10 || relX > rootW + 20 || relY > rootH + 20) continue;

      const tag = child.tagName.toLowerCase();

      // SVG Icon
      if (tag === 'svg') {
        processedSvgs.add(child);
        const iconColor = comp.color || '#ffffff';
        let innerSvg = child.innerHTML.trim().replace(/currentColor/g, iconColor);
        if (!innerSvg.includes('fill=') && !innerSvg.includes('stroke=')) {
          innerSvg = `<g fill="${iconColor}">${innerSvg}</g>`;
        }
        svgLayers.push(`<g transform="translate(${relX}, ${relY})">${innerSvg}</g>`);
        continue;
      }

      // Image
      if (tag === 'img' && child.src) {
        svgLayers.push(
          `<image x="${relX}" y="${relY}" width="${w}" height="${h}" href="${escapeXml(child.src)}" preserveAspectRatio="xMidYMid slice" />`
        );
        continue;
      }

      // Container background or border (button, pill, card, input)
      const bg = comp.backgroundColor;
      const hasBg =
        bg &&
        bg !== 'transparent' &&
        bg !== 'rgba(0, 0, 0, 0)' &&
        !bg.endsWith(', 0)') &&
        bg !== rootBg;

      const hasBorder =
        comp.borderWidth &&
        comp.borderWidth !== '0px' &&
        comp.borderStyle !== 'none' &&
        comp.borderColor &&
        comp.borderColor !== 'transparent';

      const rx = parseInt(comp.borderRadius) || 0;

      if (hasBg || hasBorder) {
        const fillAttr = hasBg ? `fill="${bg}"` : 'fill="none"';
        const strokeAttr = hasBorder
          ? `stroke="${comp.borderColor}" stroke-width="${parseInt(comp.borderWidth) || 1}"`
          : '';
        const opacAttr = comp.opacity !== '1' ? `opacity="${comp.opacity}"` : '';
        svgLayers.push(
          `<rect x="${relX}" y="${relY}" width="${w}" height="${h}" rx="${rx}" ${fillAttr} ${strokeAttr} ${opacAttr} />`
        );
      }

      // Direct text child nodes
      for (const node of Array.from(child.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
          const rawText = node.textContent.trim();
          if (!rawText) continue;

          let textX = relX;
          let textY = relY + Math.round(h * 0.78);

          try {
            const range = document.createRange();
            range.selectNode(node);
            const r = range.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              textX = Math.round(r.left - rootRect.left);
              textY = Math.round(r.top - rootRect.top + r.height * 0.78);
            }
          } catch (e) {}

          const fontFam = (comp.fontFamily || 'sans-serif').split(',')[0].replace(/['"]/g, '').trim();
          const fontSz = comp.fontSize || '14px';
          const fontWt = comp.fontWeight || '400';
          const textColor = comp.color || '#ffffff';
          const letterSp = comp.letterSpacing !== 'normal' ? `letter-spacing="${comp.letterSpacing}"` : '';

          svgLayers.push(
            `<text x="${textX}" y="${textY}" fill="${textColor}" font-family="${escapeXml(fontFam)}" font-size="${fontSz}" font-weight="${fontWt}" ${letterSp}>${escapeXml(rawText)}</text>`
          );
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${rootW}" height="${rootH}" viewBox="0 0 ${rootW} ${rootH}">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
  ${svgLayers.join('\n  ')}
</svg>`;
  }

  function getElementDetails(el) {
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    // Key styling metrics for Figma & CSS
    const fontStr = computed.fontFamily || 'sans-serif';
    const styles = {
      color: computed.color || '#ffffff',
      backgroundColor: computed.backgroundColor || 'transparent',
      fontFamily: fontStr.split(',')[0].replace(/['"]/g, '').trim(),
      fontSize: computed.fontSize || '14px',
      fontWeight: computed.fontWeight || '400',
      lineHeight: computed.lineHeight || 'normal',
      letterSpacing: computed.letterSpacing !== 'normal' ? computed.letterSpacing : 'normal',
      borderRadius: computed.borderRadius || '0px',
      padding: `${computed.paddingTop || '0px'} ${computed.paddingRight || '0px'} ${computed.paddingBottom || '0px'} ${computed.paddingLeft || '0px'}`,
      margin: `${computed.marginTop || '0px'} ${computed.marginRight || '0px'} ${computed.marginBottom || '0px'} ${computed.marginLeft || '0px'}`,
      border: `${computed.borderWidth || '0px'} ${computed.borderStyle || 'none'} ${computed.borderColor || 'transparent'}`,
      boxShadow: computed.boxShadow !== 'none' ? computed.boxShadow : 'Ninguna',
      display: computed.display || 'block',
      flexDirection: computed.flexDirection || 'row',
      alignItems: computed.alignItems || 'stretch',
      justifyContent: computed.justifyContent || 'flex-start',
      gap: computed.gap !== 'normal' ? computed.gap : '0px',
      opacity: computed.opacity || '1',
      width: `${Math.round(rect.width)}px`,
      height: `${Math.round(rect.height)}px`
    };

    const isSvg = el.tagName.toLowerCase() === 'svg' || el.closest('svg') !== null;
    const svgTarget = el.tagName.toLowerCase() === 'svg' ? el : el.closest('svg');

    let classVal = '';
    if (typeof el.className === 'string') {
      classVal = el.className;
    } else if (el.className && typeof el.className.baseVal === 'string') {
      classVal = el.className.baseVal;
    }

    // Generate comprehensive recursive Figma SVG component
    let visualSvg = '';
    try {
      visualSvg = serializeToFigmaComponentSvg(el);
    } catch (e) {
      visualSvg = svgTarget ? svgTarget.outerHTML : '';
    }

    return {
      tagName: el.tagName.toLowerCase(),
      id: el.id || '',
      className: classVal,
      html: el.outerHTML,
      jsx: cleanHTMLToJSX(el.outerHTML),
      svg: svgTarget ? svgTarget.outerHTML : null,
      figmaSvg: visualSvg,
      styles,
      rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
      text: el.innerText ? el.innerText.trim().substring(0, 80) : ''
    };
  }

  function buildLayersHierarchy(target) {
    const layers = [];
    let current = target;
    let idx = 0;

    const layerLabels = [
      'Capa 1: Elemento Seleccionado',
      'Capa 2: Contenedor Directo',
      'Capa 3: Tarjeta / Componente',
      'Capa 4: Bloque / Subsección',
      'Capa 5: Módulo / Sección',
      'Capa 6: Marco / Wrapper',
      'Capa 7: Área Principal',
      'Capa 8: Estructura Superior',
      'Capa 9: Raíz de Aplicación',
      'Capa 10: Contenedor Raíz'
    ];

    while (current && current !== document.body && current !== document.documentElement && idx < 10) {
      try {
        const details = getElementDetails(current);
        details.layerIndex = idx;
        details.layerName = layerLabels[idx] || `Capa ${idx + 1}`;
        layers.push(details);
      } catch (err) {}
      current = current.parentElement;
      idx++;
    }

    if (layers.length === 0) {
      const fallback = getElementDetails(target);
      fallback.layerIndex = 0;
      fallback.layerName = 'Capa 1: Elemento';
      layers.push(fallback);
    }

    return layers;
  }

  function handleMouseMove(e) {
    if (!isActive) return;
    hoveredElement = e.target;
    updateOverlay(hoveredElement);
  }

  function sendPayload(primaryData) {
    try {
      if (window.__dozzo_ipcRenderer && typeof window.__dozzo_ipcRenderer.sendToHost === 'function') {
        window.__dozzo_ipcRenderer.sendToHost('dozzo-inspector-element', primaryData);
      }
    } catch (e) {}

    try {
      if (typeof require !== 'undefined') {
        const electron = require('electron');
        if (electron && electron.ipcRenderer && typeof electron.ipcRenderer.sendToHost === 'function') {
          electron.ipcRenderer.sendToHost('dozzo-inspector-element', primaryData);
        }
      }
    } catch (e) {}

    try {
      const payloadStr = JSON.stringify(primaryData);
      const logFn = window.__dozzo_native_log || console.log;
      logFn('__DOZZO_DEV_INSPECT__:' + payloadStr);
      logFn('__DOZZO_INSPECTOR_PAYLOAD__:' + payloadStr);
    } catch (e) {}
  }

  function handlePointerDown(e) {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function handleClick(e) {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }

    const target = e.target;
    if (!target) return;

    try {
      const layers = buildLayersHierarchy(target);
      const primaryData = {
        ...layers[0],
        layers: layers
      };
      sendPayload(primaryData);
    } catch (err) {
      try {
        const rect = target.getBoundingClientRect();
        sendPayload({
          tagName: target.tagName ? target.tagName.toLowerCase() : 'div',
          id: target.id || '',
          className: typeof target.className === 'string' ? target.className : '',
          html: target.outerHTML || '',
          jsx: target.outerHTML || '',
          svg: null,
          figmaSvg: '',
          styles: {},
          rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
          text: target.innerText ? target.innerText.trim().substring(0, 80) : '',
          layers: []
        });
      } catch (e2) {}
    }

    // Turn off inspector after element is captured
    if (typeof window.__dozzo_toggle_inspector === 'function') {
      window.__dozzo_toggle_inspector(false);
    }
  }

  window.__dozzo_toggle_inspector = function (enable) {
    isActive = Boolean(enable);
    if (!isActive) {
      if (overlay) overlay.style.display = 'none';
      hoveredElement = null;
      if (document.body) document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
    } else {
      if (document.body) document.body.style.cursor = 'crosshair';
      ensureOverlayAttached();
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('click', handleClick, true);
      window.addEventListener('pointerdown', handlePointerDown, true);
    }
  };
})();
