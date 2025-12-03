import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console; in future, send to monitoring endpoint
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Something went wrong.</h1>
          <p style={{ marginTop: 8, color: '#666' }}>An unexpected error occurred in the app. Try refreshing the page.</p>
          <div style={{ marginTop: 12 }}>
            <a href="/api/health" target="_blank" rel="noreferrer">Check API health</a>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
              {String(this.state.error)}\n{this.state.info?.componentStack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
