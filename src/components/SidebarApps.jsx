import React, { useState, useEffect } from 'react';
import {
  Bot,
  TrendingUp,
  CheckSquare,
  Calculator,
  X,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  RotateCw
} from 'lucide-react';

export default function SidebarApps({ isOpen, onClose, onNavigate }) {
  const [activeTab, setActiveTab] = useState('notes');

  // Notes / Tasks Cards State
  const [notesCards, setNotesCards] = useState(() => {
    try {
      const saved = localStorage.getItem('dozzo_cards_notes');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              text: 'Revisar nuevo diseño en Figma y copiar componentes a React',
              completed: false,
              createdAt: 'Hoy 10:30 AM'
            },
            {
              id: '2',
              text: 'Comprar Bitcoin o USDT con el conversor de Binance',
              completed: true,
              createdAt: 'Ayer 4:15 PM'
            }
          ];
    } catch {
      return [];
    }
  });
  const [newNoteInput, setNewNoteInput] = useState('');
  const [notesFilter, setNotesFilter] = useState('all'); // all | pending | completed

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('dozzo_cards_notes', JSON.stringify(notesCards));
  }, [notesCards]);

  // Crypto Converter State
  const [amount, setAmount] = useState('100');
  const [fromCoin, setFromCoin] = useState('USDT');
  const [toCoin, setToCoin] = useState('BTC');
  const [copiedResult, setCopiedResult] = useState(false);
  const [prices, setPrices] = useState({
    BTC: 68400,
    ETH: 2650,
    SOL: 168,
    BNB: 595,
    DOGE: 0.145,
    USDT: 1
  });

  // AI Sidebar Embedded Webview State
  const [selectedAi, setSelectedAi] = useState('duckduckgo');
  const aiOptions = [
    {
      id: 'duckduckgo',
      name: 'Multi-IA Libre',
      sub: 'GPT-4o mini, Claude 3, Llama 3 (Sin Login)',
      url: 'https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      sub: 'OpenAI GPT-4o',
      url: 'https://chatgpt.com'
    },
    {
      id: 'claude',
      name: 'Claude AI',
      sub: 'Anthropic Claude 3.5 Sonnet',
      url: 'https://claude.ai'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      sub: 'Búsqueda & Respuestas IA',
      url: 'https://www.perplexity.ai'
    }
  ];

  // Fetch live prices for converter
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT'];
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        if (res.ok) {
          const data = await res.json();
          const newPrices = { USDT: 1 };
          data.forEach((p) => {
            if (p.symbol === 'BTCUSDT') newPrices.BTC = parseFloat(p.price);
            if (p.symbol === 'ETHUSDT') newPrices.ETH = parseFloat(p.price);
            if (p.symbol === 'SOLUSDT') newPrices.SOL = parseFloat(p.price);
            if (p.symbol === 'BNBUSDT') newPrices.BNB = parseFloat(p.price);
            if (p.symbol === 'DOGEUSDT') newPrices.DOGE = parseFloat(p.price);
          });
          setPrices((prev) => ({ ...prev, ...newPrices }));
        }
      } catch (e) {}
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 20000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Notes Actions
  const handleAddNote = () => {
    const text = newNoteInput.trim();
    if (!text) return;
    const now = new Date();
    const timeStr = `Hoy ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newCard = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: timeStr
    };
    setNotesCards([newCard, ...notesCards]);
    setNewNoteInput('');
  };

  const handleToggleComplete = (id) => {
    setNotesCards(
      notesCards.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const handleDeleteNote = (id) => {
    setNotesCards(notesCards.filter((n) => n.id !== id));
  };

  const filteredNotes = notesCards.filter((n) => {
    if (notesFilter === 'pending') return !n.completed;
    if (notesFilter === 'completed') return n.completed;
    return true;
  });

  // Converter Calculation
  const calculateConversion = () => {
    const val = parseFloat(amount) || 0;
    if (fromCoin === toCoin) return val.toFixed(4);

    // Convert from -> USD/USDT -> to
    const fromPriceInUsdt = prices[fromCoin] || 1;
    const toPriceInUsdt = prices[toCoin] || 1;

    const totalUsdt = val * fromPriceInUsdt;
    const result = totalUsdt / toPriceInUsdt;

    if (toCoin === 'BTC' || toCoin === 'ETH') return result.toFixed(6);
    if (toCoin === 'SOL' || toCoin === 'BNB') return result.toFixed(4);
    if (toCoin === 'DOGE') return result.toFixed(2);
    return result.toFixed(2);
  };

  const handleSwapCoins = () => {
    const temp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(temp);
  };

  const handleCopyCalc = () => {
    navigator.clipboard.writeText(`${calculateConversion()} ${toCoin}`);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 1500);
  };

  const coins = ['USDT', 'BTC', 'ETH', 'SOL', 'BNB', 'DOGE'];
  const presets = ['25', '50', '100', '500', '1000'];

  const currentAiUrl = aiOptions.find((a) => a.id === selectedAi)?.url || aiOptions[0].url;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sidebar} className="glass-panel animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Header Tabs */}
        <div style={styles.header}>
          <div style={styles.tabsStrip}>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === 'notes' ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab('notes')}
              title="Tareas y Notas Rápidas"
            >
              <CheckSquare size={15} />
              <span>Notas ({notesCards.filter((n) => !n.completed).length})</span>
            </button>

            <button
              style={{ ...styles.tabBtn, ...(activeTab === 'calc' ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab('calc')}
              title="Conversor Cripto Binance"
            >
              <Calculator size={15} />
              <span>Conversor</span>
            </button>

            <button
              style={{ ...styles.tabBtn, ...(activeTab === 'ai' ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab('ai')}
              title="Asistente de Inteligencia Artificial"
            >
              <Bot size={15} color="#10B981" />
              <span>IA Lateral</span>
            </button>
          </div>

          <button style={styles.closeBtn} onClick={onClose} title="Cerrar panel">
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div style={styles.content}>
          {/* TAB 1: NOTES AS CARDS */}
          {activeTab === 'notes' && (
            <div style={styles.notesContainer}>
              {/* New note input box */}
              <div style={styles.addNoteBox}>
                <input
                  type="text"
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Escribe una tarea o nota y presiona Enter..."
                  style={styles.addNoteInput}
                  autoFocus
                />
                <button style={styles.addNoteBtn} onClick={handleAddNote} title="Guardar nota en card">
                  <Plus size={15} />
                  <span>OK</span>
                </button>
              </div>

              {/* Filters */}
              <div style={styles.filterStrip}>
                <button
                  style={{ ...styles.filterChip, ...(notesFilter === 'all' ? styles.filterChipActive : {}) }}
                  onClick={() => setNotesFilter('all')}
                >
                  Todas ({notesCards.length})
                </button>
                <button
                  style={{ ...styles.filterChip, ...(notesFilter === 'pending' ? styles.filterChipActive : {}) }}
                  onClick={() => setNotesFilter('pending')}
                >
                  Pendientes ({notesCards.filter((n) => !n.completed).length})
                </button>
                <button
                  style={{ ...styles.filterChip, ...(notesFilter === 'completed' ? styles.filterChipActive : {}) }}
                  onClick={() => setNotesFilter('completed')}
                >
                  Hechas ({notesCards.filter((n) => n.completed).length})
                </button>
              </div>

              {/* Cards List */}
              <div style={styles.cardsList}>
                {filteredNotes.length === 0 ? (
                  <div style={styles.emptyCards}>
                    <CheckSquare size={32} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '6px' }} />
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      No hay notas en esta sección
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Escribe arriba y presiona OK para crear una card
                    </div>
                  </div>
                ) : (
                  filteredNotes.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        ...styles.noteCard,
                        ...(card.completed ? styles.noteCardCompleted : {})
                      }}
                    >
                      <button
                        style={{
                          ...styles.checkBtn,
                          ...(card.completed ? styles.checkBtnDone : {})
                        }}
                        onClick={() => handleToggleComplete(card.id)}
                        title={card.completed ? 'Marcar como pendiente' : 'Marcar como hecha'}
                      >
                        {card.completed && <Check size={12} color="#000" strokeWidth={3} />}
                      </button>

                      <div style={styles.cardContent}>
                        <div
                          style={{
                            ...styles.cardText,
                            textDecoration: card.completed ? 'line-through' : 'none',
                            color: card.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                          }}
                        >
                          {card.text}
                        </div>
                        <div style={styles.cardMeta}>
                          <span style={styles.cardTime}>{card.createdAt}</span>
                          {card.completed && <span style={styles.hechaBadge}>✓ Hecha</span>}
                        </div>
                      </div>

                      <button
                        style={styles.deleteCardBtn}
                        onClick={() => handleDeleteNote(card.id)}
                        title="Eliminar card"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE CRYPTO CONVERTER */}
          {activeTab === 'calc' && (
            <div style={styles.calcContainer}>
              <div style={styles.calcTitle}>Conversor de Criptomonedas en Vivo</div>

              <div style={styles.calcCard}>
                {/* Amount input */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cantidad a convertir:</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={styles.calcInput}
                    placeholder="0.00"
                  />
                </div>

                {/* Presets */}
                <div style={styles.presetsStrip}>
                  {presets.map((p) => (
                    <button
                      key={p}
                      style={{ ...styles.presetBtn, ...(amount === p ? styles.presetBtnActive : {}) }}
                      onClick={() => setAmount(p)}
                    >
                      ${p}
                    </button>
                  ))}
                </div>

                {/* Coin Selectors with Swap */}
                <div style={styles.selectorsRow}>
                  <div style={styles.selectorCol}>
                    <label style={styles.label}>De:</label>
                    <div style={styles.coinPills}>
                      {coins.map((c) => (
                        <button
                          key={c}
                          style={{
                            ...styles.coinPill,
                            ...(fromCoin === c ? styles.coinPillActive : {})
                          }}
                          onClick={() => setFromCoin(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button style={styles.swapBtn} onClick={handleSwapCoins} title="Intercambiar monedas">
                    <ArrowRightLeft size={14} />
                  </button>

                  <div style={styles.selectorCol}>
                    <label style={styles.label}>A:</label>
                    <div style={styles.coinPills}>
                      {coins.map((c) => (
                        <button
                          key={c}
                          style={{
                            ...styles.coinPill,
                            ...(toCoin === c ? styles.coinPillActive : {})
                          }}
                          onClick={() => setToCoin(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Result Box */}
                <div style={styles.resultBox}>
                  <div style={styles.resultHeader}>
                    <span style={styles.resultLabel}>Resultado de Conversión:</span>
                    <button style={styles.copyResultBtn} onClick={handleCopyCalc}>
                      {copiedResult ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                      <span>{copiedResult ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div style={styles.resultValue}>
                    {calculateConversion()} <span style={{ fontSize: '15px', color: '#F0B90B' }}>{toCoin}</span>
                  </div>
                  <div style={styles.resultSub}>
                    Precio de referencia: 1 {toCoin} ≈ ${prices[toCoin]?.toLocaleString()} USDT
                  </div>
                </div>

                {/* Binance Button */}
                <button
                  style={styles.tradeNowBtn}
                  onClick={() => {
                    onNavigate(`https://www.binance.com/es/trade/${toCoin === 'USDT' ? fromCoin : toCoin}_USDT`);
                    onClose();
                  }}
                >
                  <TrendingUp size={15} color="#000" />
                  <span>Ver Gráfico y Operar en Binance</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: AI ASSISTANT EMBEDDED IN SIDEBAR */}
          {activeTab === 'ai' && (
            <div style={styles.aiContainer}>
              {/* Model Switcher */}
              <div style={styles.aiSelectorBar}>
                <div style={styles.aiPills}>
                  {aiOptions.map((opt) => (
                    <button
                      key={opt.id}
                      style={{
                        ...styles.aiPill,
                        ...(selectedAi === opt.id ? styles.aiPillActive : {})
                      }}
                      onClick={() => setSelectedAi(opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Embedded Webview */}
              <div style={styles.aiWebviewWrapper}>
                <webview
                  key={selectedAi}
                  src={currentAiUrl}
                  partition="persist:dozzo-browser"
                  allowpopups="true"
                  style={styles.aiWebview}
                />
              </div>
            </div>
          )}
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
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(3px)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  sidebar: {
    width: '420px',
    maxWidth: '94vw',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border-subtle)',
    boxShadow: '-10px 0 35px rgba(0,0,0,0.6)',
    padding: '14px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  tabsStrip: {
    display: 'flex',
    gap: '6px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    background: 'transparent'
  },
  tabBtnActive: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    color: 'var(--text-muted)'
  },
  content: {
    flex: 1,
    paddingTop: '14px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  notesContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '12px'
  },
  addNoteBox: {
    display: 'flex',
    gap: '6px'
  },
  addNoteInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '12.5px'
  },
  addNoteBtn: {
    padding: '0 16px',
    borderRadius: '10px',
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    fontSize: '12px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  filterStrip: {
    display: 'flex',
    gap: '6px'
  },
  filterChip: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    background: 'var(--bg-primary)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-subtle)'
  },
  filterChipActive: {
    background: 'var(--bg-tertiary)',
    color: 'var(--accent)',
    borderColor: 'var(--accent)'
  },
  cardsList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  noteCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    borderRadius: '10px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    transition: 'all 0.15s ease'
  },
  noteCardCompleted: {
    opacity: 0.65,
    background: 'rgba(0,0,0,0.2)'
  },
  checkBtn: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '2px solid var(--border-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
    flexShrink: 0
  },
  checkBtnDone: {
    background: 'var(--accent)',
    borderColor: 'var(--accent)'
  },
  cardContent: {
    flex: 1,
    minWidth: 0
  },
  cardText: {
    fontSize: '12.5px',
    lineHeight: 1.4,
    wordBreak: 'break-word',
    fontWeight: '500'
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px'
  },
  cardTime: {
    fontSize: '10.5px',
    color: 'var(--text-muted)'
  },
  hechaBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--success)'
  },
  deleteCardBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    opacity: 0.5,
    transition: 'all 0.15s ease'
  },
  emptyCards: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  calcContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  calcTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  calcCard: {
    padding: '16px',
    borderRadius: '12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  calcInput: {
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '800'
  },
  presetsStrip: {
    display: 'flex',
    gap: '6px'
  },
  presetBtn: {
    flex: 1,
    padding: '6px 0',
    borderRadius: '6px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    fontSize: '11.5px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  presetBtnActive: {
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    borderColor: 'var(--accent)'
  },
  selectorsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  selectorCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  coinPills: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px'
  },
  coinPill: {
    padding: '5px 0',
    borderRadius: '6px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  coinPillActive: {
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    borderColor: 'var(--accent)'
  },
  swapBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--accent)',
    marginTop: '16px'
  },
  resultBox: {
    padding: '12px 14px',
    borderRadius: '10px',
    background: 'rgba(240, 185, 11, 0.08)',
    border: '1px solid rgba(240, 185, 11, 0.25)'
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  resultLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  copyResultBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: 'var(--accent)',
    fontWeight: '700'
  },
  resultValue: {
    fontSize: '22px',
    fontWeight: '900',
    fontFamily: 'JetBrains Mono, monospace',
    color: '#F0B90B'
  },
  resultSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  tradeNowBtn: {
    padding: '10px',
    borderRadius: '10px',
    background: '#F0B90B',
    color: '#000',
    fontWeight: '800',
    fontSize: '12.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  aiContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '8px'
  },
  aiSelectorBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '6px'
  },
  aiPills: {
    display: 'flex',
    gap: '4px',
    overflowX: 'auto',
    width: '100%'
  },
  aiPill: {
    padding: '5px 10px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap'
  },
  aiPillActive: {
    background: '#10B981',
    color: '#ffffff',
    borderColor: '#10B981'
  },
  aiWebviewWrapper: {
    flex: 1,
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-primary)'
  },
  aiWebview: {
    width: '100%',
    height: '100%',
    border: 'none'
  }
};
