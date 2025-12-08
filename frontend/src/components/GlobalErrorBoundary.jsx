import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error caught by Global Error Boundary:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0e0e16',
                    color: '#fff',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#ff422e' }}>
                        Une erreur inattendue est survenue
                    </h1>
                    <p style={{ color: '#9ca3af', marginBottom: '24px', maxWidth: '500px' }}>
                        L'application a rencontré un problème critique. Veuillez rafraîchir la page.
                        Si le problème persiste, contactez le support.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#ea580c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Rafraîchir la page
                    </button>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div style={{
                            marginTop: '40px',
                            padding: '20px',
                            background: '#1f2937',
                            borderRadius: '8px',
                            textAlign: 'left',
                            maxWidth: '800px',
                            overflow: 'auto',
                            width: '100%'
                        }}>
                            <p style={{ color: '#f87171', fontFamily: 'monospace', marginBottom: '10px' }}>
                                {this.state.error.toString()}
                            </p>
                            <pre style={{ color: '#9ca3af', fontSize: '12px' }}>
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
