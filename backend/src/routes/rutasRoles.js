const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');


// READ
router.get('/', (req, res) => {
  const SQL = `SELECT * from rol`;

  db.query(SQL, (err, results) => {
    if(err) {
      console.error('Error al obtener roles:', err);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        detalle: err.message 
      });
    }
    
    res.json(results);
  })
})

router.get('/:id', (req, res) => {
  const ID = parseInt(req.params.id);
  const SQL = `
  SELECT * from rol
  WHERE id_rol = ?;
  `;

  db.query(SQL, [ID], (err, result) => {
    if(err) {
      console.error('Error al obtener rol:', err);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        detalle: err.message 
      });
    }

    if(result.length == 0) return res.status(404).json({ error: 'Rol no encontrado' });
    
    res.json(result[0]);
  })
})

module.exports = router; 