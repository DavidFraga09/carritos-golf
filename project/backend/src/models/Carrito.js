const mongoose = require('mongoose');

const carritoSchema = new mongoose.Schema({
  identificador: { type: String, required: true, unique: true },
  modelo: { type: String, required: true },
  estado: { type: String, enum: ['activo', 'inactivo', 'mantenimiento'], default: 'activo' },
  bateria: { type: Number, min: 0, max: 100, default: 100 },
  ubicacion_actual: {
    latitud: { type: Number },
    longitud: { type: Number }
  },
  ultimo_mantenimiento: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Carrito', carritoSchema);
