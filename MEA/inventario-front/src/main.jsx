import React from 'react'; // Añadir React aquí
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap general
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap Icons ✅

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
