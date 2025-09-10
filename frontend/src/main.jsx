import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { logToBackend } from "./utils/logger.js";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Global JS error handler
window.onerror = (message, source, lineno, colno, error) => {
  logToBackend("ERROR", String(message), { source, lineno, colno, stack: error?.stack });
};

// Unhandled promise rejections
window.onunhandledrejection = (event) => {
  logToBackend("ERROR", "Unhandled promise rejection", { reason: event.reason });
};