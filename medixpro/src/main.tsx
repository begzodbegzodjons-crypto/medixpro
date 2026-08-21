import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error Boundary - catches any JS errors during render
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#0f172a', color: '#e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{maxWidth: '500px'}}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚠️</div>
            <h1 style={{fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem'}}>
              Saytda xatolik yuz berdi
            </h1>
            <p style={{color: '#94a3b8', marginBottom: '2rem'}}>
              Iltimos, sahifani yangilang. Agar xatolik davom etsa, brauzer cache'ni tozalang.
            </p>
            <button
              onClick={() => location.reload()}
              style={{
                background: '#3b82f6', color: 'white', border: 'none',
                padding: '0.75rem 2rem', borderRadius: '0.5rem',
                fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
              }}
            >
              Sahifani yangilash
            </button>
            <details style={{marginTop: '2rem', color: '#64748b', fontSize: '0.85rem'}}>
              <summary style={{cursor: 'pointer'}}>Texnik ma'lumot</summary>
              <pre style={{marginTop: '0.5rem', textAlign: 'left', overflow: 'auto', maxHeight: '200px'}}>
                {this.state.error?.message}
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
    // Root not found yet, retry
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

// Mount when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

// Global error handler for uncaught errors
window.addEventListener('error', (e) => {
  console.error('Uncaught error:', e.error || e.message);
  // Don't show black screen - keep the loader visible
  const root = document.getElementById('root');
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="position:fixed;inset:0;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:2rem;text-align:center;">
        <div style="max-width:500px;">
          <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
          <h1 style="font-size:1.5rem;color:#ef4444;margin-bottom:1rem;">Saytda xatolik yuz berdi</h1>
          <p style="color:#94a3b8;margin-bottom:2rem;">Iltimos, sahifani yangilang (Ctrl+Shift+R).</p>
          <button onclick="location.reload()" style="background:#3b82f6;color:white;border:none;padding:0.75rem 2rem;border-radius:0.5rem;font-size:1rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(59,130,246,0.4);">Sahifani yangilash</button>
        </div>
      </div>
    `;
  }
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});
