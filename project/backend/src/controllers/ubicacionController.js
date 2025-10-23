const Ubicacion = require('../models/Ubicacion');
const Carrito = require('../models/Carrito');

// POST /
exports.createUbicacion = async (req, res) => {
  try {
    const { carrito_id, latitud, longitud, nivel_bateria, fecha_hora } = req.body;

    const carrito = await Carrito.findById(carrito_id);
    if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

    const nueva = new Ubicacion({
      carrito_id,
      latitud,
      longitud,
      nivel_bateria,
      fecha_hora: fecha_hora ? new Date(fecha_hora) : new Date()
    });
    await nueva.save();

    // Actualizar estado del carrito
    carrito.ubicacion_actual = { latitud, longitud };
    if (typeof nivel_bateria === 'number') carrito.bateria = nivel_bateria;
    await carrito.save();

    res.status(201).json({ message: 'Ubicación registrada', ubicacion: nueva });
  } catch (err) {
    res.status(400).json({ message: 'Error al registrar ubicación', error: err.message });
  }
};

// GET /
exports.getUbicaciones = async (_req, res) => {
  try {
    const ubicaciones = await Ubicacion.find().populate('carrito_id', 'identificador modelo');
    res.json(ubicaciones);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ubicaciones', error: err.message });
  }
};

// GET /carrito/:carritoId (historial por carrito)
exports.getUbicacionesByCarrito = async (req, res) => {
  try {
    const data = await Ubicacion.find({ carrito_id: req.params.carritoId }).sort({ fecha_hora: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener historial', error: err.message });
  }
};

// DELETE /:id
exports.deleteUbicacion = async (req, res) => {
  try {
    const ubic = await Ubicacion.findByIdAndDelete(req.params.id);
    if (!ubic) return res.status(404).json({ message: 'Ubicación no encontrada' });
    res.json({ message: 'Ubicación eliminada' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar ubicación', error: err.message });
  }
};
