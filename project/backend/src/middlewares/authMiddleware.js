const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const raw = req.header('Authorization');
  if (!raw) return res.status(401).json({ message: 'Acceso denegado: falta token' });

  try {
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, rol, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
