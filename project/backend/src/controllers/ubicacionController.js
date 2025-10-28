const Ubicacion = require('../models/Ubicacion');
const Carrito = require('../models/Carrito');

// POST / (protegido) — registrar ubicación manual
exports.createUbicacion = async (req, res) => {
  try {
    const { carrito_id, latitud, longitud, nivel_bateria, fecha_hora } = req.body;

    console.log(`📝 Registro manual -> CarritoID: ${carrito_id} | Lat: ${latitud} | Lon: ${longitud} | Batt: ${nivel_bateria}`);

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

    carrito.ubicacion_actual = { latitud, longitud };
    if (typeof nivel_bateria === 'number') carrito.bateria = nivel_bateria;
    await carrito.save();

    res.status(201).json({ message: 'Ubicación registrada', ubicacion: nueva });
  } catch (err) {
    res.status(400).json({ message: 'Error al registrar ubicación', error: err.message });
  }
};

// GET / (protegido)
exports.getUbicaciones = async (_req, res) => {
  try {
    const ubicaciones = await Ubicacion.find().populate('carrito_id', 'identificador modelo');
    res.json(ubicaciones);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ubicaciones', error: err.message });
  }
};

// GET /carrito/:carritoId (protegido)
exports.getUbicacionesByCarrito = async (req, res) => {
  try {
    const data = await Ubicacion.find({ carrito_id: req.params.carritoId })
      .sort({ fecha_hora: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener historial', error: err.message });
  }
};

// DELETE /:id (protegido)
exports.deleteUbicacion = async (req, res) => {
  try {
    const ubic = await Ubicacion.findByIdAndDelete(req.params.id);
    if (!ubic) return res.status(404).json({ message: 'Ubicación no encontrada' });
    res.json({ message: 'Ubicación eliminada' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar ubicación', error: err.message });
  }
};

// ⭐ POST /mobile (público) — recibir ubicación desde app móvil
exports.recibirUbicacionMovil = async (req, res) => {
  try {
    const { identificador, latitud, longitud } = req.body;

    if (!identificador || !latitud || !longitud) {
      return res.status(400).json({ message: "Faltan datos: identificador, latitud, longitud" });
    }

    const carrito = await Carrito.findOne({ identificador });
    if (!carrito) {
      console.log(`❌ Carrito no encontrado: ${identificador}`);
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // ✅ LOG EN TIEMPO REAL
    console.log(`📡 [MÓVIL] ${identificador} -> Lat: ${latitud} | Lon: ${longitud}`);

    const nuevaUbicacion = await Ubicacion.create({
      carrito_id: carrito._id,
      latitud,
      longitud,
      nivel_bateria: carrito.bateria
    });

    carrito.ubicacion_actual = { latitud, longitud };
    await carrito.save();

    res.json({ message: "✅ Ubicación registrada gracias al móvil", ubicacion: nuevaUbicacion });

  } catch (error) {
    console.error("Error al guardar ubicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
