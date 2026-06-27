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
    let f, miembros, torneos, notifs;
    if (await useMongo()) {
      f = await coll('fondos').findOne({}) || {}; miembros = await coll('miembros').find({ activo: true }).toArray();
      torneos = await coll('torneos').find().toArray(); notifs = await coll('notificaciones').find({ leida: false }).toArray();
    } else {
      const d = jd(); f = d.fondos || {}; miembros = (d.miembros || []).filter(m => m.activo !== false);
      torneos = d.torneos || []; notifs = (d.notificaciones || []).filter(n => !n.leida);
    }
    const b = (f.proyectosBloqueados || []).filter(p => p.estado === 'bloqueado').reduce((s, p) => s + p.cantidad, 0);
    res.json({ saldoActual: f.saldoActual || 0, fondosBloqueados: b, fondosDisponibles: (f.saldoActual || 0) - b, miembrosActivos: miembros.length, torneosPendientes: torneos.filter(t => t.estado === 'pendiente').length, notificacionesNoLeidas: notifs.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
