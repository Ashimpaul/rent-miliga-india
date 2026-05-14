
import React, { Component, ReactNode } from "react";
import MaintenancePage from "./MaintenancePage";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <MaintenancePage 
          isError={true} 
          errorMessage={this.state.error?.message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
