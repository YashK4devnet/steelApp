import React from 'react';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { ToastProvider } from './app/providers/ToastProvider';
import { AppRouter } from './app/router';

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;
