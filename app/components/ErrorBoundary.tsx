"use client";
import * as React from "react";

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#f8d7da", color: "#721c24" }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
