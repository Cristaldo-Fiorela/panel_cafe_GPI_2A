const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');

// TODO: CAMBIAR ASYNC AWAIT

// READ
router.get('/', async (req, res) => {
  try {
    const SQL = `SELECT * from rol`;

    const [results] = await db.query(SQL);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener roles:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
    });
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = `
      SELECT * from rol
      WHERE id_rol = ?;
    `;

    const [result] = await db.query(SQL, [id]);

    if(result.length == 0) {
      return res.status(404).json({ 
        error: 'Rol no encontrado' 
      });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error al obtener rol:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
    });
  }
})

module.exports = router; 