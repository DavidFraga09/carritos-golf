const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /register
exports.register = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: 'nombre, correo y password son obligatorios' });
    }

    const existing = await Usuario.findOne({ correo });
    if (existing) return res.status(400).json({ message: 'Correo ya registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const nuevo = new Usuario({ nombre, correo, password: hashed, rol: rol || 'usuario' });
    await nuevo.save();

    res.status(201).json({ message: 'Usuario registrado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
};

// POST /login
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user._id, nombre: user.nombre, correo: user.correo, rol: user.rol }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
};

// GET /profile (requiere auth)
exports.getProfile = async (req, res) => {
  try {
    const user = await Usuario.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener perfil', error: err.message });
  }
};

// GET / (listar usuarios)
exports.getAllUsers = async (_req, res) => {
  try {
    const users = await Usuario.find(); // para ver password encriptado; para ocultarlo usar .select('-password')
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar usuarios', error: err.message });
  }
};

// PUT /:id (actualizar)
exports.updateUser = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (correo) updates.correo = correo;
    if (rol) updates.rol = rol;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const user = await Usuario.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ message: 'Usuario actualizado', user });
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar usuario', error: err.message });
  }
};

// DELETE /:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await Usuario.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar usuario', error: err.message });
  }
};
