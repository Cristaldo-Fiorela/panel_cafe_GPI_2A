const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');
const { verificarToken, esAdmin } = require('../middleware/auth');

// READ
router.get('/', verificarToken, esAdmin, async (req, res) => {
  try {
    
    const SQL = `
      SELECT u.id, u.username, u.email, u.id_rol, r.descripcion as rol 
      FROM usuario as u
      INNER JOIN rol as r ON u.id_rol = r.id_rol
    `;

    const [results] = await db.query(SQL);

    res.json(results);
  } catch (error) {
    console.error('Error al obtener usuarios:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
    });
  }
})

router.get('/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    const ID = parseInt(req.params.id);
    const SQL = `
    SELECT u.id, u.username, u.email, u.id_rol, r.descripcion as rol 
    FROM usuario as u
    INNER JOIN rol as r ON u.id_rol = r.id_rol
    WHERE u.id = ?;
    `;

    const [result] = await db.query(SQL, [ID]);
    if(result.length == 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
    });
  }
})

// CREATE
router.post('/', verificarToken, esAdmin, async (req, res) => {
  try {
    const { username, password, email, id_rol } = req.body;
    
    // Validaciones
    if (!username || !password || !email) {
      return res.status(400).json({ 
        error: 'Los campos username, password y email son obligatorios' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email inválido' 
      });
    }
    
    // Verificar que el rol existe
    if (id_rol) {
      const [rolExiste] = await db.query(
        'SELECT id_rol FROM rol WHERE id_rol = ?',
        [id_rol]
      );
      
      if (rolExiste.length === 0) {
        return res.status(400).json({ 
          error: 'El rol especificado no existe' 
        });
      }
    }
    
    // Verificar si el username ya existe
    const [existeUsername] = await db.query(
      'SELECT id FROM usuario WHERE username = ?',
      [username]
    );
    
    if (existeUsername.length > 0) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está en uso' 
      });
    }
    
    // Verificar si el email ya existe
    const [existeEmail] = await db.query(
      'SELECT id FROM usuario WHERE email = ?',
      [email]
    );
    
    if (existeEmail.length > 0) {
      return res.status(409).json({ 
        error: 'El email ya está registrado' 
      });
    }
    
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insertar usuario
    const [result] = await db.query(`
      INSERT INTO usuario (username, password, email, id_rol) 
      VALUES (?, ?, ?, ?)
    `, [username, hashedPassword, email, id_rol || 3]); // Por defecto cliente (3)
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      error: 'Error al crear usuario' 
    });
  }
});

// EDIT
router.put('/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que existe
    const [existe] = await db.query(
      'SELECT id FROM usuario WHERE id = ?',
      [id]
    );
    
    if (existe.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
    // No permitir que el admin se elimine a sí mismo el rol de admin
    if (parseInt(id) === req.usuario.id && req.body.id_rol && req.body.id_rol !== 1) {
      return res.status(400).json({ 
        error: 'No puedes cambiar tu propio rol de administrador' 
      });
    }
    
    // Construir actualización dinámica
    const camposPermitidos = ['username', 'email', 'password', 'id_rol'];
    const actualizar = {};
    
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        actualizar[campo] = req.body[campo];
      }
    });
    
    if (Object.keys(actualizar).length === 0) {
      return res.status(400).json({ 
        error: 'No hay campos para actualizar' 
      });
    }
    
    // Validaciones específicas
    if (actualizar.username) {
      const [existeUsername] = await db.query(
        'SELECT id FROM usuario WHERE username = ? AND id != ?',
        [actualizar.username, id]
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
        [actualizar.email, id]
      );
      
      if (existeEmail.length > 0) {
        return res.status(409).json({ 
          error: 'El email ya está en uso' 
        });
      }
    }
    
    if (actualizar.password) {
      if (actualizar.password.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }
      
      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      actualizar.password = await bcrypt.hash(actualizar.password, salt);
    }
    
    if (actualizar.id_rol) {
      const [rolExiste] = await db.query(
        'SELECT id_rol FROM rol WHERE id_rol = ?',
        [actualizar.id_rol]
      );
      
      if (rolExiste.length === 0) {
        return res.status(400).json({ 
          error: 'El rol especificado no existe' 
        });
      }
    }
    
    // Construir query
    const columnas = Object.keys(actualizar).map(campo => `${campo} = ?`);
    const valores = [...Object.values(actualizar), id];
    
    const SQL = `
      UPDATE usuario 
      SET ${columnas.join(', ')} 
      WHERE id = ?
    `;
    
    await db.query(SQL, valores);
    
    res.json({
      message: 'Usuario actualizado exitosamente',
      id
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar usuario' 
    });
  }
});

// DELETE
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir que se elimine a sí mismo
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propio usuario' 
      });
    }
    
    // Verificar que existe
    const [existe] = await db.query(
      'SELECT id, username FROM usuario WHERE id = ?',
      [id]
    );
    
    if (existe.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
    // Verificar si tiene pedidos
    const [tienePedidos] = await db.query(
      'SELECT COUNT(*) as total FROM pedido WHERE id_usuario = ?',
      [id]
    );
    
    if (tienePedidos[0].total > 0) {
      return res.status(409).json({ 
        error: 'No se puede eliminar un usuario con pedidos asociados. Considera desactivarlo en su lugar.' 
      });
    }
    
    // Eliminar usuario
    await db.query('DELETE FROM usuario WHERE id = ?', [id]);
    
    res.json({
      message: `Usuario "${existe[0].username}" eliminado exitosamente`,
      id
    });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar usuario' 
    });
  }
});


module.exports = router; 