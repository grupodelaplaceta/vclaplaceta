const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor (local) o exportar para Vercel
if (!process.env.VERCEL) {
  async function start() {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📡 API disponible en http://localhost:${PORT}/api`);
      });
    } catch (err) {
      console.error('❌ Error al iniciar servidor:', err.message);
      process.exit(1);
    }
  }
  start();
}

module.exports = app;
