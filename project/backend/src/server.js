const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config({ path: './.env' });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Servir carpeta pública (donde estará ubicacion.html)
app.use(express.static(path.join(__dirname, 'public')));

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// Rutas API
app.use('/api/usuarios', require('../src/routes/usuarioRoutes'));
app.use('/api/carritos', require('../src/routes/carritoRoutes'));
app.use('/api/ubicaciones', require('../src/routes/ubicacionRoutes'));
app.use('/api/alertas', require('../src/routes/alertaRoutes'));

// 404 Handler (Solo para rutas API)
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Ruta API no encontrada' });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });
