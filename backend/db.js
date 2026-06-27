const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// ========================================
// DATOS POR DEFECTO
// ========================================
const DEFAULT_DATA = {
  config: {
    clubName: 'Voley Club La Placeta',
    gestorName: 'Junta del Grupo de La Placeta',
    responsableName: 'Responsable del Club'
  },
  users: [
    { id: 1, username: 'gestor', password: 'gestor2026', role: 'gestor', name: 'Junta La Placeta' },
    { id: 2, username: 'admin', password: 'admin2026', role: 'responsable', name: 'Responsable Club' }
  ],
  fondos: {
    saldoActual: 15000,
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
    historial: []
  },
  miembros: [],
  pagos: [],
  solicitudes: [],
  torneos: [],
  partidos: [],
  patrocinios: [],
  noticias: [],
  revisiones: [],
  notificaciones: [],
  extras: []
};

// ========================================
// CARGA INICIAL
// ========================================
function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('⚠️ Error leyendo data.json, usando datos por defecto:', err.message);
  }
  
  // Si no existe, crear con seed data
  const data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  
  // Seed: miembros
  data.miembros = [
    { id: 1, nombre: 'David Hernández', email: 'david@email.com', telefono: '612345678', posicion: 'Líbero', esSuplente: false, esResponsable: true, planId: 'jugador', descuentos: [], cuotaPersonalizada: null, fechaAlta: '2026-01-01', activo: true },
    { id: 2, nombre: 'Javier Robles', email: 'javier@email.com', telefono: '623456789', posicion: 'Colocador', esSuplente: false, esResponsable: false, planId: 'jugador', descuentos: [], cuotaPersonalizada: null, fechaAlta: '2026-01-01', activo: true },
    { id: 3, nombre: 'Miguel Torres', email: 'miguel@email.com', telefono: '634567890', posicion: 'Central', esSuplente: false, esResponsable: false, planId: 'jugador', descuentos: [1], cuotaPersonalizada: null, fechaAlta: '2026-01-15', activo: true },
    { id: 4, nombre: 'Sofía García', email: 'sofia@email.com', telefono: '645678901', posicion: 'Colocadora', esSuplente: false, esResponsable: false, planId: 'jugador', descuentos: [], cuotaPersonalizada: null, fechaAlta: '2026-01-01', activo: true },
    { id: 5, nombre: 'Alejandra López', email: 'alejandra@email.com', telefono: '656789012', posicion: 'Central', esSuplente: true, esResponsable: false, planId: 'suplente', descuentos: [2], cuotaPersonalizada: null, fechaAlta: '2026-02-01', activo: true },
    { id: 6, nombre: 'Raúl Jiménez', email: 'raul@email.com', telefono: '667890123', posicion: 'Receptor', esSuplente: true, esResponsable: false, planId: 'suplente', descuentos: [], cuotaPersonalizada: null, fechaAlta: '2026-02-15', activo: true }
  ];
  
  // Seed: partidos
  data.partidos = [
    { id: 1, fecha: '2026-05-15', hora: '20:30', torneo: 'Superliga Estatal', local: 'Voley Club La Placeta', visitante: 'CV Tarragona', setsLocal: 3, setsVisitante: 1, resultado: 'Victoria' },
    { id: 2, fecha: '2026-05-08', hora: '19:00', torneo: 'Liga Regional', local: 'Reus Voleibol', visitante: 'Voley Club La Placeta', setsLocal: 2, setsVisitante: 3, resultado: 'Victoria' },
    { id: 3, fecha: '2026-04-28', hora: '18:00', torneo: 'Liga Regional', local: 'Voley Club La Placeta', visitante: 'CV Tarragona', setsLocal: 3, setsVisitante: 0, resultado: 'Victoria' },
    { id: 4, fecha: '2026-04-15', hora: '20:30', torneo: 'Superliga Estatal', local: 'Gigantes Voleibol', visitante: 'Voley Club La Placeta', setsLocal: 3, setsVisitante: 2, resultado: 'Derrota' },
    { id: 5, fecha: '2026-04-05', hora: '19:00', torneo: 'Superliga Estatal', local: 'Voley Club La Placeta', visitante: 'Deportivo Terrassa', setsLocal: 3, setsVisitante: 1, resultado: 'Victoria' },
    { id: 6, fecha: '2026-03-22', hora: '18:00', torneo: 'Liga Regional', local: 'CV Tarragona', visitante: 'Voley Club La Placeta', setsLocal: 0, setsVisitante: 3, resultado: 'Victoria' },
    { id: 7, fecha: '2026-03-10', hora: '20:30', torneo: 'Superliga Estatal', local: 'Voley Club La Placeta', visitante: 'Potencia Valencia', setsLocal: 2, setsVisitante: 3, resultado: 'Derrota' }
  ];
  
  // Seed: noticias
  data.noticias = [
    { id: 1, fecha: '2026-06-15', titulo: '¡Victoria en casa! VCPL vence al CV Tarragona', resumen: 'Nuestro equipo se impuso por 3-0 en un partido intenso.', contenido: 'Gran actuación del equipo que dominó de principio a fin.', categoria: 'Partidos', destacada: true, creadoPor: 'admin' },
    { id: 2, fecha: '2026-06-10', titulo: 'Abiertas inscripciones para la temporada 2026-2027', resumen: 'Ya puedes apuntarte para formar parte del Voley Club La Placeta.', contenido: 'Ampliamos la plantilla para la próxima temporada.', categoria: 'Convocatoria', destacada: true, creadoPor: 'admin' },
    { id: 3, fecha: '2026-06-05', titulo: 'Nueva equipación presentada', resumen: 'Estrenamos imagen con la nueva equipación oficial.', contenido: 'Diseño renovado manteniendo nuestros colores.', categoria: 'Club', destacada: true, creadoPor: 'admin' }
  ];
  
  // Seed: torneos
  data.torneos = [
    { id: 1, nombre: 'Superliga Estatal', fecha: '2026-02-15', jugadoresAsistentes: [1,2,3,4,5,6], precioPorJugador: 50, estado: 'inscrito', aprobadoPor: 'gestor', solicitadoPor: 'responsable' },
    { id: 2, nombre: 'Liga Regional', fecha: '2026-03-20', jugadoresAsistentes: [1,2,3,4,5,6,7], precioPorJugador: 45, estado: 'inscrito', aprobadoPor: 'gestor', solicitadoPor: 'responsable' },
    { id: 3, nombre: 'Torneo Amistoso', fecha: '2026-07-05', jugadoresAsistentes: [1,2,3,4,5], precioPorJugador: 60, estado: 'pendiente', solicitadoPor: 'responsable', aprobadoPor: null }
  ];
  
  // Seed: pagos
  const pagosArray = [];
  const meses = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
  meses.forEach(mes => {
    [1, 2, 3, 4, 5, 6].forEach(mId => {
      pagosArray.push({
        id: pagosArray.length + 1,
        miembroId: mId,
        mes,
        importe: mId <= 2 ? 35 : 10,
        pagado: true,
        fechaPago: `${mes}-0${Math.floor(Math.random() * 7) + 1}`,
        registradoPor: 'gestor'
      });
    });
  });
  data.pagos = pagosArray;
  
  // Seed: historial fondos
  data.fondos.historial = [
    { id: 1, fecha: '2026-01-15', concepto: 'Aportación inicial Junta', tipo: 'ingreso', cantidad: 15000, categoria: 'aportacion', registradoPor: 'gestor' },
    { id: 2, fecha: '2026-02-01', concepto: 'Pago cuotas enero', tipo: 'ingreso', cantidad: 3200, categoria: 'cuotas', registradoPor: 'gestor' },
    { id: 3, fecha: '2026-02-15', concepto: 'Inscripción Superliga Estatal', tipo: 'gasto', cantidad: -2500, categoria: 'torneo', registradoPor: 'responsable' },
    { id: 4, fecha: '2026-03-01', concepto: 'Pago cuotas febrero', tipo: 'ingreso', cantidad: 3100, categoria: 'cuotas', registradoPor: 'gestor' },
    { id: 5, fecha: '2026-03-10', concepto: 'Material deportivo', tipo: 'gasto', cantidad: -800, categoria: 'material', registradoPor: 'responsable' },
    { id: 6, fecha: '2026-04-01', concepto: 'Pago cuotas marzo', tipo: 'ingreso', cantidad: 2900, categoria: 'cuotas', registradoPor: 'gestor' },
    { id: 7, fecha: '2026-04-20', concepto: 'Transporte torneo Valencia', tipo: 'gasto', cantidad: -1200, categoria: 'transporte', registradoPor: 'responsable' },
    { id: 8, fecha: '2026-05-01', concepto: 'Pago cuotas abril', tipo: 'ingreso', cantidad: 2800, categoria: 'cuotas', registradoPor: 'gestor' }
  ];
  
  saveData(data);
  return data;
}

let db = null;

function getDB() {
  if (!db) {
    db = loadData();
    console.log('✅ Base de datos JSON cargada');
  }
  return db;
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Error guardando data.json:', err.message);
    return false;
  }
}

function connectDB() {
  getDB();
  return Promise.resolve(db);
}

function closeDB() {
  db = null;
}

module.exports = { connectDB, getDB, closeDB, saveData };
