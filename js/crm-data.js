/**
 * ========================================
 * CRM - VOLEY CLUB LA PLACETA
 * Sistema de Gestión de Fondos, Cuotas, Torneos, Partidos y Noticias
 * ========================================
 * Roles:
 *   - GESTOR: Junta del Grupo de La Placeta (aprueba, ve todo)
 *   - RESPONSABLE: Admin del club (solicita, gestiona día a día)
 * 
 * CUOTAS (aprobado por Grupo de La Placeta):
 *   - 1er mes (inscripción): 35€ (incluye camiseta + seguro anual)
 *   - 2º mes en adelante: 10€ (para extras y torneos)
 *   - Pago: 1ra semana del mes (días 1-7)
 *   - Semana de margen: días 8-14
 *   - Si hay torneo en semana de margen → debe pagar antes del torneo
 *   - Pasado el día 14 → moroso
 * 
 * COMUNICACIÓN WEB <-> CRM:
 *   - Los formularios web (inscripción, patrocinio) se guardan aquí
 *   - Los torneos y partidos se gestionan desde CRM y se renderizan en web
 *   - Las noticias se gestionan desde CRM y se muestran en web
 * ======================================== 
 */

// ========================================
// 1. INICIALIZAR DATOS POR DEFECTO
// ========================================

const CRM_DEFAULT = {
  config: {
    clubName: 'Voley Club La Placeta',
    gestorName: 'Junta del Grupo de La Placeta',
    responsableName: 'Responsable del Club'
  },
  users: [
    { id: 1, username: 'gestor', password: 'gestor2026', role: 'gestor', name: 'Junta La Placeta' },
    { id: 2, username: 'admin', password: 'admin2026', role: 'responsable', name: 'Responsable Club' }
  ],
  // FONDOS - Dinero disponible (presupuesto vivo = cuotas íntegramente)
  fondos: {
    saldoActual: 12500.00,
    presupuestoAnual: {
      año: 2026,
      ingresosPrevistos: 30000,
      gastosPrevistos: 28000,
      categorias: [
        { id: 1, nombre: 'Cuotas', presupuesto: 18000, gastado: 11700 },
        { id: 2, nombre: 'Torneos', presupuesto: 8000, gastado: 3700 },
        { id: 3, nombre: 'Material', presupuesto: 3000, gastado: 800 },
        { id: 4, nombre: 'Transporte', presupuesto: 2500, gastado: 1200 },
        { id: 5, nombre: 'Aportaciones', presupuesto: 5000, gastado: 15000 },
        { id: 6, nombre: 'Otros', presupuesto: 1500, gastado: 0 }
      ]
    },
    proyectosBloqueados: [],
    historial: [
      { id: 1, fecha: '2026-01-15', concepto: 'Aportación inicial Junta', tipo: 'ingreso', cantidad: 15000, categoria: 'aportacion', registradoPor: 'gestor' }
    ]
  },
  // CUOTAS - Sistema simplificado
  cuotas: {
    inscripcion: 35,
    mensualidadOrdinaria: 10,
    convocatoriaAbierta: true,
    modalidades: [
      { id: 'mensual', nombre: 'Mensual', meses: 1, factor: 1.0, descripcion: 'Pago cada mes' }
    ],
    pagos: [],
    miembros: [
      { id: 1, nombre: 'David Hernández', email: 'david@email.com', telefono: '612345678', posicion: 'Líbero', modalidadId: 'mensual', cuotaPersonalizada: null, fechaAlta: '2026-01-01', activo: true },
      { id: 2, nombre: 'Javier Robles', email: 'javier@email.com', telefono: '623456789', posicion: 'Colocador', modalidadId: 'mensual', cuotaPersonalizada: null, fechaAlta: '2026-01-01', activo: true },
      { id: 3, nombre: 'Miguel Torres', email: 'miguel@email.com', telefono: '634567890', posicion: 'Central', modalidadId: 'mensual', cuotaPersonalizada: null, fechaAlta: '2026-01-15', activo: true },
      { id: 4, nombre: 'Sofía García', email: 'sofia@email.com', telefono: '645678901', posicion: 'Colocadora', modalidadId: 'mensual', cuotaPersonalizada: null, fechaAlta: '2026-01-01', activo: true },
      { id: 5, nombre: 'Alejandra López', email: 'alejandra@email.com', telefono: '656789012', posicion: 'Central', modalidadId: 'mensual', cuotaPersonalizada: null, fechaAlta: '2026-02-01', activo: true },
      { id: 6, nombre: 'Raúl Jiménez', email: 'raul@email.com', telefono: '667890123', posicion: 'Receptor', modalidadId: 'mensual', cuotaPersonalizada: null, fechaAlta: '2026-02-15', activo: true }
    ],
    solicitudesPendientes: []
  },
  // TORNEOS - Inscripciones
  torneos: {
    inscripciones: []
  },
  // PARTIDOS
  partidos: [],
  // PATROCINIOS
  patrocinios: [],
  // NOTICIAS
  noticias: [],
  // REVISIONES
  revisiones: [],
  // NOTIFICACIONES
  notificaciones: []
};

// ========================================
// 2. GESTIÓN DE DATOS (localStorage)
// ========================================

const CRM_STORAGE_KEY = 'vcpl_crm_data';

function initCRM() {
  const stored = localStorage.getItem(CRM_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(CRM_DEFAULT));
    return JSON.parse(JSON.stringify(CRM_DEFAULT));
  }
  
  const data = JSON.parse(stored);
  
  // Migración: asegurar campos nuevos
  if (data.cuotas.convocatoriaAbierta === undefined) data.cuotas.convocatoriaAbierta = true;
  if (!data.cuotas.modalidades) data.cuotas.modalidades = JSON.parse(JSON.stringify(CRM_DEFAULT.cuotas.modalidades));
  if (!data.fondos.presupuestoAnual) data.fondos.presupuestoAnual = JSON.parse(JSON.stringify(CRM_DEFAULT.fondos.presupuestoAnual));
  // Migrar miembros
  data.cuotas.miembros.forEach(m => {
    if (!m.modalidadId) m.modalidadId = 'mensual';
    if (m.cuotaPersonalizada === undefined) m.cuotaPersonalizada = null;
  });
  
  return data;
}

function getCRM() {
  let data = JSON.parse(localStorage.getItem(CRM_STORAGE_KEY) || 'null') || initCRM();
  
  // Migración
  if (data.cuotas.convocatoriaAbierta === undefined) data.cuotas.convocatoriaAbierta = true;
  if (!data.cuotas.modalidades) data.cuotas.modalidades = JSON.parse(JSON.stringify(CRM_DEFAULT.cuotas.modalidades));
  if (!data.fondos.presupuestoAnual) data.fondos.presupuestoAnual = JSON.parse(JSON.stringify(CRM_DEFAULT.fondos.presupuestoAnual));
  // Migrar miembros
  data.cuotas.miembros.forEach(m => {
    if (!m.modalidadId) m.modalidadId = 'mensual';
    if (m.cuotaPersonalizada === undefined) m.cuotaPersonalizada = null;
  });
  
  return data;
}

function saveCRM(data) {
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(data));
}

// ========================================
// 3. AUTENTICACIÓN
// ========================================

let currentUser = null;

function login(username, password) {
  const data = getCRM();
  const user = data.users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = { ...user };
    sessionStorage.setItem('vcpl_user', JSON.stringify(currentUser));
    return { success: true, user: currentUser };
  }
  return { success: false, error: 'Credenciales incorrectas' };
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('vcpl_user');
  if (window.API) API.clearAuthToken();
  window.location.href = 'login.html';
}

function getCurrentUser() {
  if (currentUser) return currentUser;
  const stored = sessionStorage.getItem('vcpl_user');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
}

function requireAuth(role = null) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  if (role && user.role !== role) {
    alert('No tienes permisos para acceder a esta sección.');
    window.location.href = 'admin-dashboard.html';
    return false;
  }
  return true;
}

// ========================================
// 4. GESTIÓN DE FONDOS
// ========================================

function getSaldoActual() {
  const data = getCRM();
  return data.fondos.saldoActual;
}

function getFondosBloqueados() {
  const data = getCRM();
  return data.fondos.proyectosBloqueados
    .filter(p => p.estado === 'bloqueado')
    .reduce((sum, p) => sum + p.cantidad, 0);
}

function getFondosDisponibles() {
  return getSaldoActual() - getFondosBloqueados();
}

function getGastoTorneos() {
  const data = getCRM();
  return data.torneos.inscripciones
    .filter(t => t.estado === 'inscrito')
    .reduce((sum, t) => sum + (t.jugadoresAsistentes.length * t.precioPorJugador), 0);
}

function getCosteTorneo(torneo) {
  return torneo.jugadoresAsistentes.length * torneo.precioPorJugador;
}

function getPresupuestoDisponible() {
  return getFondosDisponibles();
}

// ========================================
// 4b. PROYECTOS BLOQUEADOS (GESTOR)
// ========================================

function addProyectoBloqueado(nombre, cantidad, creadoPor) {
  if (cantidad > getFondosDisponibles() + getFondosBloqueados()) {
    return { success: false, error: 'No hay suficiente saldo para bloquear ese importe' };
  }
  const data = getCRM();
  const nuevo = {
    id: data.fondos.proyectosBloqueados.length + 1,
    nombre,
    cantidad,
    fechaBloqueo: new Date().toISOString().split('T')[0],
    estado: 'bloqueado',
    creadoPor
  };
  data.fondos.proyectosBloqueados.push(nuevo);
  saveCRM(data);
  return { success: true, proyecto: nuevo };
}

function pagarProyecto(proyectoId) {
  const data = getCRM();
  const proyecto = data.fondos.proyectosBloqueados.find(p => p.id === proyectoId);
  if (!proyecto || proyecto.estado !== 'bloqueado') return false;
  
  proyecto.estado = 'pagado';
  proyecto.fechaPago = new Date().toISOString().split('T')[0];
  
  // Restar del saldo
  data.fondos.saldoActual -= proyecto.cantidad;
  
  // Registrar en historial
  data.fondos.historial.push({
    id: data.fondos.historial.length + 1,
    fecha: proyecto.fechaPago,
    concepto: `Pago proyecto: ${proyecto.nombre}`,
    tipo: 'gasto',
    cantidad: proyecto.cantidad,
    categoria: 'proyecto',
    registradoPor: 'gestor'
  });
  
  saveCRM(data);
  return true;
}

function eliminarBloqueo(proyectoId) {
  const data = getCRM();
  const idx = data.fondos.proyectosBloqueados.findIndex(p => p.id === proyectoId);
  if (idx === -1) return false;
  data.fondos.proyectosBloqueados.splice(idx, 1);
  saveCRM(data);
  return true;
}

function addMovimiento(concepto, cantidad, categoria, registradoPor) {
  const data = getCRM();
  const nuevo = {
    id: data.fondos.historial.length + 1,
    fecha: new Date().toISOString().split('T')[0],
    concepto,
    tipo: cantidad >= 0 ? 'ingreso' : 'gasto',
    cantidad: Math.abs(cantidad),
    categoria,
    registradoPor
  };
  data.fondos.historial.push(nuevo);
  data.fondos.saldoActual += cantidad;
  saveCRM(data);
  return nuevo;
}

function getHistorial() {
  const data = getCRM();
  return data.fondos.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// ========================================
// 5. GESTIÓN DE CUOTAS
// ========================================

function getMiembros() {
  const data = getCRM();
  return data.cuotas.miembros;
}

function getMiembro(id) {
  const data = getCRM();
  return data.cuotas.miembros.find(m => m.id === id);
}

function getPagosMiembro(miembroId) {
  const data = getCRM();
  return data.cuotas.pagos.filter(p => p.miembroId === miembroId).sort((a, b) => a.mes.localeCompare(b.mes));
}

function getCuotaMensual(miembro, mes) {
  const data = getCRM();
  const pagosMiembro = getPagosMiembro(miembro.id);
  const mesAlta = miembro.fechaAlta ? miembro.fechaAlta.substring(0, 7) : null;
  
  // Primer mes = inscripción
  if (mes === mesAlta || pagosMiembro.length === 0) {
    return data.cuotas.inscripcion;
  }
  // Resto = mensualidad base * factor de modalidad
  const modalidad = (data.cuotas.modalidades || []).find(m => m.id === (miembro.modalidadId || 'mensual'));
  const factor = modalidad ? modalidad.factor : 1.0;
  return Math.round(data.cuotas.mensualidadOrdinaria * factor * 100) / 100;
}

function getImporteModalidad(miembro) {
  const data = getCRM();
  const modalidad = (data.cuotas.modalidades || []).find(m => m.id === (miembro.modalidadId || 'mensual'));
  const factor = modalidad ? modalidad.factor : 1.0;
  return Math.round(data.cuotas.mensualidadOrdinaria * factor * 100) / 100;
}

function addRevision(accion, detalle) {
  const data = getCRM();
  const user = getCurrentUser();
  const nombre = user ? user.name : 'sistema';
  data.revisiones.push({
    id: data.revisiones.length + 1,
    fecha: new Date().toISOString().split('T')[0],
    usuario: nombre,
    accion,
    detalle
  });
  saveCRM(data);
}

function getUltimasRevisiones(limite = 10) {
  const data = getCRM();
  return (data.revisiones || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limite);
}

function registrarPago(miembroId, mes) {
  const data = getCRM();
  const miembro = data.cuotas.miembros.find(m => m.id === miembroId);
  if (!miembro) return false;
  
  const importe = getCuotaMensual(miembro, mes);
  
  // Buscar pago existente o crear uno nuevo
  let pago = data.cuotas.pagos.find(p => p.miembroId === miembroId && p.mes === mes);
  if (pago) {
    pago.pagado = true;
    pago.fechaPago = new Date().toISOString().split('T')[0];
    pago.importe = importe;
  } else {
    pago = {
      id: data.cuotas.pagos.length + 1,
      miembroId,
      mes,
      importe,
      pagado: true,
      fechaPago: new Date().toISOString().split('T')[0],
      registradoPor: 'gestor'
    };
    data.cuotas.pagos.push(pago);
  }
  
  // Registrar ingreso en fondos
  data.fondos.saldoActual += importe;
  data.fondos.historial.push({
    id: data.fondos.historial.length + 1,
    fecha: new Date().toISOString().split('T')[0],
    concepto: `Cuota ${mes} - ${miembro.nombre}${importe === data.cuotas.inscripcion ? ' (inscripción)' : ''}`,
    tipo: 'ingreso',
    cantidad: importe,
    categoria: 'cuotas',
    registradoPor: 'gestor'
  });
  
  // Auditoría
  addRevision('Pago registrado', `${miembro.nombre} - ${getMesNombre(mes)} ${mes.split('-')[0]} - ${formatEUR(importe)}`);
  
  saveCRM(data);
  return true;
}

function addSolicitudSocio(nombre, email, telefono, categoria) {
  const data = getCRM();
  const nueva = {
    id: data.cuotas.solicitudesPendientes.length + 1,
    nombre,
    email,
    telefono,
    categoria,
    fechaSolicitud: new Date().toISOString().split('T')[0],
    estado: 'pendiente'
  };
  data.cuotas.solicitudesPendientes.push(nueva);
  saveCRM(data);
  return nueva;
}

function aprobarSocio(solicitudId) {
  const data = getCRM();
  const solicitud = data.cuotas.solicitudesPendientes.find(s => s.id === solicitudId);
  if (!solicitud) return false;
  
  solicitud.estado = 'aprobado';
  
  const mesActual = new Date().toISOString().substring(0, 7);
  
  const nuevoMiembro = {
    id: data.cuotas.miembros.length + 1,
    nombre: solicitud.nombre,
    email: solicitud.email,
    telefono: solicitud.telefono,
    categoria: solicitud.categoria,
    fechaAlta: new Date().toISOString().split('T')[0],
    activo: true
  };
  data.cuotas.miembros.push(nuevoMiembro);
  
  // Crear pago en flat model (pendiente)
  data.cuotas.pagos.push({
    id: data.cuotas.pagos.length + 1,
    miembroId: nuevoMiembro.id,
    mes: mesActual,
    importe: data.cuotas.inscripcion,
    pagado: false,
    fechaPago: null,
    registradoPor: 'gestor'
  });
  saveCRM(data);
  return true;
}

function rechazarSocio(solicitudId) {
  const data = getCRM();
  const solicitud = data.cuotas.solicitudesPendientes.find(s => s.id === solicitudId);
  if (!solicitud) return false;
  solicitud.estado = 'rechazado';
  saveCRM(data);
  return true;
}

// ========================================
// 6. GESTIÓN DE TORNEOS
// ========================================

function getInscripciones() {
  const data = getCRM();
  return data.torneos.inscripciones;
}

function solicitarInscripcion(nombre, fecha, jugadoresIds, precioPorJugador, solicitadoPor) {
  const data = getCRM();
  const costeTotal = jugadoresIds.length * precioPorJugador;
  const disponible = getFondosDisponibles();
  const fueraPresupuesto = costeTotal > disponible;
  
  const nueva = {
    id: data.torneos.inscripciones.length + 1,
    nombre,
    fecha,
    jugadoresAsistentes: jugadoresIds,
    precioPorJugador,
    estado: 'pendiente',
    fueraPresupuesto,
    solicitadoPor,
    aprobadoPor: null
  };
  data.torneos.inscripciones.push(nueva);
  
  const msg = `Solicitud: ${nombre} | ${jugadoresIds.length} jugs × ${formatEUR(precioPorJugador)} = ${formatEUR(costeTotal)}${fueraPresupuesto ? ' (FONDOS INSUFICIENTES)' : ''}`;
  data.notificaciones.push({
    id: data.notificaciones.length + 1,
    fecha: new Date().toISOString().split('T')[0],
    mensaje: msg,
    tipo: 'solicitud',
    leida: false,
    url: 'admin-torneos.html'
  });
  
  saveCRM(data);
  return nueva;
}

function aprobarInscripcion(torneoId, aprobadoPor) {
  const data = getCRM();
  const torneo = data.torneos.inscripciones.find(t => t.id === torneoId);
  if (!torneo) return { success: false, error: 'Torneo no encontrado' };
  
  const costeTotal = getCosteTorneo(torneo);
  const disponible = getFondosDisponibles();
  
  if (costeTotal > disponible) {
    return { success: false, error: `Fondos insuficientes. Necesitas ${formatEUR(costeTotal)} y solo hay ${formatEUR(disponible)} disponibles.` };
  }
  
  torneo.estado = 'inscrito';
  torneo.aprobadoPor = aprobadoPor;
  
  data.fondos.saldoActual -= costeTotal;
  data.fondos.historial.push({
    id: data.fondos.historial.length + 1,
    fecha: new Date().toISOString().split('T')[0],
    concepto: `Inscripción ${torneo.nombre}`,
    tipo: 'gasto',
    cantidad: costeTotal,
    categoria: 'torneo',
    registradoPor: aprobadoPor
  });
  
  saveCRM(data);
  return { success: true };
}

function rechazarInscripcion(torneoId) {
  const data = getCRM();
  const torneo = data.torneos.inscripciones.find(t => t.id === torneoId);
  if (!torneo) return false;
  torneo.estado = 'rechazado';
  saveCRM(data);
  return true;
}

// ========================================
// 7. NOTIFICACIONES
// ========================================

function getNotificaciones() {
  const data = getCRM();
  return data.notificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function getNotificacionesNoLeidas() {
  return getNotificaciones().filter(n => !n.leida);
}

function marcarNotificacionLeida(id) {
  const data = getCRM();
  const notif = data.notificaciones.find(n => n.id === id);
  if (notif) {
    notif.leida = true;
    saveCRM(data);
  }
}

function marcarTodasLeidas() {
  const data = getCRM();
  data.notificaciones.forEach(n => n.leida = true);
  saveCRM(data);
}

// ========================================
// 8. ESTADÍSTICAS
// ========================================

function getEstadisticasDashboard() {
  const data = getCRM();
  
  const ingresos = data.fondos.historial
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + m.cantidad, 0);
  
  const gastos = data.fondos.historial
    .filter(m => m.tipo === 'gasto')
    .reduce((sum, m) => sum + m.cantidad, 0);
  
  const miembrosActivos = data.cuotas.miembros.filter(m => m.activo).length;
  
  const morosos = data.cuotas.miembros.filter(m => {
    const pagosMiembro = getPagosMiembro(m.id);
    if (pagosMiembro.length === 0) return false;
    const ultimoPago = pagosMiembro[pagosMiembro.length - 1];
    return !ultimoPago.pagado;
  }).length;
  
  const torneosPendientes = data.torneos.inscripciones.filter(t => t.estado === 'pendiente').length;
  
  const bloqueado = getFondosBloqueados();
  const disponible = getFondosDisponibles();
  const gastoTorneos = getGastoTorneos();
  
  return {
    saldoActual: data.fondos.saldoActual,
    fondosBloqueados: bloqueado,
    fondosDisponibles: disponible,
    totalIngresos: ingresos,
    totalGastos: gastos,
    miembrosActivos,
    morosos,
    torneosPendientes,
    gastoTorneos,
    solicitudesPendientes: data.cuotas.solicitudesPendientes.filter(s => s.estado === 'pendiente').length,
    notificacionesNoLeidas: data.notificaciones.filter(n => !n.leida).length,
    proyectosActivos: data.fondos.proyectosBloqueados.filter(p => p.estado === 'bloqueado').length
  };
}

// ========================================
// 9. FORMATEO
// ========================================

function formatEUR(cantidad) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cantidad);
}

function formatDateCRM(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

function getMesNombre(mesCode) {
  const meses = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };
  const mes = mesCode.split('-')[1];
  return meses[mes] || mes;
}

// ========================================
// 10. POLÍTICA DE PAGOS
// ========================================

function getPeriodoPago(mes) {
  // Devuelve { inicio, finPago, finMargen } del mes (formato 'YYYY-MM')
  const anio = parseInt(mes.split('-')[0]);
  const mesNum = parseInt(mes.split('-')[1]);
  return {
    mes,
    inicio: `${mes}-01`,
    finPago: `${mes}-07`,
    finMargen: `${mes}-14`
  };
}

function getEstadoPago(miembro, mes) {
  const data = getCRM();
  const pago = data.cuotas.pagos.find(p => p.miembroId === miembro.id && p.mes === mes);
  if (!pago) return { estado: 'pendiente', label: 'Pendiente' };
  if (pago.pagado) return { estado: 'pagado', label: `Pagado` };
  
  const hoy = new Date();
  const periodo = getPeriodoPago(mes);
  const fechaMargen = new Date(periodo.finMargen);
  if (hoy > fechaMargen) return { estado: 'moroso', label: 'Moroso' };
  return { estado: 'pendiente', label: 'En plazo' };
}

function necesitaPagoAntesDeTorneo(miembroId, fechaTorneo) {
  const data = getCRM();
  const miembro = data.cuotas.miembros.find(m => m.id === miembroId);
  if (!miembro) return false;
  
  const ft = new Date(fechaTorneo);
  const dia = ft.getDate();
  const mesKey = `${ft.getFullYear()}-${String(ft.getMonth() + 1).padStart(2, '0')}`;
  
  // Semana de margen = días 8-14
  if (dia >= 8 && dia <= 14) {
    const pago = data.cuotas.pagos.find(p => p.miembroId === miembroId && p.mes === mesKey);
    if (!pago || !pago.pagado) return true;
  }
  return false;
}

// ========================================
// 11. CONVOCATORIA (GESTOR)
// ========================================

function isConvocatoriaAbierta() {
  const data = getCRM();
  return data.cuotas.convocatoriaAbierta !== false;
}

function toggleConvocatoria() {
  const data = getCRM();
  const user = getCurrentUser();
  if (!user || user.role !== 'gestor') return { success: false, error: 'Solo el gestor puede gestionar convocatorias' };
  
  data.cuotas.convocatoriaAbierta = !data.cuotas.convocatoriaAbierta;
  const estado = data.cuotas.convocatoriaAbierta ? 'abierta' : 'cerrada';
  addRevision('Convocatoria', `Convocatoria de inscripciones ${estado}`);
  saveCRM(data);
  return { success: true, abierta: data.cuotas.convocatoriaAbierta };
}

// ========================================
// 12. EDITAR CUOTAS (GESTOR)
// ========================================

function actualizarCuotas(nuevaInscripcion, nuevaMensualidad) {
  const data = getCRM();
  const user = getCurrentUser();
  if (!user || user.role !== 'gestor') return { success: false, error: 'Solo el gestor puede modificar las cuotas' };
  
  const importeAnteriorIns = data.cuotas.inscripcion;
  const importeAnteriorMen = data.cuotas.mensualidadOrdinaria;
  
  data.cuotas.inscripcion = nuevaInscripcion;
  data.cuotas.mensualidadOrdinaria = nuevaMensualidad;
  
  addRevision('Cuotas actualizadas', 
    `Inscripción: ${formatEUR(importeAnteriorIns)} → ${formatEUR(nuevaInscripcion)} | ` +
    `Mensualidad: ${formatEUR(importeAnteriorMen)} → ${formatEUR(nuevaMensualidad)}`);
  
  saveCRM(data);
  return { success: true };
}

// ========================================
// 13. (reservado)
// ========================================
      ...e,
      pagado: pago ? pago.pagado : false,
      fechaPago: pago ? pago.fechaPago : null
    };
  });
}

function getTotalExtrasPendientes() {
  const data = getCRM();
  const pagosExtras = data.cuotas.pagosExtras || [];
  const extras = data.cuotas.extras || [];
  
  return pagosExtras
    .filter(p => !p.pagado)
    .reduce((sum, p) => {
      const extra = extras.find(e => e.id === p.extraId);
      return sum + (extra ? extra.importe : 0);
    }, 0);
}

// ========================================
// 14. CÁLCULO DE CUOTAS
// ========================================

function getModalidadInfo(miembro) {
  const data = getCRM();
  if (miembro.cuotaPersonalizada !== null && miembro.cuotaPersonalizada !== undefined) {
    return { nombre: 'Personalizado', precioBase: miembro.cuotaPersonalizada, descripcion: 'Cuota personalizada' };
  }
  const mod = (data.cuotas.modalidades || []).find(m => m.id === (miembro.modalidadId || 'mensual'));
  return mod || { nombre: 'Mensual', precioBase: data.cuotas.mensualidadOrdinaria, descripcion: 'Pago mensual', meses: 1, factor: 1.0 };
}

function calcularCuota(miembro) {
  const data = getCRM();
  if (miembro.cuotaPersonalizada !== null && miembro.cuotaPersonalizada !== undefined) {
    return miembro.cuotaPersonalizada;
  }
  const modalidad = (data.cuotas.modalidades || []).find(m => m.id === (miembro.modalidadId || 'mensual'));
  const factor = modalidad ? modalidad.factor : 1.0;
  return Math.round(data.cuotas.mensualidadOrdinaria * factor * 100) / 100;
}

function getPrecioMesAlta(miembro) {
  const data = getCRM();
  return data.cuotas.inscripcion;
}

function getResumenMensual(mes) {
  const data = getCRM();
  const miembros = data.cuotas.miembros.filter(m => m.activo);
  const pagosMes = data.cuotas.pagos.filter(p => p.mes === mes);
  
  let totalEsperado = 0;
  let totalPagado = 0;
  let totalPendiente = 0;
  const detalles = [];
  
  miembros.forEach(m => {
    const esPrimerMes = m.fechaAlta && m.fechaAlta.substring(0, 7) === mes;
    const importe = esPrimerMes ? getPrecioMesAlta(m) : calcularCuotaConDescuentos(m);
    const pago = pagosMes.find(p => p.miembroId === m.id);
    const pagado = pago ? pago.pagado : false;
    
    totalEsperado += importe;
    if (pagado) totalPagado += importe;
    else totalPendiente += importe;
    
    detalles.push({ miembro: m, importe, pagado, pago });
  });
  
  const extrasMes = (data.cuotas.pagosExtras || []).filter(p => !p.pagado);
  const totalExtras = extrasMes.reduce((sum, p) => {
    const extra = (data.cuotas.extras || []).find(e => e.id === p.extraId);
    return sum + (extra ? extra.importe : 0);
  }, 0);
  
  return { mes, totalEsperado, totalPagado, totalPendiente, detalles, totalExtras, recaudacion: ((totalPagado / totalEsperado) * 100) || 0 };
}

function getDeudaTotal() {
  const data = getCRM();
  const mesesUnicos = [...new Set(data.cuotas.pagos.map(p => p.mes))].sort();
  let total = 0;
  
  data.cuotas.miembros.filter(m => m.activo).forEach(m => {
    mesesUnicos.forEach(mes => {
      const pago = data.cuotas.pagos.find(p => p.miembroId === m.id && p.mes === mes);
      if (!pago || !pago.pagado) {
        const esPrimerMes = m.fechaAlta && m.fechaAlta.substring(0, 7) === mes;
        total += esPrimerMes ? data.cuotas.inscripcion : calcularCuotaConDescuentos(m);
      }
    });
  });
  
  return total;
}

function getIngresosPorMes() {
  const data = getCRM();
  const meses = [...new Set(data.cuotas.pagos.map(p => p.mes))].sort();
  
  return meses.map(mes => {
    const pagos = data.cuotas.pagos.filter(p => p.mes === mes);
    const total = pagos.reduce((sum, p) => sum + (p.pagado ? p.importe : 0), 0);
    const pendiente = pagos.reduce((sum, p) => sum + (!p.pagado ? p.importe : 0), 0);
    return { mes, total, pendiente, ingresos: total };
  });
}

// ========================================
// 15. GESTIÓN DE PRESUPUESTO
// ========================================

function getPresupuestoAnual() {
  const data = getCRM();
  return data.fondos.presupuestoAnual || { año: 2026, ingresosPrevistos: 0, gastosPrevistos: 0, categorias: [] };
}

function actualizarPresupuesto(categoriaId, nuevoPresupuesto) {
  const data = getCRM();
  if (!data.fondos.presupuestoAnual) {
    data.fondos.presupuestoAnual = { año: 2026, ingresosPrevistos: 0, gastosPrevistos: 0, categorias: [] };
  }
  const cat = data.fondos.presupuestoAnual.categorias.find(c => c.id === categoriaId);
  if (cat) {
    cat.presupuesto = nuevoPresupuesto;
    saveCRM(data);
    return { success: true };
  }
  return { success: false, error: 'Categoría no encontrada' };
}

function getEjecucionPresupuesto() {
  const data = getCRM();
  const presupuesto = data.fondos.presupuestoAnual;
  if (!presupuesto || !presupuesto.categorias) {
    return { año: 2026, ingresosPrevistos: 0, gastosPrevistos: 0, ingresosReales: 0, gastosReales: 0, categorias: [] };
  }
  
  const totalIngresos = data.fondos.historial.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.cantidad, 0);
  const totalGastos = data.fondos.historial.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.cantidad, 0);
  
  return {
    año: presupuesto.año,
    ingresosPrevistos: presupuesto.ingresosPrevistos,
    gastosPrevistos: presupuesto.gastosPrevistos,
    ingresosReales: totalIngresos,
    gastosReales: totalGastos,
    categorias: (presupuesto.categorias || []).map(c => ({
      ...c,
      porcentajeEjecucion: c.presupuesto > 0 ? Math.round((c.gastado / c.presupuesto) * 100) : 0,
      restante: c.presupuesto - c.gastado
    }))
  };
}

// ========================================
// 16. GENERACIÓN DE PDFs OFICIALES
// ========================================

function generarPDFSolicitudTorneo(torneo) {
  const data = getCRM();
  const jugadoresNombres = torneo.jugadoresAsistentes.map(id => {
    const m = data.cuotas.miembros.find(m => m.id === id);
    return m ? m.nombre : 'Desconocido';
  });
  
  const costeTotal = getCosteTorneo(torneo);
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html><head>
      <title>Solicitud Torneo - ${torneo.nombre}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        @page { margin: 2cm; }
        * { box-sizing: border-box; }
        body { font-family: 'Outfit', 'Segoe UI', sans-serif; color: #1a1a2e; line-height: 1.6; padding: 0; margin: 0; }
        .header { text-align: center; border-bottom: 3px solid #ff6d00; padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .header h1 { font-size: 1.6rem; font-weight: 900; margin: 0; color: #1a0040; text-transform: uppercase; letter-spacing: 1px; }
        .header p { color: #666; font-size: 0.85rem; margin: 0.3rem 0 0; }
        .header .sub { color: #ff6d00; font-weight: 700; font-size: 0.9rem; }
        .ref { text-align: right; font-size: 0.8rem; color: #999; margin-bottom: 1.5rem; }
        h2 { font-size: 1.1rem; font-weight: 800; color: #1a0040; border-left: 4px solid #ff6d00; padding-left: 0.8rem; margin: 1.5rem 0 1rem; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
        th { background: #1a0040; color: white; padding: 0.6rem 0.8rem; text-align: left; font-weight: 600; }
        td { padding: 0.5rem 0.8rem; border-bottom: 1px solid #e0d8f0; }
        .total-row { font-weight: 800; background: rgba(255,109,0,0.05); }
        .total-row td { border-top: 2px solid #ff6d00; }
        .firma { margin-top: 3rem; display: flex; justify-content: space-between; }
        .firma div { text-align: center; width: 45%; }
        .firma .linea { border-top: 1px solid #333; margin-top: 3rem; padding-top: 0.5rem; font-size: 0.8rem; color: #666; }
        .badge { display: inline-block; padding: 0.2rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
        .badge-pending { background: rgba(255,109,0,0.1); color: #ff6d00; }
        .footer-text { text-align: center; margin-top: 2rem; font-size: 0.75rem; color: #999; border-top: 1px solid #eee; padding-top: 1rem; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin: 1rem 0; }
        .info-item { padding: 0.5rem 0; }
        .info-item strong { display: block; font-size: 0.75rem; color: #666; text-transform: uppercase; }
        .info-item span { font-size: 1rem; font-weight: 700; }
      </style>
    </head><body>
      <div class="header">
        <h1>📋 Solicitud de Inscripción a Torneo</h1>
        <p class="sub">Voley Club La Placeta · Grupo de La Placeta</p>
        <p>Documento oficial de solicitud</p>
      </div>
      <div class="ref">Ref: T-${String(torneo.id).padStart(3,'0')} · Fecha: ${hoy}</div>
      
      <h2>Datos del Torneo</h2>
      <div class="info-grid">
        <div class="info-item"><strong>Nombre</strong><span>${torneo.nombre}</span></div>
        <div class="info-item"><strong>Fecha</strong><span>${new Date(torneo.fecha).toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'})}</span></div>
        <div class="info-item"><strong>Precio por jugador</strong><span>${formatEUR(torneo.precioPorJugador)}</span></div>
        <div class="info-item"><strong>Nº Jugadores</strong><span>${torneo.jugadoresAsistentes.length}</span></div>
      </div>
      
      <h2>Jugadores Asistentes</h2>
      <table>
        <thead><tr><th>#</th><th>Nombre</th><th>Posición</th></tr></thead>
        <tbody>
          ${jugadoresNombres.map((n, i) => {
            const m = data.cuotas.miembros.find(m => m.nombre === n);
            return `<tr><td>${i+1}</td><td>${n}</td><td>${m ? m.posicion || '-' : '-'}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
      
      <h2>Resumen Económico</h2>
      <table>
        <tr><td>Precio por jugador</td><td style="text-align:right">${formatEUR(torneo.precioPorJugador)}</td></tr>
        <tr><td>Número de jugadores</td><td style="text-align:right">${torneo.jugadoresAsistentes.length}</td></tr>
        <tr class="total-row"><td><strong>COSTE TOTAL</strong></td><td style="text-align:right"><strong>${formatEUR(costeTotal)}</strong></td></tr>
      </table>
      
      <p style="margin-top:1rem;">
        <span class="badge badge-pending">Estado: ${torneo.estado === 'pendiente' ? 'PENDIENTE DE APROBACIÓN' : torneo.estado.toUpperCase()}</span>
        ${torneo.fueraPresupuesto ? '<span class="badge" style="background:rgba(231,76,60,0.1);color:#c0392b;margin-left:0.5rem;">FUERA DE PRESUPUESTO</span>' : ''}
      </p>
      
      <div class="firma">
        <div>
          <div class="linea">Firma del Solicitante</div>
          <p style="font-size:0.8rem;color:#666;margin-top:0.3rem;">${torneo.solicitadoPor || 'Responsable del Club'}</p>
        </div>
        <div>
          <div class="linea">V°B° del Gestor</div>
          <p style="font-size:0.8rem;color:#666;margin-top:0.3rem;">Junta del Grupo de La Placeta</p>
        </div>
      </div>
      
      <div class="footer-text">
        Voley Club La Placeta · Documento generado el ${hoy}<br>
        Este documento es una solicitud oficial y debe ser aprobada por la Junta del Grupo de La Placeta.
      </div>
      <script>window.print();</scr`+'ipt></body></html>');
}

function generarPDFAprobacionTorneo(torneo) {
  const data = getCRM();
  const costeTotal = getCosteTorneo(torneo);
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html><head>
      <title>Aprobación Torneo - ${torneo.nombre}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        @page { margin: 2cm; }
        * { box-sizing: border-box; }
        body { font-family: 'Outfit', 'Segoe UI', sans-serif; color: #1a1a2e; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px solid #2ecc71; padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .header h1 { font-size: 1.6rem; font-weight: 900; margin: 0; color: #1a0040; }
        .header .badge-approved { display:inline-block; background:#2ecc71; color:white; padding:0.3rem 2rem; border-radius:50px; font-weight:700; font-size:0.9rem; margin-top:0.5rem; }
        .ref { text-align: right; font-size: 0.8rem; color: #999; }
        h2 { font-size: 1.1rem; font-weight: 800; color: #1a0040; border-left: 4px solid #2ecc71; padding-left: 0.8rem; margin: 1.5rem 0 1rem; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
        th { background: #1a0040; color: white; padding: 0.6rem 0.8rem; text-align: left; }
        td { padding: 0.5rem 0.8rem; border-bottom: 1px solid #e0d8f0; }
        .firma { margin-top: 3rem; display: flex; justify-content: space-between; }
        .firma .linea { border-top: 1px solid #333; margin-top: 3rem; padding-top: 0.5rem; font-size: 0.8rem; color: #666; text-align:center; width:45%; }
        .footer-text { text-align: center; margin-top: 2rem; font-size: 0.75rem; color: #999; border-top: 1px solid #eee; padding-top: 1rem; }
      </style>
    </head><body>
      <div class="header">
        <h1>✅ APROBACIÓN DE INSCRIPCIÓN</h1>
        <p style="color:#666;">Voley Club La Placeta · Grupo de La Placeta</p>
        <div class="badge-approved">INSCRIPCIÓN APROBADA</div>
      </div>
      <div class="ref">Ref: T-${String(torneo.id).padStart(3,'0')}-APROB · Fecha: ${hoy}</div>
      
      <h2>Datos del Torneo</h2>
      <p><strong>Torneo:</strong> ${torneo.nombre}</p>
      <p><strong>Fecha:</strong> ${new Date(torneo.fecha).toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'})}</p>
      <p><strong>Coste Total:</strong> ${formatEUR(costeTotal)}</p>
      <p><strong>Jugadores:</strong> ${torneo.jugadoresAsistentes.length} asistentes</p>
      <p><strong>Aprobado por:</strong> ${torneo.aprobadoPor || 'Junta del Grupo de La Placeta'}</p>
      
      <h2>Detalle del Gasto</h2>
      <table>
        <tr><td>Inscripción</td><td style="text-align:right">${formatEUR(costeTotal)}</td></tr>
        <tr style="font-weight:800; background:rgba(46,204,113,0.05);"><td>Total</td><td style="text-align:right">${formatEUR(costeTotal)}</td></tr>
      </table>
      
      <p style="padding:0.8rem; background:rgba(46,204,113,0.05); border-radius:8px; border-left:3px solid #2ecc71;">
        <strong>Estado financiero:</strong> Fondos disponibles tras la inscripción: ${formatEUR(getFondosDisponibles())}
      </p>
      
      <div class="firma">
        <div class="linea">Firma del Gestor (Junta de La Placeta)</div>
        <div class="linea">Firma del Responsable del Club</div>
      </div>
      
      <div class="footer-text">
        Voley Club La Placeta · Documento generado el ${hoy}
      </div>
      <script>window.print();</scr`+'ipt></body></html>');
}

function generarPDFRechazoTorneo(torneo, motivo) {
  const data = getCRM();
  const costeTotal = getCosteTorneo(torneo);
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html><head>
      <title>Rechazo Torneo - ${torneo.nombre}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        @page { margin: 2cm; }
        body { font-family: 'Outfit', sans-serif; color: #1a1a2e; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px solid #e74c3c; padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .header h1 { font-size: 1.6rem; font-weight: 900; margin: 0; color: #1a0040; }
        .badge-rejected { display:inline-block; background:#e74c3c; color:white; padding:0.3rem 2rem; border-radius:50px; font-weight:700; margin-top:0.5rem; }
        .footer-text { text-align: center; margin-top: 2rem; font-size: 0.75rem; color: #999; }
      </style>
    </head><body>
      <div class="header">
        <h1>❌ RECHAZO DE INSCRIPCIÓN</h1>
        <p style="color:#666;">Voley Club La Placeta · Grupo de La Placeta</p>
        <div class="badge-rejected">SOLICITUD RECHAZADA</div>
      </div>
      <div class="ref" style="text-align:right;font-size:0.8rem;color:#999;">Ref: T-${String(torneo.id).padStart(3,'0')}-REC · Fecha: ${hoy}</div>
      <p><strong>Torneo:</strong> ${torneo.nombre}</p>
      <p><strong>Coste solicitado:</strong> ${formatEUR(costeTotal)}</p>
      ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
      <div class="footer-text">Voley Club La Placeta</div>
      <script>window.print();</scr`+'ipt></body></html>');
}
