/**
 * ========================================
 * API CLIENT - VOLEY CLUB LA PLACETA
 * Conecta frontend con backend MongoDB
 * ========================================
 * Reemplaza el acceso directo a localStorage
 * por peticiones HTTP al servidor Node.js
 * ======================================== 
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

// ========================================
// TOKEN MANAGEMENT
// ========================================
function getAuthToken() {
  return sessionStorage.getItem('vcpl_api_token');
}

function setAuthToken(token) {
  sessionStorage.setItem('vcpl_api_token', token);
}

function clearAuthToken() {
  sessionStorage.removeItem('vcpl_api_token');
}

async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  
  // Si el backend no está disponible, lanzar error que se captura en los llamantes
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text ? `HTTP ${res.status}: ${text.slice(0,80)}` : `HTTP ${res.status}`);
  }
  
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Backend no disponible (respuesta no JSON)');
  }
  
  return await res.json();
}

// ========================================
// AUTH
// ========================================
async function apiLogin(username, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (data.token) {
    setAuthToken(data.token);
    sessionStorage.setItem('vcpl_user', JSON.stringify(data.user));
  }
  
  return data;
}

function apiLogout() {
  clearAuthToken();
  sessionStorage.removeItem('vcpl_user');
}

// ========================================
// FONDOS
// ========================================
async function apiGetFondos() {
  return await apiFetch('/fondos');
}

async function apiAddMovimiento(concepto, cantidad, categoria) {
  return await apiFetch('/fondos/historial', {
    method: 'POST',
    body: JSON.stringify({ concepto, cantidad, categoria, tipo: cantidad >= 0 ? 'ingreso' : 'gasto' })
  });
}

// ========================================
// MIEMBROS
// ========================================
async function apiGetMiembros() {
  return await apiFetch('/miembros');
}

// ========================================
// SOLICITUDES
// ========================================
async function apiEnviarSolicitud(data) {
  return await apiFetch('/solicitudes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ========================================
// PATROCINIOS
// ========================================
async function apiEnviarPatrocinio(data) {
  return await apiFetch('/patrocinios', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ========================================
// NOTICIAS
// ========================================
async function apiGetNoticias() {
  return await apiFetch('/noticias');
}

// ========================================
// TORNEOS
// ========================================
async function apiGetTorneos() {
  return await apiFetch('/torneos');
}

// ========================================
// PARTIDOS
// ========================================
async function apiGetPartidos() {
  return await apiFetch('/partidos');
}

// ========================================
// DASHBOARD
// ========================================
async function apiGetDashboard() {
  return await apiFetch('/dashboard');
}

// ========================================
// CONFIG
// ========================================
async function apiGetConfig() {
  return await apiFetch('/config');
}

// ========================================
// EXPORT
// ========================================
window.API = {
  login: apiLogin,
  logout: apiLogout,
  getFondos: apiGetFondos,
  addMovimiento: apiAddMovimiento,
  getMiembros: apiGetMiembros,
  enviarSolicitud: apiEnviarSolicitud,
  enviarPatrocinio: apiEnviarPatrocinio,
  getNoticias: apiGetNoticias,
  getTorneos: apiGetTorneos,
  getPartidos: apiGetPartidos,
  getDashboard: apiGetDashboard,
  getConfig: apiGetConfig,
  getAuthToken,
  setAuthToken,
  clearAuthToken
};
