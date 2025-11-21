const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');
const { verificarToken, esAdmin } = require('../middleware/auth');

// READ
router.get('/', verificarToken, async (req, res) => {
  try {
    const SQL = `SELECT * from estado`;

    const [results] = await db.query(SQL);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener estados:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
    });
  }
})

router.get('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = `
      SELECT * from estado
      WHERE id_estado = ?;
    `;

    const [result] = await db.query(SQL, [id]);

    if(result.length == 0) {
      return res.status(404).json({ 
        error: 'Rol no encontrado' 
      });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error al obtener estado:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
    });
  }
})

module.exports = router; 