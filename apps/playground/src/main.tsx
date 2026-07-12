import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './components/theme-provider';
import './globals.css';

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
