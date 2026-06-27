/**
 * Seed MongoDB Atlas
 * Uso: node seed-mongo.js
 * Requiere: conexión válida a MongoDB Atlas
 */
const { MongoClient } = require('mongodb');

// CAMBIA ESTO con tus credenciales reales
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jjnta_db_user:oX4YWJzxiRegnbvE@clusterwebcrm.eie4kw8.mongodb.net/vcpl_crm?retryWrites=true&w=majority';

async function seed() {
  const c = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  await c.connect();
  const db = c.db('vcpl_crm');
  
  // Limpiar
  const cols = await db.listCollections().toArray();
  for (const col of cols) await db.collection(col.name).drop().catch(()=>{});
  
  // Seed
  await db.collection('users').insertMany([
    { id: 1, username: 'gestor', password: 'gestor2026', role: 'gestor', name: 'Junta La Placeta' },
    { id: 2, username: 'admin', password: 'admin2026', role: 'responsable', name: 'Responsable Club' }
  ]);
  
  await db.collection('config').insertOne({
    clubName: 'Voley Club La Placeta', gestorName: 'Junta del Grupo de La Placeta', responsableName: 'Responsable del Club'
  });
  
  await db.collection('fondos').insertOne({
    saldoActual: 15000, proyectosBloqueados: [],
    historial: [
      { id: 1, fecha: '2026-01-15', concepto: 'Aportación inicial Junta', tipo: 'ingreso', cantidad: 15000, categoria: 'aportacion', registradoPor: 'gestor' }
    ]
  });
  
  await db.collection('miembros').insertMany([
    { id: 1, nombre: 'David Hernández', email: 'david@email.com', telefono: '612345678', posicion: 'Líbero', activo: true, fechaAlta: '2026-01-01' },
    { id: 2, nombre: 'Javier Robles', email: 'javier@email.com', telefono: '623456789', posicion: 'Colocador', activo: true, fechaAlta: '2026-01-01' },
    { id: 3, nombre: 'Miguel Torres', email: 'miguel@email.com', telefono: '634567890', posicion: 'Central', activo: true, fechaAlta: '2026-01-15' },
    { id: 4, nombre: 'Sofía García', email: 'sofia@email.com', telefono: '645678901', posicion: 'Colocadora', activo: true, fechaAlta: '2026-01-01' },
    { id: 5, nombre: 'Alejandra López', email: 'alejandra@email.com', telefono: '656789012', posicion: 'Central', activo: true, fechaAlta: '2026-02-01' },
    { id: 6, nombre: 'Raúl Jiménez', email: 'raul@email.com', telefono: '667890123', posicion: 'Receptor', activo: true, fechaAlta: '2026-02-15' }
  ]);
  
  await db.collection('noticias').insertMany([
    { id: 1, fecha: '2026-06-15', titulo: '¡Victoria en casa!', resumen: 'Ganamos 3-0', contenido: 'Gran partido', categoria: 'Partidos', destacada: true, imagen: '' },
    { id: 2, fecha: '2026-06-10', titulo: 'Abiertas inscripciones', resumen: 'Nueva temporada', contenido: 'Apúntate', categoria: 'Convocatoria', destacada: true, imagen: '' }
  ]);
  
  await db.collection('partidos').insertMany([
    { id: 1, fecha: '2026-05-15', hora: '20:30', torneo: 'Superliga Estatal', tipo: 'torneo', local: 'Voley Club La Placeta', visitante: 'CV Tarragona', setsLocal: 3, setsVisitante: 1, resultado: 'Victoria' },
    { id: 2, fecha: '2026-05-08', hora: '19:00', torneo: 'Liga Regional', tipo: 'torneo', local: 'Reus Voleibol', visitante: 'Voley Club La Placeta', setsLocal: 2, setsVisitante: 3, resultado: 'Victoria' },
    { id: 3, fecha: '2026-06-20', hora: '11:00', torneo: '', tipo: 'amistoso', local: 'Voley Club La Placeta', visitante: 'Universidad Tarragona', setsLocal: 2, setsVisitante: 2, resultado: 'Empate' }
  ]);
  
  await db.collection('torneos').insertMany([
    { id: 1, nombre: 'Superliga Estatal', fecha: '2026-02-15', jugadoresAsistentes: [1,2,3,4,5,6], precioPorJugador: 50, estado: 'inscrito', aprobadoPor: 'gestor' },
    { id: 2, nombre: 'Liga Regional', fecha: '2026-03-20', jugadoresAsistentes: [1,2,3,4,5,6], precioPorJugador: 45, estado: 'inscrito', aprobadoPor: 'gestor' }
  ]);
  
  console.log('✅ MongoDB seeded');
  await c.close();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
