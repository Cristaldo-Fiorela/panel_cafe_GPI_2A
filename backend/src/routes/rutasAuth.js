require('dotenv').config();
const express = require('express');
const router = express.Router();
// para hashear
const bcrypt = require('bcryptjs');
// JWT Para crear tokens de sesión. Ese ticket tiene información encriptada y una firma que solo vos podés verificar.
const jwt = require('jsonwebtoken');
const db = require('../config/sql_db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST para registrarse
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // VALIDACIONES
    if (!username || !password || !email) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Verificar si el usuario ya existe
    const [existeUsername] = await db.query(
      'SELECT id FROM usuario WHERE username = ?',
      [username]
    );
    
    if (existeUsername.length > 0) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está en uso' 
      });
    }
    
    const [existeEmail] = await db.query(
      'SELECT id FROM usuario WHERE email = ?',
      [email]
    );
    
    if (existeEmail.length > 0) {
      return res.status(409).json({ 
        error: 'El email ya está registrado' 
      });
    }
    
    // * Hashear contraseña
    // Generar "sal" (salt) = números random para hacer más seguro
    // El número 10 es el "costo" (más alto = más seguro pero más lento)
    const salt = await bcrypt.genSalt(10);
    // Hashear la contraseña con la sal
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insertar usuario (rol cliente = 3 por defecto)
    const [result] = await db.query(`
      INSERT INTO usuario (username, password, email, id_rol) 
      VALUES (?, ?, ?, 3)
    `, [username, hashedPassword, email]);
    
    // * Crear token JWT
    // Este token es el "ticket" que el usuario usará para acceder
    const token = jwt.sign(
      { 
        id: result.insertId, // id del usuario recien creado
        username,            // nombre de usuario
        id_rol: 3            // rol cliente de default
      },
      JWT_SECRET,                     // Clave secreta para firmar el token
      { expiresIn: JWT_EXPIRES_IN }   // Cuándo expira
    );
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        rol: 'cliente'
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
});


// POST para login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Usuario y contraseña son obligatorios' 
      });
    }
    
    // * Buscar usuario
    // Busca por username o email (permite login con ambos)
    const [usuarios] = await db.query(`
        SELECT u.*, r.descripcion as rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.username = ? OR u.email = ?
      `, 
      [username, username]
    );

    // no encontro coincidencias de username o correo 
    if (usuarios.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
    
    const usuario = usuarios[0];
    
    // * Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
    
    // * Crear token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        username: usuario.username,
        id_rol: usuario.id_rol,
        rol: usuario.rol
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      message: 'Login exitoso',
      token, // El frontend guarda esto (localStorage/sessionStorage)
      user: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
});

// // ⚠️ RUTA TEMPORAL - BORRAR DESPUÉS DE CREAR EL ADMIN 
// router.post('/crear-primer-admin', async (req, res) => {
//   try {
//     // Verificar que no haya admins ya
//     const [admins] = await db.query(
//       'SELECT COUNT(*) as total FROM usuario WHERE id_rol = 1'
//     );
    
//     if (admins[0].total > 0) {
//       return res.status(403).json({ 
//         error: 'Ya existe un administrador. Esta ruta está deshabilitada.' 
//       });
//     }
    
//     const { username, password, email } = req.body;
    
//     if (!username || !password || !email) {
//       return res.status(400).json({ 
//         error: 'Todos los campos son obligatorios' 
//       });
//     }
    
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
    
//     const [result] = await db.query(`
//       INSERT INTO usuario (username, password, email, id_rol) 
//       VALUES (?, ?, ?, 1)
//     `, [username, hashedPassword, email]);
    
//     const token = jwt.sign(
//       { id: result.insertId, username, id_rol: 1 },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );
    
//     res.status(201).json({
//       message: '🎉 Primer administrador creado. ELIMINA ESTA RUTA AHORA.',
//       token,
//       user: { id: result.insertId, username, email, rol: 'admin' }
//     });
    
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error al crear administrador' });
//   }
// });

module.exports = router;