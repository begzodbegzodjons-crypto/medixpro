import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Smart Error Boundary - recovers from errors automatically
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error: Error | null; retryCount: number}> {
  constructor(props: any) {
    super(props);
    this.state = {hasError: false, error: null, retryCount: 0};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React render error:', error, errorInfo);
    // Store last error for debugging
    try {
      localStorage.setItem('medixpro_last_error', JSON.stringify({
        message: error.message,
        stack: error.stack?.substring(0, 2000),
        time: new Date().toISOString(),
      }));
    } catch {}
  }

  handleReset = () => {
    // Clear all clinic data (likely the source of corruption)
    try {
      // Only clear app data, not everything
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('medixpro_') || key.startsWith('klinika_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
    // Reload the page fresh
    window.location.href = window.location.pathname + '?fresh=' + Date.now();
  };

  handleRetry = () => {
    this.setState({hasError: false, error: null, retryCount: this.state.retryCount + 1});
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Noma\'lum xato';
      const isDataError = errorMsg.includes('JSON') || errorMsg.includes('parse') || 
                          errorMsg.includes('undefined') || errorMsg.includes('null') ||
                          errorMsg.includes('localStorage') || errorMsg.includes('Cannot read');

      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#0f172a', color: '#e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{maxWidth: '600px'}}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚠️</div>
            <h1 style={{fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem'}}>
              Saytda xatolik yuz berdi
            </h1>
            <p style={{color: '#94a3b8', marginBottom: '1.5rem'}}>
              {isDataError 
                ? 'Eski ma\'lumotlar buzilgan. Ma\'lumotlarni tozalash va qayta urinish kerak.'
                : 'Iltimos, sahifani yangilang yoki ma\'lumotlarni tozalang.'}
            </p>
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap'}}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: '#3b82f6', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                  fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
                }}
              >
                Qayta urinish
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  background: '#dc2626', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                  fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.4)'
                }}
              >
                Ma'lumotlarni tozalash va qayta yuklash
              </button>
            </div>

            <details style={{marginTop: '1rem', color: '#64748b', fontSize: '0.85rem', textAlign: 'left'}}>
              <summary style={{cursor: 'pointer', color: '#94a3b8'}}>Texnik ma'lumot</summary>
              <pre style={{
                marginTop: '0.5rem', padding: '1rem', background: '#1e293b', 
                borderRadius: '0.5rem', overflow: 'auto', maxHeight: '200px',
                color: '#fca5a5', fontSize: '0.8rem', whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {errorMsg}
                {this.state.error?.stack ? '\n\n' + this.state.error.stack.substring(0, 1500) : ''}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wait for DOM ready
function mountApp() {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    setTimeout(mountApp, 50);
    return;
  }
  
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

// Global error handler - prevent total black screen
window.addEventListener('error', (e) => {
  console.error('Uncaught error:', e.error || e.message);
  const root = document.getElementById('root');
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="position:fixed;inset:0;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:2rem;text-align:center;">
        <div style="max-width:500px;">
          <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
          <h1 style="font-size:1.5rem;color:#ef4444;margin-bottom:1rem;">Saytda xatolik yuz berdi</h1>
          <p style="color:#94a3b8;margin-bottom:1rem;">Ma'lumotlarni tozalash va qayta urinish kerak.</p>
          <button onclick="
            try {
              const keys = [];
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('medixpro_') || k.startsWith('klinika_'))) keys.push(k);
              }
              keys.forEach(k => localStorage.removeItem(k));
            } catch(e) {}
            location.href = location.pathname + '?fresh=' + Date.now();
          " style="background:#dc2626;color:white;border:none;padding:0.75rem 2rem;border-radius:0.5rem;font-size:1rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(220,38,38,0.4);margin-right:0.5rem;">
            Ma'lumotlarni tozalash
          </button>
          <button onclick="location.reload()" style="background:#3b82f6;color:white;border:none;padding:0.75rem 2rem;border-radius:0.5rem;font-size:1rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(59,130,246,0.4);">
            Sahifani yangilash
          </button>
        </div>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});
