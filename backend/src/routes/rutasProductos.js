const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');

// READ
router.get('/', (req, res) => {
  const SQL = `SELECT * from producto`;

  db.query(SQL, (err, results) => {
    if(err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        detalle: err.message 
      });
    }
    
    res.json(results);
  })
})

// READ por ID
router.get('/:id', (req, res) => {
  const ID = parseInt(req.params.id);
  const SQL = `
  SELECT * from producto
  WHERE id_producto = ?;
  `;

  db.query(SQL, [ID], (err, result) => {
    if(err) {
      console.error('Error al obtener producto:', err);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        detalle: err.message 
      });
    }

    if(result.length == 0) return res.status(404).json({ error: 'Producto no encontrado' });
    
    res.json(result[0]);
  })
})

module.exports = router; 