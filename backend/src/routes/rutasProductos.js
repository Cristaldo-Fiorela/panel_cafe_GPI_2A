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

module.exports = router; 