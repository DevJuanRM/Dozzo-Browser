import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dozzo Browser caught error in component tree:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorCard} className="glass-panel">
            <AlertTriangle size={32} color="var(--accent)" />
            <div style={styles.errorTitle}>Se detectó un problema en esta vista</div>
            <div style={styles.errorMessage}>
              {this.state.error?.message || 'Error inesperado en renderizado'}
            </div>
            <button
              style={styles.retryBtn}
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RotateCw size={14} />
              <span>Recuperar vista</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  errorContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: '20px'
  },
  errorCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 32px',
    borderRadius: '16px',
    maxWidth: '460px',
    textAlign: 'center'
  },
  errorTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  errorMessage: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    wordBreak: 'break-word'
  },
  retryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    fontSize: '12.5px',
    fontWeight: '700',
    marginTop: '6px'
  }
};
