import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { ensureSeeded, ensureLibrarySeeded } from './db/seed.js';
import './index.css';

// Register the service worker (vite-plugin-pwa virtual module).
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });

// Seed sample data on first run (and back-fill the library/cycles on upgrade),
// then mount.
ensureSeeded()
  .then(ensureLibrarySeeded)
  .catch(() => {})
  .finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
});
