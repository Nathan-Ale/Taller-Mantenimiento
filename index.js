const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


const { verificarToken } = require('./middleware/auth');

app.get('/api/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso autorizado', usuario: req.usuario });
});

// Ruta de prueba: confirma que el servidor y la conexión a Supabase funcionan
app.get('/api/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ mensaje: 'Conectado a Supabase correctamente', hora_servidor: result.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});