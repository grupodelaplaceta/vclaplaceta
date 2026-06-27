const express = require('express');
const router = express.Router();
const { getDB, saveData } = require('../db');

// ========================================
// MIDDLEWARE: SESIÓN SIMPLE
// ========================================
function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try { req.user = JSON.parse(Buffer.from(token, 'base64').toString()); next(); }
  catch { return res.status(401).json({ error: 'Token inválido' }); }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: 'Permisos insuficientes' });
    next();
  };
}

// ========================================
// AUTH
// ========================================
router.post('/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role, name: user.name })).toString('base64');
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, name: user.name }, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// CONFIG
// ========================================
router.get('/config', (req, res) => {
  try { const db = getDB(); res.json(db.config || {}); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// FONDOS
// ========================================
router.get('/fondos', (req, res) => {
  try { const db = getDB(); res.json(db.fondos || { saldoActual: 0, proyectosBloqueados: [], historial: [] }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/fondos', requireAuth, (req, res) => {
  try {
    const db = getDB();
    if (req.body.saldoActual !== undefined) db.fondos.saldoActual = req.body.saldoActual;
    if (req.body.presupuestoAnual) db.fondos.presupuestoAnual = req.body.presupuestoAnual;
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/fondos/historial', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const m = { id: Date.now(), fecha: new Date().toISOString().split('T')[0], ...req.body, registradoPor: req.user.name };
    db.fondos.historial.push(m);
    db.fondos.saldoActual += (m.cantidad || 0);
    saveData(db);
    res.json({ success: true, movimiento: m });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/fondos/proyectos', requireAuth, requireRole('gestor'), (req, res) => {
  try {
    const db = getDB();
    const p = { id: Date.now(), ...req.body, fechaBloqueo: new Date().toISOString().split('T')[0], estado: 'bloqueado', creadoPor: req.user.name };
    if (!db.fondos.proyectosBloqueados) db.fondos.proyectosBloqueados = [];
    db.fondos.proyectosBloqueados.push(p);
    saveData(db);
    res.json({ success: true, proyecto: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/fondos/proyectos/:id/pagar', requireAuth, requireRole('gestor'), (req, res) => {
  try {
    const db = getDB();
    const id = parseInt(req.params.id);
    const p = (db.fondos.proyectosBloqueados || []).find(x => x.id === id);
    if (!p || p.estado !== 'bloqueado') return res.status(404).json({ error: 'No encontrado' });
    p.estado = 'pagado';
    p.fechaPago = new Date().toISOString().split('T')[0];
    db.fondos.saldoActual -= p.cantidad;
    db.fondos.historial.push({ id: Date.now(), fecha: new Date().toISOString().split('T')[0], concepto: 'Pago: ' + p.nombre, tipo: 'gasto', cantidad: p.cantidad, categoria: 'proyecto', registradoPor: req.user.name });
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/fondos/proyectos/:id', requireAuth, requireRole('gestor'), (req, res) => {
  try {
    const db = getDB();
    const id = parseInt(req.params.id);
    if (db.fondos.proyectosBloqueados) db.fondos.proyectosBloqueados = db.fondos.proyectosBloqueados.filter(p => p.id !== id);
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// MIEMBROS
// ========================================
router.get('/miembros', (req, res) => {
  try { const db = getDB(); res.json(db.miembros.sort((a, b) => a.id - b.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/miembros', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const m = { id: (db.miembros.length || 0) + 1, ...req.body, activo: true, fechaAlta: new Date().toISOString().split('T')[0] };
    db.miembros.push(m);
    saveData(db);
    res.json({ success: true, miembro: m });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// PAGOS
// ========================================
router.get('/pagos', (req, res) => {
  try { const db = getDB(); res.json(db.pagos.sort((a, b) => a.id - b.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/pagos', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const p = { id: (db.pagos.length || 0) + 1, ...req.body, fechaPago: new Date().toISOString().split('T')[0], registradoPor: req.user.name };
    db.pagos.push(p);
    saveData(db);
    res.json({ success: true, pago: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// SOLICITUDES
// ========================================
router.get('/solicitudes', (req, res) => {
  try { const db = getDB(); res.json(db.solicitudes.sort((a, b) => b.id - a.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/solicitudes', (req, res) => {
  try {
    const db = getDB();
    const s = { id: (db.solicitudes.length || 0) + 1, ...req.body, fechaSolicitud: new Date().toISOString().split('T')[0], estado: 'pendiente' };
    db.solicitudes.push(s);
    saveData(db);
    res.json({ success: true, solicitud: s });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/solicitudes/:id/aprobar', requireAuth, requireRole('gestor'), (req, res) => {
  try {
    const db = getDB();
    const s = db.solicitudes.find(s => s.id === parseInt(req.params.id));
    if (s) s.estado = 'aprobado';
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/solicitudes/:id/rechazar', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const s = db.solicitudes.find(s => s.id === parseInt(req.params.id));
    if (s) s.estado = 'rechazado';
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// TORNEOS
// ========================================
router.get('/torneos', (req, res) => {
  try { const db = getDB(); res.json(db.torneos.sort((a, b) => b.id - a.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/torneos', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const t = { id: (db.torneos.length || 0) + 1, ...req.body, estado: 'pendiente', aprobadoPor: null, solicitadoPor: req.user.name };
    db.torneos.push(t);
    saveData(db);
    res.json({ success: true, torneo: t });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/torneos/:id/aprobar', requireAuth, requireRole('gestor'), (req, res) => {
  try {
    const db = getDB();
    const t = db.torneos.find(t => t.id === parseInt(req.params.id));
    if (t) { t.estado = 'inscrito'; t.aprobadoPor = req.user.name; }
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/torneos/:id/rechazar', requireAuth, requireRole('gestor'), (req, res) => {
  try {
    const db = getDB();
    const t = db.torneos.find(t => t.id === parseInt(req.params.id));
    if (t) t.estado = 'rechazado';
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// PARTIDOS
// ========================================
router.get('/partidos', (req, res) => {
  try { const db = getDB(); res.json(db.partidos.sort((a, b) => b.fecha?.localeCompare(a.fecha) || 0)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/partidos', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const p = { id: (db.partidos.length || 0) + 1, ...req.body, creadoPor: req.user.name };
    db.partidos.push(p);
    saveData(db);
    res.json({ success: true, partido: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/partidos/:id', requireAuth, (req, res) => {
  try {
    const db = getDB();
    db.partidos = db.partidos.filter(p => p.id !== parseInt(req.params.id));
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// PATROCINIOS
// ========================================
router.get('/patrocinios', requireAuth, (req, res) => {
  try { const db = getDB(); res.json(db.patrocinios.sort((a, b) => b.id - a.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/patrocinios', (req, res) => {
  try {
    const db = getDB();
    const p = { id: (db.patrocinios.length || 0) + 1, ...req.body, fecha: new Date().toISOString().split('T')[0], estado: 'pendiente' };
    db.patrocinios.push(p);
    saveData(db);
    res.json({ success: true, patrocinio: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// NOTICIAS
// ========================================
router.get('/noticias', (req, res) => {
  try { const db = getDB(); res.json(db.noticias.sort((a, b) => b.fecha?.localeCompare(a.fecha) || 0)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/noticias', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const n = { id: (db.noticias.length || 0) + 1, ...req.body, fecha: new Date().toISOString().split('T')[0], creadoPor: req.user.name };
    db.noticias.push(n);
    saveData(db);
    res.json({ success: true, noticia: n });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/noticias/:id', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const idx = db.noticias.findIndex(n => n.id === parseInt(req.params.id));
    if (idx !== -1) Object.assign(db.noticias[idx], req.body);
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/noticias/:id', requireAuth, (req, res) => {
  try {
    const db = getDB();
    db.noticias = db.noticias.filter(n => n.id !== parseInt(req.params.id));
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// NOTIFICACIONES
// ========================================
router.get('/notificaciones', (req, res) => {
  try { const db = getDB(); res.json(db.notificaciones.sort((a, b) => b.fecha?.localeCompare(a.fecha) || 0)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/notificaciones', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const n = { id: (db.notificaciones.length || 0) + 1, ...req.body, leida: false };
    db.notificaciones.push(n);
    saveData(db);
    res.json({ success: true, notif: n });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/notificaciones/:id/leer', requireAuth, (req, res) => {
  try {
    const db = getDB();
    const n = db.notificaciones.find(n => n.id === parseInt(req.params.id));
    if (n) n.leida = true;
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/notificaciones/leer-todas', requireAuth, (req, res) => {
  try {
    const db = getDB();
    db.notificaciones.forEach(n => n.leida = true);
    saveData(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// DASHBOARD
// ========================================
router.get('/dashboard', (req, res) => {
  try {
    const db = getDB();
    const f = db.fondos;
    const ingresos = (f.historial || []).filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.cantidad, 0);
    const gastos = (f.historial || []).filter(m => m.tipo === 'gasto').reduce((s, m) => s + Math.abs(m.cantidad), 0);
    const bloqueado = (f.proyectosBloqueados || []).filter(p => p.estado === 'bloqueado').reduce((s, p) => s + p.cantidad, 0);
    const disponible = (f.saldoActual || 0) - bloqueado;
    res.json({
      saldoActual: f.saldoActual || 0, fondosBloqueados: bloqueado, fondosDisponibles: disponible,
      totalIngresos: ingresos, totalGastos: gastos,
      miembrosActivos: (db.miembros || []).filter(m => m.activo !== false).length,
      morosos: 0,
      torneosPendientes: (db.torneos || []).filter(t => t.estado === 'pendiente').length,
      gastoTorneos: (db.torneos || []).filter(t => t.estado === 'inscrito').reduce((sum, t) => sum + (t.jugadoresAsistentes?.length || 0) * (t.precioPorJugador || 0), 0),
      solicitudesPendientes: (db.solicitudes || []).filter(s => s.estado === 'pendiente').length,
      notificacionesNoLeidas: (db.notificaciones || []).filter(n => !n.leida).length,
      proyectosActivos: (f.proyectosBloqueados || []).filter(p => p.estado === 'bloqueado').length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
