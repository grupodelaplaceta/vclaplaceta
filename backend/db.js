const { MongoClient } = require('mongodb');
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

function saveData() {
  if (!useMongo) saveJSON();
}

async function closeDB() {
  if (mongoClient) await mongoClient.close();
}

module.exports = { connectDB, getDB, closeDB, saveData };
