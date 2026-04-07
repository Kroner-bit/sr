import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMsg = this.state.error?.message || 'Unknown error';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error) {
          errorMsg = parsed.error;
        }
      } catch (e) {
        // Not JSON
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-display font-bold text-red-500 mb-4">Rendszerhiba</h2>
            <p className="text-zinc-400 mb-4">
              Váratlan hiba lépett fel az alkalmazás futása közben.
            </p>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm text-red-400 break-words font-mono">
              {errorMsg}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-red-500/10 text-red-500 border border-red-500/20 py-3 px-4 rounded-xl font-medium hover:bg-red-500/20 transition-colors active:scale-95"
            >
              Alkalmazás újratöltése
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
