import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">حدث خطأ غير متوقع</h1>
            <p className="text-muted-foreground">نعتذر عن هذا الخطأ، يرجى إعادة تحميل الصفحة.</p>
            <Button onClick={() => window.location.reload()}>إعادة تحميل</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
