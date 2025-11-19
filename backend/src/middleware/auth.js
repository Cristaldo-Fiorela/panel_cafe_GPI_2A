require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Verificar que el usuario está autenticado ANTES de la ruta protegida
function verificarToken(req, res, next) {
  // extraccion de token de sin el Bearer. el ? es para si no existe el Authorization, no falle
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Token no proporcionado.' 
    });
  }
  
  try {
    // * Verifica token
    // verifica si no expiro o si fue alterado. si esta ok devuelve data payload
    const decoded = jwt.verify(token, JWT_SECRET);

    req.usuario = decoded; // se guarda info del usuario en req para rutas protegidas

    // continua a la funcion de rutas
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
}

// Verificar que el usuario es admin
function esAdmin(req, res, next) {
  // se ejecuta DESPUES de verificarToken
  if (req.usuario.id_rol !== 1) {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  // Es admin, puede continuar
  next();
}

module.exports = { verificarToken, esAdmin };