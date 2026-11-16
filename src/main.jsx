// src/main.jsx
// Point d'entrée principal avec initialisation immédiate de l'ambiance STACK Partner

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { chargerAmbiancePartner, appliquerAmbiancePartner } from './constants/ambiances';

// Application immédiate de l'ambiance sauvegardée avant le premier rendu (zéro scintillement)
const initialAmbiance = chargerAmbiancePartner();
appliquerAmbiancePartner({
  isDarkMode: initialAmbiance.isDarkMode,
  themeJourCle: initialAmbiance.themeJour,
  themeNuitCle: initialAmbiance.themeNuit,
  broadcast: false
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
