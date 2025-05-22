import React from 'react';
import { ToastExamples } from '@/examples/ToastExamples';

export function ToastExamplesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Toast Notification Examples</h1>
      <p className="text-muted-foreground mb-6">
        This page demonstrates the standardized toast notification system.
        Use these examples as a reference for implementing toast notifications in your application.
      </p>
      <ToastExamples />
    </div>
  );
}

export default ToastExamplesPage;
