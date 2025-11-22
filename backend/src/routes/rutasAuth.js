require('dotenv').config();
const express = require('express');
const router = express.Router();
// para hashear
const bcrypt = require('bcryptjs');
// JWT Para crear tokens de sesión. Ese ticket tiene información encriptada y una firma que solo vos podés verificar.
const jwt = require('jsonwebtoken');
const db = require('../config/sql_db');
const {  verificarToken } = require('../middleware/auth.js');

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
        id_rol: 3,
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
        rol: usuario.rol,
        id_rol: usuario.id_rol
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
        rol: usuario.rol, 
        id_rol: usuario.id_rol
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
});

// GET para perfil
router.get('/me', verificarToken, async (req, res) => {
  try {
    const id_usuario = req.usuario.id; // Del token
    
    const [usuarios] = await db.query(`
      SELECT u.id, u.username, u.email, u.id_rol, r.descripcion as rol
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id = ?
    `, [id_usuario]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
    res.json(usuarios[0]);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error al obtener perfil' 
    });
  }
});

// EDIT para perfil
router.put('/me', verificarToken, async (req, res) => {
  try {
    const id_usuario = req.usuario.id; // Del token
    const { username, email, password, currentPassword } = req.body;
    
    // Si quiere cambiar la contraseña, debe proporcionar la actual
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ 
          error: 'Debes proporcionar tu contraseña actual para cambiarla' 
        });
      }
      
      // Verificar contraseña actual
      const [usuario] = await db.query(
        'SELECT password FROM usuario WHERE id = ?',
        [id_usuario]
      );
      
      const passwordValida = await bcrypt.compare(currentPassword, usuario[0].password);
      
      if (!passwordValida) {
        return res.status(401).json({ 
          error: 'Contraseña actual incorrecta' 
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
      }
    }
    
    // Construir actualización dinámica
    const actualizar = {};
    
    if (username !== undefined) actualizar.username = username;
    if (email !== undefined) actualizar.email = email;
    if (password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      actualizar.password = await bcrypt.hash(password, salt);
    }
    
    if (Object.keys(actualizar).length === 0) {
      return res.status(400).json({ 
        error: 'No hay campos para actualizar' 
      });
    }
    
    // Validaciones
    if (actualizar.username) {
      const [existeUsername] = await db.query(
        'SELECT id FROM usuario WHERE username = ? AND id != ?',
        [actualizar.username, id_usuario]
      );
      
      if (existeUsername.length > 0) {
        return res.status(409).json({ 
          error: 'El nombre de usuario ya está en uso' 
        });
      }
    }
    
    if (actualizar.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(actualizar.email)) {
        return res.status(400).json({ 
          error: 'Email inválido' 
        });
      }
      
      const [existeEmail] = await db.query(
        'SELECT id FROM usuario WHERE email = ? AND id != ?',
        [actualizar.email, id_usuario]
      );
      
      if (existeEmail.length > 0) {
        return res.status(409).json({ 
          error: 'El email ya está en uso' 
        });
      }
    }
    
    // Actualizar
    const columnas = Object.keys(actualizar).map(campo => `${campo} = ?`);
    const valores = [...Object.values(actualizar), id_usuario];
    
    const SQL = `
      UPDATE usuario 
      SET ${columnas.join(', ')} 
      WHERE id = ?
    `;
    
    await db.query(SQL, valores);
    
    // Devolver datos actualizados
    const [usuarioActualizado] = await db.query(`
      SELECT u.id, u.username, u.email, u.id_rol, r.descripcion as rol
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id = ?
    `, [id_usuario]);
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: usuarioActualizado[0]
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error al actualizar perfil' 
    });
  }
});


module.exports = router;