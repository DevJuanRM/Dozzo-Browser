import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, Check, Play, Globe } from 'lucide-react';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  onNavigate,
  onNewTab,
  onCloseTab,
  onToggleTheme,
  onOpenDownloads,
  onOpenSidebar,
  onOpenHistory,
  onToggleInspector,
  onOpenBinance,
  onExecuteInPage
}) {
  const [isListening, setIsListening] = useState(false);
  const [hasMicAccess, setHasMicAccess] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micStatusText, setMicStatusText] = useState('Activando micrófono...');
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState('');
  const [textCommand, setTextCommand] = useState('');

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);
  const interimDebounceRef = useRef(null);

  // Text to speech response
  const speak = (text) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  };

  // Hardware Microphone access and Speech recognition
  useEffect(() => {
    if (!isOpen) {
      if (interimDebounceRef.current) {
        clearTimeout(interimDebounceRef.current);
        interimDebounceRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setHasMicAccess(false);
      setAudioLevel(0);
      return;
    }

    // 1. Explicitly prompt Windows/Electron for hardware microphone access with timeout
    const startHardwareMic = async () => {
      try {
        setMicStatusText('Activando micrófono...');
        const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Mic timeout')), 2200)
        );
        const stream = await Promise.race([streamPromise, timeoutPromise]);
        mediaStreamRef.current = stream;
        setHasMicAccess(true);
        setMicStatusText('Micrófono conectado y escuchando');

        // Web Audio analyser for real-time waveform volume
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyser || !mediaStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const level = Math.min(100, Math.round((avg / 128) * 100));
            setAudioLevel(level);
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch (err) {
        console.warn('Microphone access fallback:', err);
        setHasMicAccess(true);
        setMicStatusText('Listo para escuchar tus comandos');
      }
    };

    startHardwareMic();

    // 2. Start Chromium speech recognition engine
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let interimText = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            if (item.isFinal) {
              finalText += item[0].transcript;
            } else {
              interimText += item[0].transcript;
            }
          }

          const currentTranscript = (finalText || interimText).trim();
          if (currentTranscript) {
            setTranscript(currentTranscript);
          }

          if (finalText.trim()) {
            if (interimDebounceRef.current) clearTimeout(interimDebounceRef.current);
            processCommand(finalText.toLowerCase().trim());
          } else if (interimText.trim()) {
            if (interimDebounceRef.current) clearTimeout(interimDebounceRef.current);
            interimDebounceRef.current = setTimeout(() => {
              processCommand(interimText.toLowerCase().trim());
            }, 900);
          }
        };

        recognition.onerror = (e) => {
          console.warn('Speech recognition warning:', e.error);
          if (e.error === 'network') {
            setMicStatusText('Micrófono activo (también puedes escribir comandos directos)');
          }
        };

        recognition.onend = () => {
          if (isOpen) {
            try {
              recognition.start();
            } catch (e) {}
          } else {
            setIsListening(false);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition failed to start:', err);
      }
    }

    return () => {
      if (interimDebounceRef.current) {
        clearTimeout(interimDebounceRef.current);
        interimDebounceRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isOpen]);

  const processCommand = (cmd) => {
    if (!cmd || !cmd.trim()) return;

    // Clean trigger words and punctuation
    const clean = cmd
      .toLowerCase()
      .replace(/^(dozzo|oye dozzo|hey dozzo|ok dozzo|por favor)\s*/i, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .trim();

    if (!clean) return;

    // 1. YouTube specific searches
    const ytMatch =
      clean.match(/(?:buscar\s+en\s+youtube|busca\s+en\s+youtube|youtube\s+buscar|abrir\s+youtube\s+y\s+buscar)\s+(.+)/i) ||
      clean.match(/(?:buscar|busca)\s+(.+)\s+en\s+youtube/i);
    if (ytMatch && ytMatch[1]) {
      const q = ytMatch[1].trim();
      executeAction(`Buscando "${q}" en YouTube`, `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
      return;
    }

    // 2. Direct Known Websites Map
    const KNOWN_SITES = {
      google: 'https://www.google.com',
      youtube: 'https://www.youtube.com',
      spotify: 'https://open.spotify.com',
      figma: 'https://www.figma.com',
      binance: 'https://www.binance.com',
      github: 'https://github.com',
      twitter: 'https://x.com',
      x: 'https://x.com',
      instagram: 'https://www.instagram.com',
      facebook: 'https://www.facebook.com',
      reddit: 'https://www.reddit.com',
      twitch: 'https://www.twitch.tv',
      netflix: 'https://www.netflix.com',
      tiktok: 'https://www.tiktok.com',
      wikipedia: 'https://es.wikipedia.org',
      chatgpt: 'https://chatgpt.com',
      whatsapp: 'https://web.whatsapp.com',
      mercadolibre: 'https://www.mercadolibre.com',
      amazon: 'https://www.amazon.com',
      yahoo: 'https://www.yahoo.com',
      gmail: 'https://mail.google.com'
    };

    for (const [key, siteUrl] of Object.entries(KNOWN_SITES)) {
      if (
        clean === key ||
        clean === `abrir ${key}` ||
        clean === `ir a ${key}` ||
        clean === `abre ${key}` ||
        clean === `entra a ${key}`
      ) {
        executeAction(`Abriendo ${key.toUpperCase()}`, siteUrl);
        return;
      }
    }

    // 3. Domain or full URL pattern (e.g. "marca.com", "google.es")
    if (
      clean.includes('.com') ||
      clean.includes('.org') ||
      clean.includes('.net') ||
      clean.includes('.es') ||
      clean.includes('.co') ||
      clean.includes('.io') ||
      clean.includes('.tv') ||
      clean.includes('.app') ||
      clean.includes('.ai')
    ) {
      const cleanUrl = clean.replace(/^(abrir|abre|ir a|entra a)\s+/i, '').trim();
      const targetUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      executeAction(`Navegando a ${cleanUrl}`, targetUrl);
      return;
    }

    // 4. Browser internal actions (always close modal seamlessly after trigger)
    if (clean.includes('nueva pestaña') || clean === 'nueva tab' || clean === 'abrir pestaña') {
      setLastAction('✓ Creando nueva pestaña');
      speak('Nueva pestaña abierta');
      if (onNewTab) onNewTab();
      setTimeout(onClose, 500);
      return;
    }

    if (clean.includes('cerrar pestaña') || clean === 'cierra pestaña' || clean === 'cerrar tab') {
      setLastAction('✓ Cerrando pestaña');
      speak('Cerrando pestaña');
      if (onCloseTab) onCloseTab();
      setTimeout(onClose, 500);
      return;
    }

    if (clean.includes('modo oscuro') || clean.includes('modo claro') || clean.includes('cambiar tema') || clean === 'tema') {
      setLastAction('✓ Cambiando tema');
      speak('Tema cambiado');
      if (onToggleTheme) onToggleTheme();
      setTimeout(onClose, 500);
      return;
    }

    if (clean.includes('descargas') || clean.includes('abrir descargas')) {
      setLastAction('✓ Abriendo descargas');
      speak('Abriendo descargas');
      if (onOpenDownloads) onOpenDownloads();
      setTimeout(onClose, 500);
      return;
    }

    if (clean.includes('historial') || clean.includes('abrir historial')) {
      setLastAction('✓ Abriendo historial');
      speak('Abriendo historial de navegación');
      if (onOpenHistory) onOpenHistory();
      setTimeout(onClose, 500);
      return;
    }

    if (clean.includes('binance') || clean.includes('cripto') || clean.includes('mercado') || clean.includes('precios')) {
      setLastAction('✓ Abriendo Cripto Hub');
      speak('Abriendo Cripto Hub');
      if (onOpenBinance) onOpenBinance();
      setTimeout(onClose, 500);
      return;
    }

    if (clean.includes('notas') || clean.includes('abrir notas')) {
      setLastAction('✓ Abriendo panel de notas');
      speak('Abriendo notas');
      if (onOpenSidebar) onOpenSidebar();
      setTimeout(onClose, 500);
      return;
    }

    if (clean.includes('modo dev') || clean.includes('inspeccionar') || clean.includes('abrir dev')) {
      setLastAction('✓ Activando Dev Studio');
      speak('Modo Dev Studio activado');
      if (onToggleInspector) onToggleInspector();
      setTimeout(onClose, 500);
      return;
    }

    // 5. In-Page Controls (YouTube & Video Player)
    if (clean.includes('primer video') || clean.includes('primer resultado') || clean.includes('abre el primer video')) {
      setLastAction('✓ Abriendo primer video');
      speak('Abriendo primer video');
      if (onExecuteInPage) {
        onExecuteInPage(`
          (() => {
            const link = document.querySelector('ytd-video-renderer a#video-title, ytd-rich-grid-media a#video-title, #contents ytd-thumbnail a, a[href*="watch?v="]');
            if (link) { link.click(); return true; }
            return false;
          })()
        `);
      }
      setTimeout(onClose, 600);
      return;
    }

    if (clean.includes('pantalla completa') || clean.includes('pantalla grande') || clean.includes('fullscreen')) {
      setLastAction('✓ Pantalla completa');
      speak('Pantalla completa');
      if (onExecuteInPage) {
        onExecuteInPage(`
          (() => {
            const btn = document.querySelector('.ytp-fullscreen-button, button[title*="pantalla completa" i], button[aria-label*="fullscreen" i]');
            if (btn) { btn.click(); return; }
            const v = document.querySelector('video');
            if (v && v.requestFullscreen) { v.requestFullscreen(); return; }
            if (document.fullscreenElement) { document.exitFullscreen(); } else { document.documentElement.requestFullscreen(); }
          })()
        `);
      }
      setTimeout(onClose, 600);
      return;
    }

    if (clean.includes('reproducir') || clean.includes('pausar') || clean.includes('play') || clean.includes('pausa')) {
      setLastAction('✓ Play / Pausa');
      speak('Reproducir o pausar');
      if (onExecuteInPage) {
        onExecuteInPage(`
          (() => {
            const v = document.querySelector('video, audio');
            if (v) { if (v.paused) v.play(); else v.pause(); }
          })()
        `);
      }
      setTimeout(onClose, 600);
      return;
    }

    if (clean.includes('silenciar') || clean.includes('mutear') || clean.includes('quitar sonido')) {
      setLastAction('✓ Silenciar');
      speak('Silenciar');
      if (onExecuteInPage) {
        onExecuteInPage(`
          (() => {
            const v = document.querySelector('video, audio');
            if (v) { v.muted = !v.muted; }
          })()
        `);
      }
      setTimeout(onClose, 600);
      return;
    }

    if (clean.includes('bajar') || clean.includes('desplazar abajo') || clean.includes('scroll abajo')) {
      setLastAction('✓ Desplazando hacia abajo');
      if (onExecuteInPage) {
        onExecuteInPage('window.scrollBy({ top: 550, behavior: "smooth" });');
      }
      setTimeout(onClose, 600);
      return;
    }

    if (clean.includes('subir') || clean.includes('desplazar arriba') || clean.includes('scroll arriba')) {
      setLastAction('✓ Desplazando hacia arriba');
      if (onExecuteInPage) {
        onExecuteInPage('window.scrollBy({ top: -550, behavior: "smooth" });');
      }
      setTimeout(onClose, 600);
      return;
    }

    // 6. Explicit search prefixes
    const searchMatch = clean.match(/^(?:buscar|busca|encuentra|investiga|google|consultar)\s+(.+)/i);
    if (searchMatch && searchMatch[1]) {
      const q = searchMatch[1].trim();
      executeAction(`Buscando "${q}"`, `https://duckduckgo.com/?q=${encodeURIComponent(q)}`);
      return;
    }

    // 7. General search fallback: whatever the user said is executed!
    if (clean.length > 1) {
      executeAction(`Buscando "${clean}"`, `https://duckduckgo.com/?q=${encodeURIComponent(clean)}`);
    }
  };

  const executeAction = (actionText, url) => {
    setLastAction(`✓ ${actionText}`);
    speak(actionText);
    setTimeout(() => {
      if (onNavigate) onNavigate(url);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} className="glass-panel animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconBadge}>
              <Sparkles size={16} color="var(--accent)" />
            </div>
            <div>
              <div style={styles.title}>Dozzo Asistente de Voz</div>
              <div style={styles.subtitle}>Controla tu navegador hablando con tu micrófono</div>
            </div>
          </div>

          <button style={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Visualizer Wave & Mic */}
        <div style={styles.centerSection}>
          <div style={{ ...styles.micRing, ...(hasMicAccess || isListening ? styles.micRingActive : {}) }}>
            <div style={styles.micButton}>
              {hasMicAccess || isListening ? <Mic size={32} color="#000" /> : <MicOff size={32} color="var(--text-muted)" />}
            </div>
          </div>

          {/* Real Audio Waveform reacting to user's voice */}
          <div style={styles.waveContainer}>
            {[14, 26, 38, 28, 42, 22, 16].map((baseH, idx) => {
              const scaledHeight = Math.max(6, Math.min(46, baseH * (0.3 + (audioLevel / 100) * 1.4)));
              return (
                <div
                  key={idx}
                  style={{
                    ...styles.waveBar,
                    height: `${scaledHeight}px`,
                    background: audioLevel > 15 ? 'var(--accent)' : 'var(--border-hover)'
                  }}
                />
              );
            })}
          </div>

          <div style={styles.statusRow}>
            <span style={{ ...styles.statusDot, background: hasMicAccess ? 'var(--success)' : 'var(--warning)' }} />
            <span style={styles.statusLabel}>{micStatusText}</span>
            {hasMicAccess && audioLevel > 5 && (
              <span style={styles.audioLevelBadge}>Voz detectada: {audioLevel}%</span>
            )}
          </div>

          {/* Transcript / Spoken text */}
          <div style={styles.transcriptBox}>
            {transcript ? (
              <span style={styles.transcriptText}>"{transcript}"</span>
            ) : (
              <span style={styles.transcriptPlaceholder}>Di tu comando o haz clic en las sugerencias abajo:</span>
            )}
          </div>

          {/* Action indicator */}
          {lastAction && (
            <div style={styles.actionBadge} className="animate-fade-in">
              <Check size={14} color="var(--success)" />
              <span>{lastAction}</span>
            </div>
          )}

          {/* Direct command bar */}
          <form
            style={styles.directForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (textCommand.trim()) {
                processCommand(textCommand.trim());
                setTextCommand('');
              }
            }}
          >
            <input
              type="text"
              value={textCommand}
              onChange={(e) => setTextCommand(e.target.value)}
              placeholder="O escribe aquí un comando (ej: abrir youtube, buscar fifa...)"
              style={styles.directInput}
            />
            <button type="submit" style={styles.directSubmitBtn}>
              Ejecutar
            </button>
          </form>
        </div>

        {/* Suggested Voice Commands */}
        <div style={styles.commandsSection}>
          <div style={styles.commandsTitle}>Comandos rápidos disponibles:</div>
          <div style={styles.commandsGrid}>
            <div style={styles.commandPill} onClick={() => processCommand('abrir youtube')}>
              ▶ "Dozzo abrir YouTube"
            </div>
            <div style={styles.commandPill} onClick={() => processCommand('buscar en youtube fifa')}>
              🔍 "Buscar en YouTube FIFA"
            </div>
            <div style={styles.commandPill} onClick={() => processCommand('abrir primer video')}>
              🎬 "Abrir primer video"
            </div>
            <div style={styles.commandPill} onClick={() => processCommand('pantalla completa')}>
              ⛶ "Pantalla completa"
            </div>
            <div style={styles.commandPill} onClick={() => processCommand('play')}>
              ⏯ "Play / Pausa"
            </div>
            <div style={styles.commandPill} onClick={() => processCommand('abrir figma')}>
              🎨 "Dozzo abrir Figma"
            </div>
            <div style={styles.commandPill} onClick={() => processCommand('modo dev')}>
              🛠 "Dozzo modo Dev Studio"
            </div>
            <div style={styles.commandPill} onClick={() => processCommand('nueva pestaña')}>
              ➕ "Nueva pestaña"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    width: '520px',
    maxWidth: '92vw',
    borderRadius: '18px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
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
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  closeBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    color: 'var(--text-muted)'
  },
  centerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px 20px'
  },
  micRing: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(240, 185, 11, 0.1)',
    border: '2px solid rgba(240, 185, 11, 0.3)',
    transition: 'all 0.3s ease'
  },
  micRingActive: {
    boxShadow: '0 0 25px var(--accent-glow), 0 0 50px rgba(240, 185, 11, 0.2)',
    borderColor: 'var(--accent)',
    animation: 'pulseGlow 1.5s infinite ease-in-out'
  },
  micButton: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
  },
  waveContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    height: '48px',
    marginTop: '14px'
  },
  waveBar: {
    width: '4px',
    borderRadius: '4px',
    transition: 'height 0.08s ease, background 0.15s ease'
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  statusLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  audioLevelBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    background: 'rgba(240, 185, 11, 0.15)',
    color: 'var(--accent)',
    fontWeight: '700'
  },
  directForm: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    maxWidth: '460px',
    marginTop: '14px'
  },
  directInput: {
    flex: 1,
    padding: '8px 14px',
    borderRadius: '8px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '12.5px',
    outline: 'none'
  },
  directSubmitBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  transcriptBox: {
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '8px 16px',
    marginTop: '8px'
  },
  transcriptText: {
    fontSize: '14px',
    fontStyle: 'italic',
    color: 'var(--accent)',
    fontWeight: '600'
  },
  transcriptPlaceholder: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  actionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    background: 'var(--success-glow)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: 'var(--success)',
    fontSize: '12.5px',
    fontWeight: '700',
    marginTop: '10px'
  },
  commandsSection: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border-subtle)',
    background: 'var(--bg-primary)'
  },
  commandsTitle: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '8px'
  },
  commandsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px'
  },
  commandPill: {
    padding: '6px 10px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontSize: '11.5px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};
