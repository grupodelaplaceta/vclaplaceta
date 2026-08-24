const { MongoClient } = require('mongodb');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://junta_db_user:oX4YWJzxiRegnbvE@clusterwebcrm.eie4kw8.mongodb.net/vcpl_crm?retryWrites=true&w=majority';
const DB_NAME = process.env.MONGO_DB_NAME || 'vcpl_crm';
const SEED_DB_PATH = path.join(__dirname, 'data.json');
const RUNTIME_DB_PATH = process.env.JSON_DB_PATH || (
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join(os.tmpdir(), 'vcpl-data.json')
    : SEED_DB_PATH
);

let mongoClient = null;
let mongoDb = null;
let useMongo = false;
let jsonData = null;
let connectionAttempted = false;

async function connectDB() {
  if (mongoDb) return mongoDb;
  if (connectionAttempted) return loadJSON(); // ya se intentó; usar fallback en memoria
  connectionAttempted = true;
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
  const db = loadJSON();
  return { db, isMongo: false, json: db };
}

function loadJSON() {
  if (jsonData) return jsonData;
  for (const filePath of [RUNTIME_DB_PATH, SEED_DB_PATH]) {
    try {
      if (fs.existsSync(filePath)) {
        jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return jsonData;
      }
    } catch (e) {
      console.warn(`No se pudo leer JSON ${filePath}:`, e.message);
    }
  }
  jsonData = {
    config: {},
    users: [],
    fondos: { saldoActual: 0, proyectosBloqueados: [], proyectos: [], historial: [] },
    miembros: [],
    pagos: [],
    solicitudes: [],
    torneos: [],
    partidos: [],
    noticias: [],
    notificaciones: [],
    revisiones: [],
    torneosOrganizados: []
  };
  return jsonData;
}

function saveJSON() {
  if (!jsonData) return;
  try {
    fs.mkdirSync(path.dirname(RUNTIME_DB_PATH), { recursive: true });
    fs.writeFileSync(RUNTIME_DB_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
  } catch (e) {
    console.warn(`No se pudo guardar JSON ${RUNTIME_DB_PATH}; usando memoria:`, e.message);
  }
}

function saveData() {
  if (!useMongo) saveJSON();
}

async function closeDB() {
  if (mongoClient) await mongoClient.close();
}

module.exports = { connectDB, getDB, closeDB, saveData };
