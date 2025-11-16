const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');

// READ
router.get('/', async (req, res) => {
  try {
    const SQL = `
      SELECT * from producto
      ORDER BY disponible DESC, nombre ASC
    `;

    const [results] = await db.query(SQL);
    
    res.json(results);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
})

// READ por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = `
    SELECT * from producto
    WHERE id_producto = ?
    `;
    
    const [result] = await db.query(SQL, [id]);

    if(result.length === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    res.json(result[0]);

  } catch (error) {
    console.error('Error al obtener producto:', error);
     res.status(500).json({ 
      error: 'Error interno del servidor',
    });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen_url, stock, disponible } = req.body;

    if (!nombre || !precio || stock === undefined) {
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
      VALUES(?, ?, ?, ?, ?, ?)
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
      id_producto: result.insertId, // recupera el ID de la ultima operacion de insercion.
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

    // array de string para campos que se van a actualizar en la tabla (nombres de columnas)
    const campos = ['nombre', 'descripcion', 'precio', 'imagen_url', 'stock', 'disponible'];
    // objeto de valores actualizados. 
    const actualizar = {};

    campos.forEach(campo => {
      // si alguno de los campos viene con datos para actualizar
      if(req.body[campo] !== undefined) {
        // Arma un diccionario de los datos actualizados.
        actualizar[campo] = req.body[campo];
      }
    })

    // verifica si hay algo para actualizar
    if(Object.keys(actualizar).length === 0) {
      return res.status(400).json({
        error: 'No hay campos para actualizar'
      })
    }
    
    // VALIDACIONES
    if(actualizar.precio !== undefined && actualizar.precio < 0) {
      return res.status(400).json({ 
        error: 'El precio no puede ser negativo' 
      });
    }

    if(actualizar.stock !== undefined && actualizar.stock < 0) {
      return res.status(400).json({ 
        error: 'El stock no puede ser negativo' 
      });
    }

    // QUERY SQL dinamico
    const columnas = Object.keys(actualizar).map( campo => `${campo} ?`);
    const nuevosValores = [...Object.values(actualizar), id]
    const SQL = `
      UPDATE producto
      SET ${columnas.join(', ')}
      WHERE id_producto = ?
    `;

    await db.query(SQL, nuevosValores);

    res.json({
      message: 'Producto actualizado exitosamente',
      id_producto: id
    });

  } catch (error) {
    // Error de nombre duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'Ya existe un producto con ese nombre' 
      });
    }
    
    console.error(error);
    res.status(500).json({ 
      error: 'Error al actualizar producto' 
    });
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // verifica si existe
    const [existe] = await db.query(
      'SELECT id_producto, nombre FROM producto WHERE id_producto = ?',
      [id]
    );
    
    if (existe.length === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    // TODO: verificacion de que no se puede eliminar si esta en un pedido activo actualmente

    const SQL = `
      DELETE FROM producto
      WHERE id_producto = ?
    `
    await db.query(SQL, [id]);

    res.json({
      message: `Producto ${existe[0].nombre} eliminado exitosamente`,
      id_producto: id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error al eliminar producto' 
    });
  }
})

module.exports = router; 