import { ThemeProvider } from '@auto-deck/ui/components/theme-provider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@auto-deck/ui/globals.css';

const root = document.getElementById('root');
if (root === null) {
  throw new Error('Root element "#root" not found.');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider storageKey="auto-deck-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
