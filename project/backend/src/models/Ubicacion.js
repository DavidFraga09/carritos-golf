const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
  carrito_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrito', required: true },
  fecha_hora: { type: Date, default: Date.now },
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
  nivel_bateria: { type: Number, min: 0, max: 100, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Ubicacion', ubicacionSchema);
