"use client";
import * as React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(JSON.stringify({
      event: "react_error_boundary",
      message: error.message,
      componentStack: errorInfo.componentStack,
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#f8d7da", color: "#721c24" }}>
          <h2>পৃষ্ঠা প্রদর্শনে সমস্যা হয়েছে।</h2>
          <p>অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।</p>
        </div>
      );
    }
    return this.props.children;
  }
}
