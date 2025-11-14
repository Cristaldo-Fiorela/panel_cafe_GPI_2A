const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');


// READ
router.get('/', (req, res) => {
  const SQL = `
    SELECT u.id, u.username, u.email, u.id_rol, r.descripcion as rol 
    FROM usuario as u
    INNER JOIN rol as r ON u.id_rol = r.id_rol
  `;

  db.query(SQL, (err, results) => {
    if(err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        detalle: err.message 
      });
    }
    
    res.json(results);
  })
})


module.exports = router; 