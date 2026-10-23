"use client";

import React, { useState, useEffect } from "react";

// Standard 7-Segment Mapping: A, B, C, D, E, F, G
const SEGMENT_MAP = {
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
  ' ': [0, 0, 0, 0, 0, 0, 0]
};

// Mathematically precise 7-segment polygons in viewBox 0 0 38 68
// Upright, clean 45-degree chamfers, uniform thickness and gaps
const SEGMENT_POLYGONS = [
  // A: top horizontal
  "3.0,1.0 35.0,1.0 31.5,6.5 6.5,6.5",
  // B: top-right vertical
  "37.0,3.0 37.0,33.0 36.0,33.0 31.5,30.75 31.5,7.0",
  // C: bottom-right vertical
  "37.0,35.0 37.0,65.0 31.5,61.0 31.5,37.25 36.0,35.0",
  // D: bottom horizontal
  "6.5,61.5 31.5,61.5 35.0,67.0 3.0,67.0",
  // E: bottom-left vertical
  "1.0,35.0 2.0,35.0 6.5,37.25 6.5,61.0 1.0,65.0",
  // F: top-left vertical
  "1.0,3.0 6.5,7.0 6.5,30.75 2.0,33.0 1.0,33.0",
  // G: middle horizontal
  "2.0,34.0 6.5,31.25 31.5,31.25 36.0,34.0 31.5,36.75 6.5,36.75"
];

/**
 * Single 7-Segment Vector Digit
 * - Clean upright geometry (skewX: 0)
 * - Solid pure white core (#ffffff)
 * - Faint subtle LCD outline on unlit segments
 */
function SevenSegmentDigit({ char = '0', width = 42, height = 74 }) {
  const active = SEGMENT_MAP[char] || SEGMENT_MAP['0'];

  return (
    <svg
      viewBox="0 0 38 68"
      width={width}
      height={height}
      style={{
        display: 'block'
      }}
    >
      {SEGMENT_POLYGONS.map((pts, idx) => {
        const isOn = Boolean(active[idx]);
        return (
          <polygon
            key={idx}
            points={pts}
            fill={isOn ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'}
            stroke={isOn ? 'none' : 'rgba(255, 255, 255, 0.035)'}
            strokeWidth={isOn ? 0 : 0.5}
            style={{
              transition: 'fill 0.06s ease'
            }}
          />
        );
      })}
    </svg>
  );
}

/**
 * 7-Segment Colon Separator (two glowing LED dots)
 */
function SevenSegmentColon({ width = 16, height = 74 }) {
  return (
    <svg
      viewBox="0 0 14 68"
      width={width}
      height={height}
      style={{
        display: 'block'
      }}
    >
      <circle cx="7" cy="22" r="2.8" fill="#ffffff" />
      <circle cx="7" cy="46" r="2.8" fill="#ffffff" />
    </svg>
  );
}

/**
 * Floating Pro 7-Segment LED Clock
 * - Pure glowing WHITE (strictly NO blue)
 * - Clean downward reflection on the dark surface
 * - Absolutely NO lines, NO containers, NO background card
 */
export function GlassTimeCard({
  showSeconds = true,
  className = "",
  style = {},
  isMobile = false
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const hours = pad(time.getHours());
  const minutes = pad(time.getMinutes());
  const seconds = pad(time.getSeconds());

  // Render row of digits and colons with PURE WHITE glow
  const renderClockRow = (isReflection = false) => (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '2.5px' : '4px',
        filter: isReflection
          ? 'drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 12px rgba(255, 255, 255, 0.75))'
          : 'drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 18px rgba(255, 255, 255, 0.35))'
      }}
    >
      {/* Hours */}
      <SevenSegmentDigit char={hours[0]} width={isMobile ? 32 : 42} height={isMobile ? 58 : 74} />
      <SevenSegmentDigit char={hours[1]} width={isMobile ? 32 : 42} height={isMobile ? 58 : 74} />

      {/* Colon */}
      <SevenSegmentColon width={isMobile ? 12 : 16} height={isMobile ? 58 : 74} />

      {/* Minutes */}
      <SevenSegmentDigit char={minutes[0]} width={isMobile ? 32 : 42} height={isMobile ? 58 : 74} />
      <SevenSegmentDigit char={minutes[1]} width={isMobile ? 32 : 42} height={isMobile ? 58 : 74} />

      {/* Seconds */}
      {showSeconds && (
        <>
          <SevenSegmentColon width={isMobile ? 12 : 16} height={isMobile ? 58 : 74} />
          <SevenSegmentDigit char={seconds[0]} width={isMobile ? 32 : 42} height={isMobile ? 58 : 74} />
          <SevenSegmentDigit char={seconds[1]} width={isMobile ? 32 : 42} height={isMobile ? 58 : 74} />
        </>
      )}
    </div>
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: '0',
        userSelect: 'none',
        maxWidth: '100%',
        ...style
      }}
    >
      {/* Main Digital Clock Numbers (Pure White) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {renderClockRow(false)}
      </div>

      {/* Surface Reflection Plane (Downward Pure White light spill kissing the roof of the weather widget) */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 1,
          marginTop: '0px',
          height: '8px'
        }}
      >
        {/* Contact waterline shimmer highlight in pure white */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '360px',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 20%, #ffffff 50%, rgba(255, 255, 255, 0.4) 80%, transparent 100%)',
            filter: 'blur(0.8px)',
            opacity: 0.9,
            zIndex: 3
          }}
        />

        {/* Inverted mirror reflection in pure white */}
        <div
          style={{
            height: '10px',
            overflow: 'hidden',
            transformOrigin: 'top center',
            transform: 'perspective(400px) rotateX(45deg) scaleY(-0.8)',
            filter: 'blur(1.5px)',
            opacity: 0.45,
            maskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 0.95) 0%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 0.95) 0%, transparent 100%)',
            zIndex: 2
          }}
        >
          {renderClockRow(true)}
        </div>

        {/* Pure white ground illumination pool (radiates downward on the dark surface) */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '460px',
            maxWidth: '100vw',
            height: '35px',
            background:
              'radial-gradient(ellipse 70% 75% at 50% 0%, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.06) 40%, transparent 75%)',
            filter: 'blur(6px)',
            zIndex: 0
          }}
        />
      </div>
    </div>
  );
}

export default GlassTimeCard;
