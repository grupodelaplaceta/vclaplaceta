/**
 * ========================================
 * API-DATA: CRM sincronizado con MongoDB
 * Carga datos de API al inicio, localStorage como capa síncrona
 * ========================================
 */

// Primero: asegurar datos por defecto en localStorage si no existen
(function() {
  if (typeof CRM_DEFAULT !== 'undefined' && !localStorage.getItem('vcpl_crm_data')) {
    localStorage.setItem('vcpl_crm_data', JSON.stringify(CRM_DEFAULT));
  }
})();

// Después: cargar desde API en segundo plano
(async function loadFromAPI() {
  const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api' : '/api';
  try {
    const res = await fetch(base + '/crm-data');
    if (res.ok) {
      const data = await res.json();
      if (typeof CRM_DEFAULT !== 'undefined') {
        const merged = JSON.parse(JSON.stringify(CRM_DEFAULT));
        deepMerge(merged, data);
        localStorage.setItem('vcpl_crm_data', JSON.stringify(merged));
      } else {
        localStorage.setItem('vcpl_crm_data', JSON.stringify(data));
      }
      console.log('✅ CRM cargado desde API');
      // Forzar recarga si la página ya se inicializó
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderCuotas === 'function') renderCuotas();
      if (typeof renderTorneos === 'function') renderTorneos();
    }
  } catch(e) { console.log('⚠️ API no disponible, modo local'); }
})();

function deepMerge(t, s) {
  for (const k in s) {
    if (s[k] === null || s[k] === undefined) continue;
    if (Array.isArray(s[k])) {
      if (s[k].length > 0) t[k] = s[k];
    } else if (typeof s[k] === 'object') {
      if (!t[k]) t[k] = {};
      deepMerge(t[k], s[k]);
    } else t[k] = s[k];
  }
}

// saveCRM sincroniza con API
const _origSave = window.saveCRM || function(){};
window.saveCRM = function(data) {
  localStorage.setItem('vcpl_crm_data', JSON.stringify(data));
  if (typeof _origSave === 'function') _origSave(data);
  setTimeout(async () => {
    try {
      const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api' : '/api';
      const token = sessionStorage.getItem('vcpl_api_token');
      await fetch(base + '/crm-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'x-auth-token': token } : {}) },
        body: JSON.stringify(data)
      });
    } catch(e) {}
  }, 100);
};
