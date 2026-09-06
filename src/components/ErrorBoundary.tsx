import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught component error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
              <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
            </div>
            
            <h2 className="text-xl font-black text-stone-900 tracking-tight mb-2">
              पेज लोड करने में रुकावट आई
            </h2>
            
            <p className="text-xs text-stone-600 font-medium mb-6 leading-relaxed">
              एक छोटी तकनीकी समस्या के कारण स्क्रीन रीसेट हो गई है। नीचे दिए गए बटन से तुरंत पुनः लोड करें।
            </p>

            {this.state.error && (
              <div className="p-3 mb-6 bg-stone-100 rounded-xl text-[11px] font-mono text-stone-700 text-left overflow-x-auto max-h-24 border border-stone-200">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पुनः प्रयास करें (Retry)</span>
              </button>
              
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>पेज रीलोड करें</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
