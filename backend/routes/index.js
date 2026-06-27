const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { getDB, saveData } = require('../db');

let mongoDb = null, jsonFallback = null;

async function useMongo() {
  if (!mongoDb) {
    const r = getDB();
    if (r.isMongo) mongoDb = r.db;
    else jsonFallback = r.json;
  }
  return !!mongoDb;
}
function coll(n) { return mongoDb ? mongoDb.collection(n) : null; }
function jd() { return jsonFallback || getDB().json; }

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

async function getDoc(c, sort = {}) {
  if (await useMongo()) return await coll(c).find().sort(sort).toArray();
  return jd()[c] || [];
}
async function addDoc(c, doc) {
  if (await useMongo()) {
    const cnt = await coll(c).countDocuments();
    doc.id = cnt + 1; await coll(c).insertOne(doc);
  } else {
    const arr = jd()[c] || []; doc.id = arr.length + 1; arr.push(doc); jd()[c] = arr; saveData();
  }
  return doc;
}

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user, valid = false;
    if (await useMongo()) {
      user = await coll('users').findOne({ username });
      if (user) valid = bcrypt.compareSync(password, user.password);
    } else {
      user = jd().users.find(u => u.username === username);
      if (user) valid = user.password === password; // JSON fallback plaintext
    }
    if (!user || !valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role, name: user.name })).toString('base64');
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, name: user.name }, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/config', async (req, res) => {
  try { if (await useMongo()) return res.json(await coll('config').findOne({}) || {}); res.json(jd().config || {}); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/fondos', async (req, res) => {
  try { if (await useMongo()) return res.json(await coll('fondos').findOne({}) || {}); res.json(jd().fondos || {}); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/miembros', async (req, res) => { try { res.json(await getDoc('miembros', { id: 1 })); } catch (err) { res.status(500).json({ error: err.message }); } });
router.get('/solicitudes', async (req, res) => { try { res.json(await getDoc('solicitudes', { id: -1 })); } catch (err) { res.status(500).json({ error: err.message }); } });
router.post('/solicitudes', async (req, res) => { try { const s = await addDoc('solicitudes', { ...req.body, fechaSolicitud: new Date().toISOString().split('T')[0], estado: 'pendiente' }); res.json({ success: true, solicitud: s }); } catch (err) { res.status(500).json({ error: err.message }); } });
router.get('/torneos', async (req, res) => { try { res.json(await getDoc('torneos', { id: -1 })); } catch (err) { res.status(500).json({ error: err.message }); } });
router.get('/partidos', async (req, res) => { try { res.json(await getDoc('partidos', { fecha: -1 })); } catch (err) { res.status(500).json({ error: err.message }); } });
router.post('/partidos', requireAuth, async (req, res) => { try { const p = await addDoc('partidos', { ...req.body, creadoPor: req.user.name }); res.json({ success: true, partido: p }); } catch (err) { res.status(500).json({ error: err.message }); } });
router.get('/noticias', async (req, res) => { try { res.json(await getDoc('noticias', { fecha: -1 })); } catch (err) { res.status(500).json({ error: err.message }); } });
router.post('/noticias', requireAuth, async (req, res) => { try { const n = await addDoc('noticias', { ...req.body, fecha: new Date().toISOString().split('T')[0], creadoPor: req.user.name }); res.json({ success: true, noticia: n }); } catch (err) { res.status(500).json({ error: err.message }); } });
router.delete('/noticias/:id', requireAuth, async (req, res) => {
  try { const id = parseInt(req.params.id); if (await useMongo()) await coll('noticias').deleteOne({ id }); else { jd().noticias = jd().noticias.filter(n => n.id !== id); saveData(); } res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/partidos/:id', requireAuth, async (req, res) => {
  try { const id = parseInt(req.params.id); if (await useMongo()) await coll('partidos').deleteOne({ id }); else { jd().partidos = jd().partidos.filter(p => p.id !== id); saveData(); } res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/patrocinios', async (req, res) => { try { const p = await addDoc('patrocinios', { ...req.body, fecha: new Date().toISOString().split('T')[0], estado: 'pendiente' }); res.json({ success: true, patrocinio: p }); } catch (err) { res.status(500).json({ error: err.message }); } });

router.get('/dashboard', async (req, res) => {
  try {
    let f, miembros, torneos, notifs, solicitudes, pagos;
    if (await useMongo()) {
      f = await coll('fondos').findOne({}) || {};
      miembros = await coll('miembros').find().toArray();
      torneos = await coll('torneos').find().toArray();
      notifs = await coll('notificaciones').find().toArray();
      solicitudes = await coll('solicitudes').find({ estado: 'pendiente' }).toArray();
      pagos = await coll('pagos').find().toArray();
    } else {
      const d = jd(); f = d.fondos || {}; miembros = d.miembros || [];
      torneos = d.torneos || []; notifs = d.notificaciones || [];
      solicitudes = (d.solicitudes || []).filter(s => s.estado === 'pendiente');
      pagos = d.pagos || [];
    }
    const ingresos = (f.historial || []).filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.cantidad, 0);
    const gastos = (f.historial || []).filter(m => m.tipo === 'gasto').reduce((s, m) => s + Math.abs(m.cantidad), 0);
    const bloqueado = (f.proyectosBloqueados || []).filter(p => p.estado === 'bloqueado').reduce((s, p) => s + p.cantidad, 0);
    const disponible = (f.saldoActual || 0) - bloqueado;
    const activos = miembros.filter(m => m.activo !== false).length;
    const morosos = miembros.filter(m => { const mp = pagos.filter(p => p.miembroId === m.id); return mp.length > 0 && !mp[mp.length-1].pagado; }).length;
    res.json({
      saldoActual: f.saldoActual || 0, fondosBloqueados: bloqueado, fondosDisponibles: disponible,
      totalIngresos: ingresos, totalGastos: gastos, miembrosActivos: activos, morosos,
      torneosPendientes: torneos.filter(t => t.estado === 'pendiente').length,
      gastoTorneos: torneos.filter(t => t.estado === 'inscrito').reduce((sum, t) => sum + (t.jugadoresAsistentes?.length || 0) * (t.precioPorJugador || 0), 0),
      solicitudesPendientes: solicitudes.length,
      notificacionesNoLeidas: notifs.filter(n => !n.leida).length,
      proyectosActivos: (f.proyectosBloqueados || []).filter(p => p.estado === 'bloqueado').length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// CRM FULL STATE
// ========================================
router.get('/crm-data', async (req, res) => {
  try {
    let data = {};
    if (await useMongo()) {
      const cols = await coll('config').stats().catch(()=>{}); // check if collection exists
      const safeFind = async (name) => { try { return await coll(name).find().toArray(); } catch(e) { return []; } };
      const safeFindOne = async (name) => { try { return await coll(name).findOne({}); } catch(e) { return null; } };
      data.config = await safeFindOne('config') || {};
      data.users = await safeFind('users') || [];
      data.fondos = await safeFindOne('fondos') || { saldoActual: 0, proyectosBloqueados: [], historial: [] };
      data.miembros = await safeFind('miembros') || [];
      data.pagos = await safeFind('pagos') || [];
      data.solicitudes = await safeFind('solicitudes') || [];
      const torneosArr = await safeFind('torneos') || [];
      data.torneos = { inscripciones: torneosArr };
      data.partidos = await safeFind('partidos') || [];
      data.noticias = await safeFind('noticias') || [];
      data.notificaciones = await safeFind('notificaciones') || [];
      data.revisiones = await safeFind('revisiones') || [];
      data.cuotas = {
        inscripcion: data.config?.cuotaInscripcion || 35,
        mensualidadOrdinaria: data.config?.cuotaMensual || 10,
        convocatoriaAbierta: data.config?.convocatoriaAbierta !== false,
        modalidades: data.config?.modalidades || [{ id: 'mensual', nombre: 'Mensual', meses: 1, factor: 1.0, descripcion: 'Pago cada mes' }],
        miembros: data.miembros, pagos: data.pagos,
        solicitudesPendientes: data.solicitudes.filter(s => s.estado === 'pendiente')
      };
    } else {
      data = jd();
    }
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/crm-data', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    if (await useMongo()) {
      if (data.fondos) await coll('fondos').replaceOne({}, data.fondos, { upsert: true });
      if (data.miembros) { await coll('miembros').deleteMany({}); if (data.miembros.length) await coll('miembros').insertMany(data.miembros); }
      if (data.pagos) { await coll('pagos').deleteMany({}); if (data.pagos.length) await coll('pagos').insertMany(data.pagos); }
      if (data.solicitudes) { await coll('solicitudes').deleteMany({}); if (data.solicitudes.length) await coll('solicitudes').insertMany(data.solicitudes); }
      if (data.torneos?.inscripciones) { await coll('torneos').deleteMany({}); if (data.torneos.inscripciones.length) await coll('torneos').insertMany(data.torneos.inscripciones); }
      if (data.partidos) { await coll('partidos').deleteMany({}); if (data.partidos.length) await coll('partidos').insertMany(data.partidos); }
      if (data.noticias) { await coll('noticias').deleteMany({}); if (data.noticias.length) await coll('noticias').insertMany(data.noticias); }
      if (data.notificaciones) { await coll('notificaciones').deleteMany({}); if (data.notificaciones.length) await coll('notificaciones').insertMany(data.notificaciones); }
      if (data.revisiones) { await coll('revisiones').deleteMany({}); if (data.revisiones.length) await coll('revisiones').insertMany(data.revisiones); }
      if (data.cuotas) {
        await coll('config').updateOne({}, { $set: { cuotaInscripcion: data.cuotas.inscripcion, cuotaMensual: data.cuotas.mensualidadOrdinaria, convocatoriaAbierta: data.cuotas.convocatoriaAbierta !== false, modalidades: data.cuotas.modalidades } }, { upsert: true });
      }
    } else {
      Object.assign(jd(), data); saveData();
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
