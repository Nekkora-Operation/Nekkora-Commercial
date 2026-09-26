import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'nekkora-lib';
import 'nekkora-lib/styles.css';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider target="document" theme="dark">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
