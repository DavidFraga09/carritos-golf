// src/routes/ubicacionRoutes.js
const express = require('express');
const router = express.Router();

const {
  createUbicacion,
  getUbicaciones,
  getUbicacionesByCarrito,
  deleteUbicacion,
  recibirUbicacionMovil,
} = require('../controllers/ubicacionController');

const auth = require('../middlewares/authMiddleware');

// ---- Rutas protegidas (panel/admin) ----
router.post('/', auth, createUbicacion);                 // Crear ubicación (manual/panel)
router.get('/', auth, getUbicaciones);                   // Listar todas
router.get('/carrito/:carritoId', auth, getUbicacionesByCarrito); // Historial por carrito
router.delete('/:id', auth, deleteUbicacion);            // Eliminar una ubicación

// ---- Ruta pública para móviles (sin token) ----
router.post('/mobile', recibirUbicacionMovil);           // Recibe {identificador, latitud, longitud}

module.exports = router;
