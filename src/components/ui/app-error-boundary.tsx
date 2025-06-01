
import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorState } from "./error-state";

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("App Error Boundary caught an error:", error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage = isDevelopment && this.state.error?.message 
        ? `Development Error: ${this.state.error.message}`
        : "We encountered an unexpected error. Our team has been notified and is working on a fix.";

      return (
        <ErrorState
          title="Application Error"
          message={errorMessage}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showRetry={true}
          showGoHome={true}
          variant="error"
        />
      );
    }

    return this.props.children;
  }
}
