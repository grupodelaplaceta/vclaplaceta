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

// ========================================
// PORTAL DEL JUGADOR (PlacetaID / PLID)
// ========================================

// Vinculación automática de miembros existentes con su DIP de PlacetaID.
// En producción el DIP se guarda al dar de alta al jugador en el CRM.
const DIP_POR_MIEMBRO = {
  'David Hernández': '11111111D',
  'Javier Robles': '22222222J',
  'Miguel Torres': '33333333M',
  'Sofía García': '44444444S',
  'Alejandra López': '55555555A',
  'Raúl Jiménez': '66666666R'
};

const PROYECTOS_DEFAULT = [
  { id: 1, nombre: 'Equipación temporada 2027', descripcion: 'Nueva equipación oficial del club.', objetivo: 1500, recaudado: 0, porcentajeGanancia: 10, activo: true },
  { id: 2, nombre: 'Material de entrenamiento', descripcion: 'Balones, redes y material de gimnasio.', objetivo: 1000, recaudado: 0, porcentajeGanancia: 8, activo: true },
  { id: 3, nombre: 'Transporte a torneos', descripcion: 'Autobuses y desplazamientos de la temporada.', objetivo: 1200, recaudado: 0, porcentajeGanancia: 5, activo: true }
];

function normDip(dip) { return String(dip || '').trim().toUpperCase(); }
function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

async function _configDoc() {
  if (await useMongo()) return (await coll('config').findOne({})) || {};
  return jd().config || (jd().config = {});
}
async function _fondosDoc() {
  if (await useMongo()) return (await coll('fondos').findOne({})) || {};
  return jd().fondos || (jd().fondos = {});
}
async function _saveFondos(f) {
  if (await useMongo()) await coll('fondos').replaceOne({}, f, { upsert: true });
  else { jd().fondos = f; saveData(); }
}
async function _miembrosArr() {
  if (await useMongo()) return await coll('miembros').find().toArray();
  return jd().miembros || [];
}
async function _saveMiembro(m) {
  if (await useMongo()) await coll('miembros').updateOne({ id: m.id }, { $set: m }, { upsert: true });
  else {
    const arr = jd().miembros || (jd().miembros = []);
    const i = arr.findIndex(x => x.id === m.id);
    if (i >= 0) arr[i] = m; else arr.push(m);
    saveData();
  }
}
async function _torneosArr() {
  if (await useMongo()) return await coll('torneos').find().toArray();
  return jd().torneos || [];
}
async function _saveTorneo(t) {
  if (await useMongo()) await coll('torneos').updateOne({ id: t.id }, { $set: t }, { upsert: true });
  else {
    const arr = jd().torneos || (jd().torneos = []);
    const i = arr.findIndex(x => x.id === t.id);
    if (i >= 0) arr[i] = t; else arr.push(t);
    saveData();
  }
}
async function _partidosArr() {
  if (await useMongo()) return await coll('partidos').find().toArray();
  return jd().partidos || [];
}
async function _pagosArr() {
  if (await useMongo()) return await coll('pagos').find().toArray();
  return jd().pagos || [];
}

async function ensureMiembroDips() {
  try {
    const miembros = await _miembrosArr();
    for (const m of miembros) {
      let changed = false;
      if (!m.dip && DIP_POR_MIEMBRO[m.nombre]) { m.dip = DIP_POR_MIEMBRO[m.nombre]; changed = true; }
      if (!m.cartera) { m.cartera = { saldo: 0, movimientos: [] }; changed = true; }
      if (!m.gastos) { m.gastos = []; changed = true; }
      if (changed) await _saveMiembro(m);
    }
  } catch (e) { console.error('ensureMiembroDips:', e.message); }
}

async function findMiembroByDip(dip) {
  const nd = normDip(dip);
  if (!nd) return null;
  if (await useMongo()) return await coll('miembros').findOne({ dip: nd });
  return (jd().miembros || []).find(m => normDip(m.dip) === nd) || null;
}

function estadoPago(mes, pagado) {
  if (pagado) return { estado: 'pagado', label: 'Pagado' };
  const hoy = new Date();
  const [y, m] = mes.split('-').map(Number);
  const finMargen = new Date(y, m - 1, 14);
  if (hoy > finMargen) return { estado: 'moroso', label: 'Moroso' };
  return { estado: 'pendiente', label: 'En plazo' };
}

async function buildJugadorData(miembro) {
  const pagos = (await _pagosArr()).filter(p => p.miembroId === miembro.id).sort((a, b) => a.mes.localeCompare(b.mes));
  const partidos = (await _partidosArr()).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const torneos = (await _torneosArr()).filter(t => (t.jugadoresAsistentes || []).includes(miembro.id));
  const fondos = await _fondosDoc();
  const proyectos = (fondos.proyectos && fondos.proyectos.length) ? fondos.proyectos : PROYECTOS_DEFAULT;
  const cartera = miembro.cartera || { saldo: 0, movimientos: [] };

  const cuotas = pagos.map(p => ({ id: p.id, mes: p.mes, importe: p.importe, pagado: p.pagado, fechaPago: p.fechaPago, ...estadoPago(p.mes, p.pagado) }));
  const totalCuotasPagadas = cuotas.filter(c => c.pagado).reduce((s, c) => s + Number(c.importe || 0), 0);
  const totalCuotasPendientes = cuotas.filter(c => !c.pagado).reduce((s, c) => s + Number(c.importe || 0), 0);

  const torneosConConfirmacion = torneos.map(t => ({
    id: t.id,
    nombre: t.nombre,
    fecha: t.fecha,
    precioPorJugador: t.precioPorJugador,
    estado: t.estado,
    confirmacion: (t.confirmaciones && t.confirmaciones[miembro.id]) || 'pendiente'
  }));

  const hoy = new Date().toISOString().split('T')[0];
  const proximosPartidos = partidos.filter(p => p.fecha >= hoy).reverse();
  const ultimosPartidos = partidos.filter(p => p.fecha < hoy);

  return {
    miembro: {
      id: miembro.id,
      nombre: miembro.nombre,
      dip: miembro.dip,
      posicion: miembro.posicion,
      email: miembro.email,
      telefono: miembro.telefono,
      fechaAlta: miembro.fechaAlta,
      activo: miembro.activo !== false,
      cuotaPersonalizada: miembro.cuotaPersonalizada ?? null,
      planId: miembro.planId
    },
    cartera: {
      saldo: round2(cartera.saldo || 0),
      movimientos: (cartera.movimientos || []).slice().sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
    },
    cuotas: {
      items: cuotas,
      totalPagadas: round2(totalCuotasPagadas),
      totalPendientes: round2(totalCuotasPendientes)
    },
    gastos: (miembro.gastos || []).slice().sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || ''))),
    calendario: { proximos: proximosPartidos, ultimos: ultimosPartidos },
    torneos: torneosConConfirmacion,
    proyectos: proyectos.filter(p => p.activo !== false),
    creditoCuotas: round2(miembro.creditoCuotas || 0),
    aportaciones: miembro.aportaciones || []
  };
}

function computeCierre(miembro, año) {
  const cartera = miembro.cartera || { saldo: 0, movimientos: [] };
  const sobrante = round2(cartera.saldo || 0);
  const ingresosAño = (cartera.movimientos || [])
    .filter(m => m.tipo === 'ingreso' && String(m.fecha || '').startsWith(String(año)))
    .reduce((s, m) => s + Number(m.cantidad || 0), 0);
  return {
    año,
    sobrante,
    ingresosAño: round2(ingresosAño),
    escenarios: {
      sinRenovar: { comisionPct: 30, comision: round2(sobrante * 0.30), neto: round2(sobrante * 0.70), destinoComision: 'Grupo de La Placeta (gestión)' },
      renovando: { comisionPct: 20, comision: round2(sobrante * 0.20), neto: round2(sobrante * 0.80), destinoComision: 'Grupo de La Placeta (gestión)' }
    }
  };
}

// GET /api/jugador/:dip — resumen completo del portal del jugador
router.get('/jugador/:dip', async (req, res) => {
  try {
    await ensureMiembroDips();
    const miembro = await findMiembroByDip(req.params.dip);
    if (!miembro) return res.status(404).json({ error: 'No se encontró un jugador con ese DIP. Contacta con el club para vincular tu PlacetaID.' });
    const data = await buildJugadorData(miembro);
    const config = await _configDoc();
    data.config = {
      clubName: config.clubName || 'Voley Club La Placeta',
      cuotaInscripcion: config.cuotaInscripcion || 35,
      cuotaMensual: config.cuotaMensual || 10
    };
    data.cierre = computeCierre(miembro, new Date().getFullYear());
    const mensualidad = miembro.cuotaPersonalizada ?? (config.cuotaMensual || 10);
    data.cierre.cuotasProximoAño = round2(Number(mensualidad) * 12);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/jugador/:dip/cartera — registrar un ingreso en la cartera del jugador
router.post('/jugador/:dip/cartera', async (req, res) => {
  try {
    await ensureMiembroDips();
    const miembro = await findMiembroByDip(req.params.dip);
    if (!miembro) return res.status(404).json({ error: 'Jugador no encontrado' });
    const cantidad = round2(Number(req.body.cantidad || 0));
    if (cantidad <= 0) return res.status(400).json({ error: 'Cantidad inválida' });
    const cartera = miembro.cartera || { saldo: 0, movimientos: [] };
    cartera.movimientos = cartera.movimientos || [];
    cartera.movimientos.push({
      id: cartera.movimientos.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      concepto: req.body.concepto || 'Ingreso en cartera',
      tipo: 'ingreso',
      cantidad
    });
    cartera.saldo = round2((cartera.saldo || 0) + cantidad);
    miembro.cartera = cartera;
    await _saveMiembro(miembro);
    res.json({ success: true, cartera });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/jugador/:dip/torneos/:id/confirmar — confirmar asistencia a torneo
router.post('/jugador/:dip/torneos/:id/confirmar', async (req, res) => {
  try {
    await ensureMiembroDips();
    const miembro = await findMiembroByDip(req.params.dip);
    if (!miembro) return res.status(404).json({ error: 'Jugador no encontrado' });
    const torneo = (await _torneosArr()).find(t => t.id === Number(req.params.id));
    if (!torneo) return res.status(404).json({ error: 'Torneo no encontrado' });
    const decision = ['confirmado', 'rechazado', 'pendiente'].includes(req.body.confirmacion) ? req.body.confirmacion : 'pendiente';
    torneo.confirmaciones = torneo.confirmaciones || {};
    torneo.confirmaciones[miembro.id] = decision;
    await _saveTorneo(torneo);
    res.json({ success: true, confirmacion: decision });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/jugador/:dip/cierre — aplicar reparto de cierre de año
router.post('/jugador/:dip/cierre', async (req, res) => {
  try {
    await ensureMiembroDips();
    const miembro = await findMiembroByDip(req.params.dip);
    if (!miembro) return res.status(404).json({ error: 'Jugador no encontrado' });

    const año = Number(req.body.año) || new Date().getFullYear();
    const renueva = !!req.body.renueva;
    const reparto = Array.isArray(req.body.reparto) ? req.body.reparto : [];

    const cartera = miembro.cartera || { saldo: 0, movimientos: [] };
    const sobrante = round2(cartera.saldo || 0);
    const comisionPct = renueva ? 20 : 30;
    const comision = round2(sobrante * comisionPct / 100);
    const neto = round2(sobrante - comision);
    const totalReparto = round2(reparto.reduce((s, r) => s + Number(r.cantidad || 0), 0));

    if (totalReparto > neto + 0.001) {
      return res.status(400).json({ error: `El reparto (${totalReparto.toFixed(2)}€) supera el neto disponible (${neto.toFixed(2)}€).` });
    }

    let creditoCuotas = 0;
    const aportaciones = [];
    const fondos = await _fondosDoc();
    const proyectos = (fondos.proyectos && fondos.proyectos.length) ? fondos.proyectos : PROYECTOS_DEFAULT;
    fondos.proyectos = proyectos;

    for (const r of reparto) {
      const cantidad = round2(Number(r.cantidad || 0));
      if (cantidad <= 0) continue;
      if (r.destino === 'cuotas') {
        creditoCuotas = round2(creditoCuotas + cantidad);
      } else if (r.destino === 'proyecto') {
        const p = proyectos.find(x => x.id === Number(r.proyectoId));
        if (p) {
          p.recaudado = round2((p.recaudado || 0) + cantidad);
          aportaciones.push({
            proyectoId: p.id,
            proyecto: p.nombre,
            cantidad,
            porcentajeGanancia: p.porcentajeGanancia || 0,
            fecha: new Date().toISOString().split('T')[0]
          });
        }
      }
    }
    await _saveFondos(fondos);

    cartera.movimientos = cartera.movimientos || [];
    cartera.movimientos.push({
      id: cartera.movimientos.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      concepto: `Cierre de año ${año}`,
      tipo: 'gasto',
      cantidad: sobrante
    });
    cartera.saldo = 0;
    miembro.cartera = cartera;
    miembro.creditoCuotas = round2((miembro.creditoCuotas || 0) + creditoCuotas);
    miembro.aportaciones = (miembro.aportaciones || []).concat(aportaciones);
    await _saveMiembro(miembro);

    const cierre = {
      id: Date.now(),
      dip: miembro.dip,
      año,
      fecha: new Date().toISOString().split('T')[0],
      renueva,
      sobrante,
      comisionPct,
      comision,
      destinoComision: 'Grupo de La Placeta (gestión)',
      neto,
      reparto,
      creditoCuotas,
      aportaciones
    };
    if (await useMongo()) await coll('cierres').insertOne(cierre);
    else { jd().cierres = jd().cierres || []; jd().cierres.push(cierre); saveData(); }

    res.json({ success: true, cierre });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// TORNEOS ORGANIZADOS POR GRUPO DE LA PLACETA
// ========================================

const DEFAULT_TORNEOS_ORGANIZADOS = [
  {
    id: 1,
    nombre: 'Torneo de Verano La Placeta',
    descripcion: 'Torneo de voleibol 4x4 mixto organizado por el Grupo de La Placeta. Una jornada de competición, música y convivencia. Incluye agua, fruta y avituallamiento para todos los equipos.',
    organizador: 'Grupo de La Placeta',
    fecha: '2026-09-12',
    fechaLimiteInscripcion: '2026-09-05',
    ubicacion: 'Pabellón Municipal La Placeta · Tarragona',
    modalidad: '4x4 Mixto',
    categoria: 'Absoluta',
    precioEquipo: 40,
    plazas: 12,
    premios: '🏆 Trofeo + 150€ campeón · 75€ subcampeón',
    estado: 'en_curso',
    equipos: [
      { id: 1, nombre: 'Placeta Voley', capitan: 'David Hernández', email: 'david@email.com', telefono: '612345678', jugadores: ['David Hernández', 'Sofía García', 'Alejandra López', 'Raúl Jiménez'], pagado: true, fechaInscripcion: '2026-07-20' },
      { id: 2, nombre: 'Smash Tarraco', capitan: 'Laura Pons', email: 'laura@smash.com', telefono: '600111222', jugadores: ['Laura Pons', 'Marc Vidal', 'Carla Roca', 'Nil Puig'], pagado: true, fechaInscripcion: '2026-07-22' },
      { id: 3, nombre: 'Costa Daurada VC', capitan: 'Jordi Serra', email: 'jordi@costadaurada.cat', telefono: '600333444', jugadores: ['Jordi Serra', 'Anna Martí', 'Pol Ferrer', 'Maria Roig'], pagado: true, fechaInscripcion: '2026-07-25' },
      { id: 4, nombre: 'Roca Volei', capitan: 'Eva Llorens', email: 'eva@rocavolei.cat', telefono: '600555666', jugadores: ['Eva Llorens', 'Joan Costa', 'Núria Pi', 'Alex Bosch'], pagado: true, fechaInscripcion: '2026-07-28' },
      { id: 5, nombre: 'Mediterrani B', capitan: 'Oriol Sabaté', email: 'oriol@mediterrani.cat', telefono: '600777888', jugadores: ['Oriol Sabaté', 'Berta Vidal', 'Sergi Pons', 'Júlia Roca'], pagado: false, fechaInscripcion: '2026-08-02' },
      { id: 6, nombre: 'Vóley Reus', capitan: 'Marta Solé', email: 'marta@voleyreus.cat', telefono: '600999000', jugadores: ['Marta Solé', 'Iker Font', 'Laia Vidal', 'Marc Serra'], pagado: true, fechaInscripcion: '2026-08-05' }
    ],
    resultados: [
      { id: 1, equipoA: 'Placeta Voley', equipoB: 'Smash Tarraco', setsA: 2, setsB: 0 },
      { id: 2, equipoA: 'Placeta Voley', equipoB: 'Costa Daurada VC', setsA: 2, setsB: 1 },
      { id: 3, equipoA: 'Smash Tarraco', equipoB: 'Roca Volei', setsA: 2, setsB: 1 },
      { id: 4, equipoA: 'Costa Daurada VC', equipoB: 'Mediterrani B', setsA: 2, setsB: 0 },
      { id: 5, equipoA: 'Roca Volei', equipoB: 'Vóley Reus', setsA: 2, setsB: 0 },
      { id: 6, equipoA: 'Placeta Voley', equipoB: 'Roca Volei', setsA: 2, setsB: 0 },
      { id: 7, equipoA: 'Smash Tarraco', equipoB: 'Mediterrani B', setsA: 2, setsB: 0 },
      { id: 8, equipoA: 'Costa Daurada VC', equipoB: 'Vóley Reus', setsA: 2, setsB: 0 }
    ]
  },
  {
    id: 2,
    nombre: 'Copa Primavera GDLP',
    descripcion: 'Competición de voleibol 6x6 femenino del Grupo de La Placeta. Sistema de liga con fase final y clasificación en directo. Ideal para clubes y equipos federados o amateurs.',
    organizador: 'Grupo de La Placeta',
    fecha: '2026-10-03',
    fechaLimiteInscripcion: '2026-09-26',
    ubicacion: 'Pabellón Municipal La Placeta · Tarragona',
    modalidad: '6x6 Femenino',
    categoria: 'Senior',
    precioEquipo: 60,
    plazas: 8,
    premios: '🏆 Trofeo + 200€ campeón · 100€ subcampeón',
    estado: 'abierto',
    equipos: [
      { id: 1, nombre: 'Placeta Fem', capitan: 'Sofía García', email: 'sofia@email.com', telefono: '645678901', jugadores: ['Sofía García', 'Alejandra López', 'Laia Vidal', 'Anna Martí', 'Júlia Roca', 'Maria Roig'], pagado: true, fechaInscripcion: '2026-08-10' },
      { id: 2, nombre: 'CV Tarraco', capitan: 'Clara Pons', email: 'clara@cvtarraco.cat', telefono: '601234567', jugadores: ['Clara Pons', 'Marta Solé', 'Berta Vidal', 'Núria Pi', 'Carla Roca', 'Eva Llorens'], pagado: true, fechaInscripcion: '2026-08-12' },
      { id: 3, nombre: 'Vóley Reus Femení', capitan: 'Aina Ferrer', email: 'aina@voleyreus.cat', telefono: '601987654', jugadores: ['Aina Ferrer', 'Laia Puig', 'Mireia Bosch', 'Paula Serra', 'Jana Roig', 'Clàudia Vidal'], pagado: false, fechaInscripcion: '2026-08-14' },
      { id: 4, nombre: 'Costa Daurada Fem', capitan: 'Núria Martí', email: 'nuria@costadaurada.cat', telefono: '601555000', jugadores: ['Núria Martí', 'Anna Pons', 'Berta Serra', 'Maria Font', 'Sara Pi', 'Iris Roca'], pagado: true, fechaInscripcion: '2026-08-15' }
    ],
    resultados: []
  }
];

async function _torneosOrgArr() {
  if (await useMongo()) return await coll('torneosOrganizados').find().toArray();
  return jd().torneosOrganizados || [];
}
async function _saveTorneoOrg(t) {
  if (await useMongo()) await coll('torneosOrganizados').updateOne({ id: t.id }, { $set: t }, { upsert: true });
  else {
    const arr = jd().torneosOrganizados || (jd().torneosOrganizados = []);
    const i = arr.findIndex(x => x.id === t.id);
    if (i >= 0) arr[i] = t; else arr.push(t);
    saveData();
  }
}
async function ensureTorneosOrganizados() {
  if (await useMongo()) {
    try {
      const cnt = await coll('torneosOrganizados').countDocuments();
      if (cnt === 0) await coll('torneosOrganizados').insertMany(DEFAULT_TORNEOS_ORGANIZADOS);
    } catch (e) { console.error('ensureTorneosOrganizados:', e.message); }
    return;
  }
  if (!jd().torneosOrganizados || jd().torneosOrganizados.length === 0) {
    jd().torneosOrganizados = JSON.parse(JSON.stringify(DEFAULT_TORNEOS_ORGANIZADOS));
    saveData();
  }
}

// Puntos según reglamento de voleibol (sirve para best-of-3 y best-of-5)
function puntosVoleibol(sw, sl) {
  const maxSet = Math.max(sw, sl);
  if (sw > sl) return maxSet === 2 ? (sl === 0 ? 3 : 2) : (sl <= 1 ? 3 : 2);
  return maxSet === 2 ? (sw === 1 ? 1 : 0) : (sw === 2 ? 1 : 0);
}

function computeClasificacion(equipos, resultados) {
  const map = {};
  (equipos || []).forEach(e => { map[e.nombre] = { equipo: e.nombre, PJ: 0, PG: 0, PP: 0, SF: 0, SC: 0, PTS: 0 }; });
  (resultados || []).forEach(r => {
    const a = map[r.equipoA], b = map[r.equipoB];
    if (!a || !b) return;
    const sa = Number(r.setsA || 0), sb = Number(r.setsB || 0);
    a.PJ++; b.PJ++;
    a.SF += sa; a.SC += sb;
    b.SF += sb; b.SC += sa;
    if (sa > sb) { a.PG++; b.PP++; a.PTS += puntosVoleibol(sa, sb); b.PTS += puntosVoleibol(sb, sa); }
    else { b.PG++; a.PP++; b.PTS += puntosVoleibol(sb, sa); a.PTS += puntosVoleibol(sa, sb); }
  });
  return Object.values(map).sort((x, y) => {
    if (y.PTS !== x.PTS) return y.PTS - x.PTS;
    const rx = x.SC > 0 ? x.SF / x.SC : x.SF;
    const ry = y.SC > 0 ? y.SF / y.SC : y.SF;
    if (ry !== rx) return ry - rx;
    return y.SF - x.SF;
  });
}

function torneoOrgPublico(t) {
  return {
    id: t.id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    organizador: t.organizador || 'Grupo de La Placeta',
    fecha: t.fecha,
    fechaLimiteInscripcion: t.fechaLimiteInscripcion,
    ubicacion: t.ubicacion,
    modalidad: t.modalidad,
    categoria: t.categoria,
    precioEquipo: t.precioEquipo,
    plazas: t.plazas,
    premios: t.premios,
    estado: t.estado,
    equipos: (t.equipos || []).map(e => ({ id: e.id, nombre: e.nombre, capitan: e.capitan, jugadores: e.jugadores, pagado: !!e.pagado, fechaInscripcion: e.fechaInscripcion })),
    clasificacion: computeClasificacion(t.equipos, t.resultados),
    plazasLibres: Math.max(0, (t.plazas || 0) - (t.equipos || []).length)
  };
}

// GET /api/torneos-organizados — listado de torneos organizados por GDLP
router.get('/torneos-organizados', async (req, res) => {
  try {
    await ensureTorneosOrganizados();
    const arr = (await _torneosOrgArr()).slice().sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
    res.json(arr.map(torneoOrgPublico));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/torneos-organizados/:id — detalle de un torneo
router.get('/torneos-organizados/:id', async (req, res) => {
  try {
    await ensureTorneosOrganizados();
    const t = (await _torneosOrgArr()).find(x => x.id === Number(req.params.id));
    if (!t) return res.status(404).json({ error: 'Torneo no encontrado' });
    res.json(torneoOrgPublico(t));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/torneos-organizados/:id/inscribir — inscripción de un equipo
router.post('/torneos-organizados/:id/inscribir', async (req, res) => {
  try {
    await ensureTorneosOrganizados();
    const t = (await _torneosOrgArr()).find(x => x.id === Number(req.params.id));
    if (!t) return res.status(404).json({ error: 'Torneo no encontrado' });
    if (t.estado === 'finalizado' || t.estado === 'cerrado') return res.status(400).json({ error: 'El periodo de inscripción está cerrado' });

    const { nombre, capitan, email, telefono, jugadores } = req.body;
    if (!nombre || !capitan) return res.status(400).json({ error: 'El nombre del equipo y el capitán son obligatorios' });
    if ((t.equipos || []).length >= (t.plazas || 0)) return res.status(400).json({ error: 'No quedan plazas libres en este torneo' });

    const equipo = {
      id: (t.equipos || []).length + 1,
      nombre: String(nombre).trim(),
      capitan: String(capitan).trim(),
      email: String(email || '').trim(),
      telefono: String(telefono || '').trim(),
      jugadores: Array.isArray(jugadores) ? jugadores.map(j => String(j).trim()).filter(Boolean) : [],
      pagado: false,
      fechaInscripcion: new Date().toISOString().split('T')[0]
    };
    t.equipos = t.equipos || [];
    t.equipos.push(equipo);
    await _saveTorneoOrg(t);
    res.json({ success: true, equipo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/torneos-organizados/:id/resultado — registrar resultado (CRM/RSP)
router.post('/torneos-organizados/:id/resultado', requireVoleyAdmin, async (req, res) => {
  try {
    await ensureTorneosOrganizados();
    const t = (await _torneosOrgArr()).find(x => x.id === Number(req.params.id));
    if (!t) return res.status(404).json({ error: 'Torneo no encontrado' });
    const { equipoA, equipoB, setsA, setsB } = req.body;
    if (!equipoA || !equipoB || setsA == null || setsB == null) return res.status(400).json({ error: 'Datos de resultado incompletos' });
    t.resultados = t.resultados || [];
    t.resultados.push({ id: t.resultados.length + 1, equipoA, equipoB, setsA: Number(setsA), setsB: Number(setsB) });
    await _saveTorneoOrg(t);
    res.json({ success: true, clasificacion: computeClasificacion(t.equipos, t.resultados) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================================
// ADMIN VÍA RSP (escrituras con clave compartida)
// ========================================

const VOLEY_ADMIN_KEY = process.env.VOLEY_ADMIN_KEY || 'voley-admin-2026';

function requireVoleyAdmin(req, res, next) {
  const key = req.headers['x-voley-key'] || req.headers['x-api-key'];
  if (key && key === VOLEY_ADMIN_KEY) { req.user = { role: 'gestor', name: 'RSP' }; return next(); }
  return requireAuth(req, res, next);
}

async function _nextId(arr) {
  return (arr || []).reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
}

// POST /api/miembros — crear o actualizar jugador desde RSP
router.post('/miembros', requireVoleyAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    let miembro;
    if (b.id) {
      miembro = (await _miembrosArr()).find(m => m.id === Number(b.id));
      if (!miembro) return res.status(404).json({ error: 'Jugador no encontrado' });
    } else {
      miembro = { id: await _nextId(await _miembrosArr()), fechaAlta: new Date().toISOString().split('T')[0], activo: true };
    }
    ['nombre', 'dip', 'email', 'telefono', 'posicion', 'planId'].forEach(k => { if (b[k] !== undefined) miembro[k] = b[k]; });
    if (b.cuotaPersonalizada !== undefined) miembro.cuotaPersonalizada = b.cuotaPersonalizada === '' ? null : Number(b.cuotaPersonalizada);
    if (b.activo !== undefined) miembro.activo = !!b.activo;
    if (b.esSuplente !== undefined) miembro.esSuplente = !!b.esSuplente;
    if (b.cartera && typeof b.cartera.saldo === 'number') { miembro.cartera = miembro.cartera || { saldo: 0, movimientos: [] }; miembro.cartera.saldo = b.cartera.saldo; }
    if (miembro.dip) miembro.dip = normDip(miembro.dip);
    if (!miembro.nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    await _saveMiembro(miembro);
    res.json({ success: true, miembro });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/torneos-organizados — crear torneo desde RSP
router.post('/torneos-organizados', requireVoleyAdmin, async (req, res) => {
  try {
    await ensureTorneosOrganizados();
    const b = req.body || {};
    if (!b.nombre) return res.status(400).json({ error: 'El nombre del torneo es obligatorio' });
    const t = {
      id: await _nextId(await _torneosOrgArr()),
      nombre: String(b.nombre).trim(),
      descripcion: String(b.descripcion || ''),
      organizador: 'Grupo de La Placeta',
      fecha: String(b.fecha || ''),
      fechaLimiteInscripcion: String(b.fechaLimiteInscripcion || ''),
      ubicacion: String(b.ubicacion || ''),
      modalidad: String(b.modalidad || ''),
      categoria: String(b.categoria || ''),
      precioEquipo: Number(b.precioEquipo) || 0,
      plazas: Number(b.plazas) || 0,
      premios: String(b.premios || ''),
      estado: String(b.estado || 'abierto'),
      equipos: [],
      resultados: []
    };
    await _saveTorneoOrg(t);
    res.json({ success: true, torneo: torneoOrgPublico(t) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/fondos/movimiento — registrar movimiento de fondos desde RSP
router.post('/fondos/movimiento', requireVoleyAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const cantidad = Number(b.cantidad) || 0;
    if (!cantidad) return res.status(400).json({ error: 'Cantidad inválida' });
    const f = await _fondosDoc();
    f.historial = f.historial || [];
    const mov = {
      id: f.historial.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      concepto: String(b.concepto || 'Movimiento'),
      tipo: cantidad >= 0 ? 'ingreso' : 'gasto',
      cantidad: Math.abs(cantidad),
      categoria: String(b.categoria || 'otros'),
      registradoPor: 'RSP'
    };
    f.historial.push(mov);
    f.saldoActual = Number(f.saldoActual || 0) + cantidad;
    await _saveFondos(f);
    res.json({ success: true, movimiento: mov, saldoActual: f.saldoActual });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
