const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');

// READ
router.get('/', (req, res) => {
  const SQL = `
    SELECT * from producto
    ORDER BY disponible DESC, nombre ASC
  `;

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
  WHERE id_producto = ?
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
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen_url, stock, disponible } = req.body;

    if (!nombre || !precio || !stock) {
      return res.status(400).json({ 
        error: 'Los campos nombre, precio y stock son requeridos' 
      });
    }
    
    if(precio < 0 || stock < 0) {
      return res.status(400).json({
        error: 'El precio y stock no pueden ser negativos'
      });
    }
    
    const SQL = `
      INSERT INTO producto(nombre, descripcion, precio, imagen_url, stock, disponible)
      VALUES(?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(SQL, [
      nombre, 
      descripcion || null, 
      precio, 
      imagen_url || null, 
      stock,
      disponible !== undefined ? disponible : true // si disponible no es undefined usar el valor, de lo contrario poner false.
    ]);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      id: result.insertId, // recupera el ID de la ultima operacion de insercion.
    });
  } catch (error) {
    if(error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Ya existe un producto con ese nombre'
      })
    }

    console.error(error);
    res.status(500).json({ 
      error: 'Error al crear producto' 
    });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen_url, stock, disponible } = req.body;

    // se desestructura el array que viene para tomar el 1er objeto encontrado e ignorar el 2do que son los metadatos
    const [existe] = await db.query(
      'SELECT * from producto WHERE id_producto = ?', [id]   
    );

    if(existe.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      })
    }

    if (precio !== undefined && precio < 0) {
      return res.status(400).json({ 
        error: 'El precio no puede ser negativo' 
      });
    }

    // query dinámico (solo actualiza lo que viene)
    const campos = [];
    const valores = [];
    
    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(descripcion);
    }
    if (precio !== undefined) {
      campos.push('precio = ?');
      valores.push(precio);
    }
    if (imagen_url !== undefined) {
      campos.push('imagen_url = ?');
      valores.push(imagen_url);
    }
    if (stock !== undefined) {
      campos.push('stock = ?');
      valores.push(stock);
    }
    if (disponible !== undefined) {
      campos.push('disponible = ?');
      valores.push(disponible);
    }

    if (campos.length === 0) {
      return res.status(400).json({ 
        error: 'No hay campos para actualizar' 
      });
    }

    // ultimo valor el ID del objeto a actualizar para el WHERE
    valores.push(id);


  } catch (error) {
    
  }
})



/*
  PUT
  editar producto por ID

  DELETE
  borrar producto
 */

module.exports = router; 