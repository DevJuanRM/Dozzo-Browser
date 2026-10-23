import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Download,
  Calendar,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'dozzo_browser_notes_store';

const DEFAULT_NOTES = [
  {
    id: 'note-welcome',
    title: 'Bienvenido a Notas Rápidas',
    content: 'Este panel te permite guardar fragmentos de código, enlaces, ideas o tareas mientras navegas en Dozzo.\n\n• Todo se guarda automáticamente en tu navegador.\n• Puedes copiar, descargar o filtrar tus notas en tiempo real.',
    tag: 'General',
    createdAt: new Date().toISOString()
  }
];

export default function NotesPanel() {
  const [notes, setNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState(() => notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const editorTextareaRef = useRef(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (_) {}
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    setSearchQuery('');
    const newId = `note-${Date.now()}`;
    const newNote = {
      id: newId,
      title: 'Nota sin título',
      content: '',
      tag: 'Idea',
      createdAt: new Date().toISOString()
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newId);
    setTimeout(() => {
      editorTextareaRef.current?.focus();
    }, 50);
  };

  const handleUpdateActiveNote = (fields) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? { ...n, ...fields, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleDeleteNote = (id, e) => {
    e?.stopPropagation();
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    const text = `${activeNote.title}\n\n${activeNote.content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([`${activeNote.title}\n\n${activeNote.content}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeNote.title || 'nota').replace(/[^a-z0-9_-]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.tag && n.tag.toLowerCase().includes(q));
  });

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header Bar: Modern Zinc Dev Mode Aesthetic */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBadge}>
            <FileText size={15} color="var(--accent)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={styles.title}>Notas Rápidas</span>
            <span style={styles.badge}>{notes.length}</span>
          </div>
        </div>

        <button style={styles.newBtn} onClick={handleCreateNote} title="Crear nueva nota">
          <Plus size={14} />
          <span>Nueva</span>
        </button>
      </div>

      {/* Search Input Filter */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={13} color="rgba(255, 255, 255, 0.4)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en tus notas..."
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Main Content: Split into Mini Notes List (top/left) and Editor (bottom) */}
      <div style={styles.bodySplit}>
        {/* Horizontal Mini Cards / Pills of Notes */}
        <div style={styles.notesList} className="custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div style={styles.emptyListText}>No se encontraron notas</div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = note.id === activeNote?.id;
              return (
                <div
                  key={note.id}
                  style={{
                    ...styles.noteItem,
                    ...(isActive ? styles.noteItemActive : {})
                  }}
                  onClick={() => setActiveNoteId(note.id)}
                >
                  <div style={styles.noteItemHeader}>
                    <span style={styles.noteItemTitle}>{note.title || 'Sin título'}</span>
                    <button
                      style={styles.deleteMiniBtn}
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      title="Eliminar nota"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={styles.noteSnippet}>
                    {note.content ? note.content.slice(0, 75).replace(/\n/g, ' ') : 'Nota vacía...'}
                  </div>
                  <div style={styles.noteItemFooter}>
                    <span style={styles.noteDate}>{formatDate(note.createdAt)}</span>
                    {note.tag && <span style={styles.tagPill}>{note.tag}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Note Editor Area */}
        {activeNote ? (
          <div style={styles.editorArea}>
            {/* Editor Toolbar */}
            <div style={styles.editorToolbar}>
              <div style={styles.tagSelector}>
                {['General', 'Idea', 'Código', 'Tareas'].map((tg) => (
                  <button
                    key={tg}
                    type="button"
                    style={{
                      ...styles.tagChoiceBtn,
                      ...(activeNote.tag === tg ? styles.tagChoiceBtnActive : {})
                    }}
                    onClick={() => handleUpdateActiveNote({ tag: tg })}
                  >
                    {tg}
                  </button>
                ))}
              </div>

              <div style={styles.toolbarActions}>
                <button
                  type="button"
                  style={styles.actionIconBtn}
                  onClick={handleCopyNote}
                  title="Copiar texto de la nota"
                >
                  {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                </button>
                <button
                  type="button"
                  style={styles.actionIconBtn}
                  onClick={handleDownloadNote}
                  title="Descargar como archivo .txt"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>

            {/* Note Title Input */}
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
              placeholder="Título de la nota..."
              style={styles.titleInput}
            />

            {/* Note Content Textarea */}
            <textarea
              ref={editorTextareaRef}
              value={activeNote.content}
              onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
              placeholder="Escribe aquí tus apuntes, notas o código..."
              style={styles.textarea}
              className="custom-scrollbar"
            />

            {/* Editor Footer Stats */}
            <div style={styles.editorFooter}>
              <span style={styles.statText}>
                {activeNote.content.length} caracteres • {activeNote.content.split(/\s+/).filter(Boolean).length} palabras
              </span>
              <span style={styles.savedBadge}>✓ Guardado automático</span>
            </div>
          </div>
        ) : (
          <div style={styles.emptySelection}>
            <Sparkles size={24} color="rgba(255, 255, 255, 0.3)" />
            <p style={{ margin: '8px 0 12px 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Selecciona una nota o crea una nueva
            </p>
            <button style={styles.newBtn} onClick={handleCreateNote}>
              <Plus size={14} />
              <span>Crear Nota</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: '#090a0f',
    color: '#ffffff',
    fontFamily: "'Lato', -apple-system, sans-serif",
    userSelect: 'none',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  iconBadge: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.01em'
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    color: '#ffffff',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  searchRow: {
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '12px',
    fontFamily: "'Lato', sans-serif"
  },
  bodySplit: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  notesList: {
    maxHeight: '190px',
    overflowY: 'auto',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(0, 0, 0, 0.25)',
    flexShrink: 0
  },
  emptyListText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    padding: '12px 0'
  },
  noteItem: {
    padding: '8px 10px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  noteItemActive: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
  },
  noteItemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  noteItemTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  deleteMiniBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.35)',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  noteSnippet: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.55)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  noteItemFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '2px'
  },
  noteDate: {
    fontSize: '9.5px',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  tagPill: {
    fontSize: '9.5px',
    padding: '1px 5px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  editorArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 14px',
    overflow: 'hidden',
    gap: '10px'
  },
  editorToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '6px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  tagSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  tagChoiceBtn: {
    padding: '2px 7px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '10.5px',
    cursor: 'pointer'
  },
  tagChoiceBtnActive: {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
    fontWeight: '700'
  },
  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  actionIconBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '5px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
  },
  titleInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    caretColor: '#ffffff',
    userSelect: 'text',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: "'Lato', sans-serif",
    padding: '4px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: '13px',
    lineHeight: '1.6',
    fontFamily: "'Lato', -apple-system, sans-serif",
    resize: 'none',
    padding: '4px 0',
    userSelect: 'text'
  },
  editorFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    fontSize: '10px'
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.4)'
  },
  savedBadge: {
    color: 'rgba(255, 255, 255, 0.5)'
  },
  emptySelection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }
};
