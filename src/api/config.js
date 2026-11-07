// src/api/config.js
// Configuration centralisée de l'API STACK Partners
// - Priorité 1 : variable d'environnement VITE_API_URL
// - Priorité 2 : développement local (http://localhost:3000/api/partners)
// - Priorité 3 : domaine personnalisé de production (https://api.stack.fr/api/partners) si sur *.stack.fr
// - Fallback : backend de production Render (https://api-salon-backend.onrender.com/api/partners)

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export function getPartnersApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (isLocalhost) {
    return 'http://localhost:3000/api/partners';
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'stack.fr' || host.endsWith('.stack.fr')) {
      return 'https://api.stack.fr/api/partners';
    }
  }
  return 'https://api-salon-backend.onrender.com/api/partners';
}

export const API_URL = getPartnersApiUrl();

export default API_URL;
