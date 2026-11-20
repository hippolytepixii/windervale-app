import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Compass } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center p-6 bg-white text-black select-none">
          <div className="max-w-md w-full border-[2.5px] border-black bg-[#fbf6f0] p-6 space-y-4 text-center">
            <div className="w-12 h-12 border-[2px] border-black bg-black text-white flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-black/70 font-bold block">
                SYSTEM PRAXIS : VIEW RESTORATION
              </span>
              <h2 className="font-fun font-bold text-xl text-black lowercase">
                {this.props.fallbackTitle || 'section temporarily interrupted'}
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-relaxed max-w-sm mx-auto">
                An unexpected interface exception occurred. The system has safeguarded your session data.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 bg-black text-white border-[2px] border-black font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 hover:bg-black/85 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RELOAD VIEW</span>
              </button>
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.reload();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white text-black border-[2px] border-black font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>REFRESH APP</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
