import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'nekkora-lib';
import 'nekkora-lib/styles.css';
import './styles.css';
import { App } from './App';
import { THEME_STORAGE_KEY } from './config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      target="document"
      defaultTheme="midnight-blue"
      pair={{ dark: 'midnight-blue', light: 'sage-light' }}
      storageKey={THEME_STORAGE_KEY}
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
);
