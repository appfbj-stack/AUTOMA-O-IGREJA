require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const obsRoutes = require('./routes/obs');
const xr12Routes = require('./routes/xr12');
const sonoffRoutes = require('./routes/sonoff');
const logsRoutes = require('./routes/logs');
const dispositivosRoutes = require('./routes/dispositivos');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use('/api/obs', obsRoutes);
app.use('/api/xr12', xr12Routes);
app.use('/api/sonoff', sonoffRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/dispositivos', dispositivosRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  if (process.env.DATABASE_URL) {
    await initDB().catch(err => console.warn('⚠️  Banco não conectado:', err.message));
  } else {
    console.warn('⚠️  DATABASE_URL não definido — banco de dados desativado');
  }
  app.listen(PORT, () => {
    console.log(`✅ Ekklesia Control Backend rodando na porta ${PORT}`);
  });
}

start();
