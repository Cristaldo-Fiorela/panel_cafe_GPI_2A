const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');

// READ
router.get('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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

module.exports = router; 