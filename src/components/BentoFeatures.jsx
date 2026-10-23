import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Smartphone, Globe, Zap, Cpu, Sparkles } from 'lucide-react';

export function TypeTester() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.4 : 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 110 }}>
      <motion.span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '76px',
          fontWeight: 500,
          color: '#ffffff',
          lineHeight: 1,
          letterSpacing: '-2px',
          userSelect: 'none'
        }}
        animate={{ scale }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        Aa
      </motion.span>
    </div>
  );
}

export function LayoutAnimation() {
  const [layout, setLayout] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLayout((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // 0: 2 cols, 1: 3 cols, 2: 1 col
  const gridColumns = layout === 0 ? 'repeat(2, 1fr)' : layout === 1 ? 'repeat(3, 1fr)' : '1fr';

  return (
    <div style={{ height: '100%', minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: 6,
          width: '100%',
          maxWidth: 130
        }}
        layout
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              borderRadius: 6,
              height: 18,
              width: '100%'
            }}
            layout
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function SpeedIndicator() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
      <div style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', width: '100%' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              style={{
                height: 28,
                width: 90,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 6
              }}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              exit={{ opacity: 0, y: -20, position: 'absolute' }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <motion.span
              key="text"
              initial={{ y: 16, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              style={{
                fontSize: 32,
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: '#ffffff',
                letterSpacing: '-0.5px'
              }}
            >
              100ms
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>Load Time</span>
      <div style={{ width: '100%', maxWidth: 110, height: 5, backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', backgroundColor: '#ffffff', borderRadius: 999 }}
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : '100%' }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        />
      </div>
    </div>
  );
}

export function SecurityBadge() {
  const [shields, setShields] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShields((prev) => {
        const nextIndex = prev.findIndex((s) => !s.active);
        if (nextIndex === -1) {
          return prev.map(() => ({ id: Math.random(), active: false }));
        }
        return prev.map((s, i) => (i === nextIndex ? { ...s, active: true } : s));
      });
    }, 850);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
      {shields.map((shield) => (
        <motion.div
          key={shield.id}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: shield.active ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
            border: shield.active ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.06)',
            transition: 'background-color 0.25s ease, border-color 0.25s ease'
          }}
          animate={{ scale: shield.active ? 1.08 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Lock size={18} color={shield.active ? '#ffffff' : '#71717a'} />
        </motion.div>
      ))}
    </div>
  );
}

export function GlobalNetwork() {
  const pulses = [0, 1, 2, 3];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 120, position: 'relative' }}>
      <Globe size={52} color="#ffffff" style={{ zIndex: 10, filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.3))' }} />
      {pulses.map((pulse) => (
        <motion.div
          key={pulse}
          style={{
            position: 'absolute',
            width: 52,
            height: 52,
            border: '1.5px solid rgba(255, 255, 255, 0.32)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: pulse * 0.7,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

export default function BentoFeatures({ compact = false }) {
  return (
    <div style={{ width: '100%', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#a1a1aa',
          fontWeight: 600,
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <Sparkles size={13} color="#ffffff" />
        <span>Dozzo Architecture & Core Features</span>
      </motion.div>

      {/* Bento Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 12,
          autoRows: compact ? '160px' : '185px'
        }}
      >
        {/* 1. Typography - Tall (2x2) */}
        <motion.div
          style={{
            gridColumn: 'span 2',
            gridRow: 'span 2',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            cursor: 'default',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
          whileHover={{ scale: 1.015, borderColor: '#3f3f46' }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TypeTester />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Typography
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#a1a1aa', lineHeight: 1.4 }}>
              Tipografía responsive y motor de renderizado de fuentes optimizado.
            </p>
          </div>
        </motion.div>

        {/* 2. Layouts - Standard (2x1) */}
        <motion.div
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            cursor: 'default'
          }}
          whileHover={{ scale: 1.015, borderColor: '#3f3f46' }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutAnimation />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Layouts
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#a1a1aa', lineHeight: 1.3 }}>
              Vistas divididas en mosaico hasta 4 ventanas adaptables.
            </p>
          </div>
        </motion.div>

        {/* 3. Global Network - Tall (2x2) */}
        <motion.div
          style={{
            gridColumn: 'span 2',
            gridRow: 'span 2',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            cursor: 'default',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
          whileHover={{ scale: 1.015, borderColor: '#3f3f46' }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlobalNetwork />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={16} />
              Global Edge Shield
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#a1a1aa', lineHeight: 1.4 }}>
              Conexión ultra-rápida y navegación privada sin telemetría ni rastreo.
            </p>
          </div>
        </motion.div>

        {/* 4. Speed - Standard (2x1) */}
        <motion.div
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            cursor: 'default'
          }}
          whileHover={{ scale: 1.015, borderColor: '#3f3f46' }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SpeedIndicator />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Speed
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#a1a1aa', lineHeight: 1.3 }}>
              Carga instantánea de páginas bloqueando rastreadores pesados.
            </p>
          </div>
        </motion.div>

        {/* 5. Security - Wide (3x1) */}
        <motion.div
          style={{
            gridColumn: 'span 3',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            cursor: 'default'
          }}
          whileHover={{ scale: 1.015, borderColor: '#3f3f46' }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SecurityBadge />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={15} />
              Security First
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#a1a1aa', lineHeight: 1.3 }}>
              Aislamiento de cookies, protección contra phishing y filtro anti-anuncios militar.
            </p>
          </div>
        </motion.div>

        {/* 6. Mobile Ready - Wide (3x1) */}
        <motion.div
          style={{
            gridColumn: 'span 3',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            cursor: 'default'
          }}
          whileHover={{ scale: 1.015, borderColor: '#3f3f46' }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={38} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Mobile Ready & Multi-Device
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#a1a1aa', lineHeight: 1.3 }}>
              Diseño adaptable a cualquier pantalla, desde celulares hasta monitores 4K.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
