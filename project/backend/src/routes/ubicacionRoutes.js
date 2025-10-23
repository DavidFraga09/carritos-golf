const express = require('express');
const router = express.Router();
const {
  createUbicacion,
  getUbicaciones,
  getUbicacionesByCarrito,
  deleteUbicacion
} = require('../controllers/ubicacionController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createUbicacion);
router.get('/', auth, getUbicaciones);
router.get('/carrito/:carritoId', auth, getUbicacionesByCarrito);
router.delete('/:id', auth, deleteUbicacion);

module.exports = router;
