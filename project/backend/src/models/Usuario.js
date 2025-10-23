const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
  fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
