const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './.env' });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// Rutas
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/carritos', require('./routes/carritoRoutes'));
app.use('/api/ubicaciones', require('./routes/ubicacionRoutes'));

// 404
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

// Conexión a Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });
