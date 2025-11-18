const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');

// CREATE
router.post('/', async(req, res) => {
  // obtenemos una conexion especifica para la llamada nueva debido a que manejamos diferentes transacciones de tablas
  const connection = await db.getConnection();

  try {
    const { total, id_usuario, hora, fecha, id_estado, productos } = req.body;

    // VALIDACIONES
    if (!total || !id_usuario || !hora || !fecha || !id_estado || !productos) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: total, id_usuario, hora, fecha, id_estado, productos'
      });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        error: 'Debe incluir al menos un producto'
      });
    }

    // Validar que cada producto tenga los campos necesarios
    for (const producto of productos) {
      if (!producto.id_producto || !producto.cantidad || !producto.precio_unitario) {
        return res.status(400).json({
          error: 'Cada producto debe tener id_producto, cantidad y precio_unitario'
        });
      }
    }

    // garantiza que todas las transacciones se completen con exito o ninguna de ellas.
    await connection.beginTransaction();

    const SQL_pedido = `
      INSERT INTO pedido(total, id_usuario, hora, fecha, id_estado)
      VALUES (?,?,?, ?, ?)
    `;

    const [resultPedido] = await connection.query(SQL_pedido, [
      total,
      id_usuario,
      hora,
      fecha,
      id_estado
    ]);

    // id de ultima insersion
    const id_pedido = resultPedido.insertId;

    // 2da transaccion
    const SQL_pedido_producto = `
      INSERT INTO pedido_producto(id_pedido, id_producto, cantidad, precio_unitario)
      VALUES (?, ?, ?, ?)
    `;

    for (const producto of productos) {
      await connection.query(SQL_pedido_producto, [
        id_pedido,
        producto.id_producto,
        producto.cantidad,
        producto.precio_unitario
      ]);
    }

    // guarda ambas transacciones en la DB
    await connection.commit();

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      id_pedido: id_pedido
    });
  } catch (error) {
    // revertir cambios en caso de error
    await connection.rollback();

    // Error de FK (usuario o producto no existe)
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({
        error: 'Usuario o producto no encontrado'
      });
    }

    console.error('Error al crear pedido:', error);
    res.status(500).json({
      error: 'Error al crear pedido'
    });

  } finally {
    // independientemente del resultado, liberar la conexion usada.
    connection.release();
  }
})

// READ
router.get('/', async (req, res) => {
  try {
    const SQL = `
    SELECT 
      p.id_pedido, 
      p.hora, 
      p.fecha, 
      pt.descripcion as detalle_producto,
      p.id_estado,
      es.descripcion as estado,
      pp.cantidad,
      pp.precio_unitario,
      p.total,
      u.id,
      u.username
    FROM pedido as p
    INNER JOIN pedido_producto as pp
    ON p.id_pedido = pp.id_pedido
    INNER JOIN producto as pt
    ON pt.id_producto = pp.id_producto
    INNER JOIN estado as es
    ON p.id_estado = es.id_estado
    INNER JOIN usuario as u
    ON p.id_usuario = u.id
    `;

    const [results] = await db.query(SQL);

    res.json(results);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
});

router.get('/activos', async (req, res) => {
  try {
    const SQL = `
    SELECT 
      p.id_pedido, 
      p.hora, 
      p.fecha, 
      pt.descripcion as detalle_producto,
      p.id_estado,
      es.descripcion as estado,
      pp.cantidad,
      pp.precio_unitario,
      p.total,
      u.id,
      u.username
    FROM pedido as p
    INNER JOIN pedido_producto as pp
    ON p.id_pedido = pp.id_pedido
    INNER JOIN producto as pt
    ON pt.id_producto = pp.id_producto
    INNER JOIN estado as es
    ON p.id_estado = es.id_estado
    INNER JOIN usuario as u
    ON p.id_usuario = u.id
    WHERE p.id_estado IN (1,2,3)
    `;

    const [results] = await db.query(SQL);

    res.json(results);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
});

router.get('/entregados', async (req, res) => {
  try {
    const SQL = `
    SELECT 
      p.id_pedido, 
      p.hora, 
      p.fecha, 
      pt.descripcion as detalle_producto,
      p.id_estado,
      es.descripcion as estado,
      pp.cantidad,
      pp.precio_unitario,
      p.total,
      u.id,
      u.username
    FROM pedido as p
    INNER JOIN pedido_producto as pp
    ON p.id_pedido = pp.id_pedido
    INNER JOIN producto as pt
    ON pt.id_producto = pp.id_producto
    INNER JOIN estado as es
    ON p.id_estado = es.id_estado
    INNER JOIN usuario as u
    ON p.id_usuario = u.id
    WHERE p.id_estado IN (4)
    `;

    const [results] = await db.query(SQL);

    res.json(results);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
});

router.get('/cancelados', async (req, res) => {
  try {
    const SQL = `
    SELECT 
      p.id_pedido, 
      p.hora, 
      p.fecha, 
      pt.descripcion as detalle_producto,
      p.id_estado,
      es.descripcion as estado,
      pp.cantidad,
      pp.precio_unitario,
      p.total,
      u.id,
      u.username
    FROM pedido as p
    INNER JOIN pedido_producto as pp
    ON p.id_pedido = pp.id_pedido
    INNER JOIN producto as pt
    ON pt.id_producto = pp.id_producto
    INNER JOIN estado as es
    ON p.id_estado = es.id_estado
    INNER JOIN usuario as u
    ON p.id_usuario = u.id
    WHERE p.id_estado IN (5)
    `;

    const [results] = await db.query(SQL);

    res.json(results);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = `
    SELECT 
      p.id_pedido, 
      p.hora, 
      p.fecha, 
      pt.descripcion as detalle_producto,
      p.id_estado,
      es.descripcion as estado,
      pp.cantidad,
      pp.precio_unitario,
      p.total,
      u.id,
      u.username
    FROM pedido as p
    INNER JOIN pedido_producto as pp
    ON p.id_pedido = pp.id_pedido
    INNER JOIN producto as pt
    ON pt.id_producto = pp.id_producto
    INNER JOIN estado as es
    ON p.id_estado = es.id_estado
    INNER JOIN usuario as u
    ON p.id_usuario = u.id
    WHERE p.id_pedido = ?
    `;

    const [result] = await db.query(SQL, [id]);

    res.json(result);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
});

// EDIT
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_estado } = req.body;

    if(!id_estado) {
      return res.status(400).json({
        error: 'El campo id_estado es requerido'
      });
    }

    // verificando que pedido existe
    const [existe] = await db.query(
      `SELECT id_pedido FROM pedido WHERE id_pedido = ?`,
      [id]
    );

    if( existe.length === 0) {
      return res.status(400).json({
        error: 'Pedido no encontrado'
      });
    }

    const SQL = `
      UPDATE pedido
      SET id_estado = ?
      WHERE id_pedido = ?
    `;
    await db.query(SQL, [id_estado, id]);

    res.json({
      message: 'estado del pedido actualizado exitosamente',
      id_pedido: id,
      id_estado: id_estado
    });
    
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      error: 'Error al actualizar estado del pedido'
    });
  }
})

// DELETE - cambio de estado de pedido a cancelado (para no perder el historial)
router.patch('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;

    // verificar existencia del pedido y su estado 
    const [pedido] = await db.query(
      'SELECT id_pedido, id_estado FROM pedido WHERE id_pedido = ?',
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({
        error: 'Pedido no encontrado'
      });
    }

    // Solo se puede cancelar si está Pendiente (id_estado = 1)
    if (pedido[0].id_estado !== 1) {
      return res.status(400).json({
        error: 'Solo se pueden cancelar pedidos en estado Pendiente'
      });
    }

    // cambia estado a Cancelado (id_estado = 5)
    const SQL = `
      UPDATE pedido SET id_estado = 5 WHERE id_pedido = ?
    `;

    await db.query(SQL, [id]);

    res.json({
      message: 'Pedido cancelado exitosamente',
      id_pedido: id
    });

  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({
      error: 'Error al cancelar pedido'
    });
  }
});

module.exports = router;