"use client";

import React, { useState, useEffect } from "react";

export function GlassTimeCard({
  showSeconds = false,
  showTimezone = false,
  className = "",
  style = {}
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezoneName, setTimezoneName] = useState("");

  useEffect(() => {
    const timezoneOffset = currentTime.getTimezoneOffset();
    const timezoneShorter = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -timezoneOffset / 60;
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;

    setTimezoneName(`${timezoneShorter} GMT${offsetStr}`);

    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: false
    });
  };

  const formatDate = (date) => {
    const day = date.getDate();

    const weekdays = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const weekday = weekdays[date.getDay()];

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[date.getMonth()];

    return `${weekday} | ${month} ${day}`;
  };

  return (
    <div
      className={className}
      style={{
        width: '320px',
        maxWidth: '100%',
        color: '#ffffff',
        background: 'rgba(255, 255, 255, 0.05)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        userSelect: 'none',
        boxSizing: 'border-box',
        fontFamily: "'Lato', sans-serif",
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontSize: '13.5px',
            color: 'rgba(255, 255, 255, 0.75)',
            fontWeight: 500,
            letterSpacing: '0.4px'
          }}
        >
          {formatDate(currentTime)}
        </div>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-1px',
            lineHeight: 1,
            color: '#ffffff'
          }}
        >
          {formatTime(currentTime)}
        </div>
        {showTimezone && (
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.45)',
              marginTop: '2px'
            }}
          >
            {timezoneName}
          </div>
        )}
      </div>
    </div>
  );
}

export default GlassTimeCard;
