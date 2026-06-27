const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb+srv://junta_db_user:oX4YWJzxiRegnbvE@clusterwebcrm.eie4kw8.mongodb.net/vcpl_crm?retryWrites=true&w=majority';
const DB_NAME = 'vcpl_crm';
const DB_PATH = path.join(__dirname, 'data.json');

let mongoClient = null;
let mongoDb = null;
let useMongo = false;
let jsonData = null;

async function connectDB() {
  if (mongoDb) return mongoDb;
  try {
    mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db(DB_NAME);
    await mongoDb.command({ ping: 1 });
    useMongo = true;
    console.log('✅ Conectado a MongoDB Atlas');
    return mongoDb;
  } catch (err) {
    console.log('⚠️ MongoDB no disponible, usando JSON:', err.message);
    return loadJSON();
  }
}

function getDB() {
  if (useMongo && mongoDb) return { db: mongoDb, isMongo: true, json: null };
  return { db: loadJSON(), isMongo: false, json: loadJSON() };
}

function loadJSON() {
  if (jsonData) return jsonData;
  try {
    if (fs.existsSync(DB_PATH)) {
      jsonData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      return jsonData;
    }
  } catch(e) {}
  jsonData = {};
  return jsonData;
}

function saveJSON() {
  if (jsonData) fs.writeFileSync(DB_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
}

function saveData() { /* MongoDB saves automatically */ }

async function seedMongo(db) {
  console.log('🌱 Sembrando datos...');
  await db.collection('config').insertOne({ clubName:'Voley Club La Placeta', gestorName:'Junta del Grupo de La Placeta', responsableName:'Responsable del Club' });
  const salt = bcrypt.genSaltSync(10);
  await db.collection('users').insertMany([{id:1,username:'gestor',password:bcrypt.hashSync('gestor2026',salt),role:'gestor',name:'Junta La Placeta'},{id:2,username:'admin',password:bcrypt.hashSync('admin2026',salt),role:'responsable',name:'Responsable Club'}]);
  await db.collection('fondos').insertOne({ saldoActual:15000, proyectosBloqueados:[], historial:[{id:1,fecha:'2026-01-15',concepto:'Aportación inicial Junta',tipo:'ingreso',cantidad:15000,categoria:'aportacion',registradoPor:'gestor'}] });
  await db.collection('miembros').insertMany([{id:1,nombre:'David Hernández',posicion:'Líbero',activo:true,fechaAlta:'2026-01-01'},{id:2,nombre:'Javier Robles',posicion:'Colocador',activo:true,fechaAlta:'2026-01-01'},{id:3,nombre:'Miguel Torres',posicion:'Central',activo:true,fechaAlta:'2026-01-15'},{id:4,nombre:'Sofía García',posicion:'Colocadora',activo:true,fechaAlta:'2026-01-01'},{id:5,nombre:'Alejandra López',posicion:'Central',activo:true,fechaAlta:'2026-02-01'},{id:6,nombre:'Raúl Jiménez',posicion:'Receptor',activo:true,fechaAlta:'2026-02-15'}]);
  await db.collection('noticias').insertMany([{id:1,fecha:'2026-06-15',titulo:'¡Victoria en casa!',resumen:'Ganamos 3-0',contenido:'Gran partido',categoria:'Partidos',destacada:true,imagen:''},{id:2,fecha:'2026-06-10',titulo:'Abiertas inscripciones',resumen:'Nueva temporada',contenido:'Apúntate',categoria:'Convocatoria',destacada:true,imagen:''}]);
  await db.collection('partidos').insertMany([{id:1,fecha:'2026-05-15',hora:'20:30',torneo:'Superliga Estatal',tipo:'torneo',local:'Voley Club La Placeta',visitante:'CV Tarragona',setsLocal:3,setsVisitante:1,resultado:'Victoria'},{id:2,fecha:'2026-05-08',hora:'19:00',torneo:'Liga Regional',tipo:'torneo',local:'Reus Voleibol',visitante:'Voley Club La Placeta',setsLocal:2,setsVisitante:3,resultado:'Victoria'},{id:3,fecha:'2026-06-20',hora:'11:00',torneo:'',tipo:'amistoso',local:'Voley Club La Placeta',visitante:'Universidad Tarragona',setsLocal:2,setsVisitante:2,resultado:'Empate'}]);
  await db.collection('torneos').insertMany([{id:1,nombre:'Superliga Estatal',jugadoresAsistentes:[1,2,3,4,5,6],precioPorJugador:50,estado:'inscrito',aprobadoPor:'gestor'},{id:2,nombre:'Liga Regional',jugadoresAsistentes:[1,2,3,4,5,6],precioPorJugador:45,estado:'inscrito',aprobadoPor:'gestor'}]);
  await db.collection('notificaciones').insertOne({id:1,fecha:'2026-06-15',mensaje:'Bienvenido al CRM',tipo:'info',leida:false});
  console.log('✅ Datos sembrados en MongoDB');
}

async function closeDB() {
  if (mongoClient) await mongoClient.close();
}

module.exports = { connectDB, getDB, closeDB, saveData };
