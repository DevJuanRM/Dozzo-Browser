// Unified DOM Inspector Engine for Dozzo Browser
// Extracts HTML, clean JSX, Figma SVG, CSS styles, and multi-layer hierarchy

export function cleanHTMLToJSX(html) {
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

export function serializeToFigmaComponentSvg(rootEl) {
  if (!rootEl) return '';
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

  // Traverse descendants
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

    // Container background / border
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

export function getElementDetails(el) {
  if (!el) return null;
  const computed = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

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

  const svgTarget = el.tagName.toLowerCase() === 'svg' ? el : el.closest('svg');

  let classVal = '';
  if (typeof el.className === 'string') {
    classVal = el.className;
  } else if (el.className && typeof el.className.baseVal === 'string') {
    classVal = el.className.baseVal;
  }

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

export function buildLayersHierarchy(target, stopAtElement = null) {
  const layers = [];
  let current = target;
  let idx = 0;

  const layerLabels = [
    'Capa 1: Elemento',
    'Capa 2: Contenedor',
    'Capa 3: Tarjeta / Componente',
    'Capa 4: Bloque / Sección',
    'Capa 5: Estructura Raíz'
  ];

  while (
    current &&
    current !== document.body &&
    current !== document.documentElement &&
    current !== stopAtElement &&
    idx < 5
  ) {
    try {
      const details = getElementDetails(current);
      if (details) {
        details.layerIndex = idx;
        details.layerName = layerLabels[idx] || `Capa ${idx + 1}`;
        layers.push(details);
      }
    } catch (err) {}
    current = current.parentElement;
    idx++;
  }

  if (layers.length === 0) {
    const fallback = getElementDetails(target);
    if (fallback) {
      fallback.layerIndex = 0;
      fallback.layerName = 'Capa 1: Elemento';
      layers.push(fallback);
    }
  }

  return layers;
}
