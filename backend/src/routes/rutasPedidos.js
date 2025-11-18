const express = require('express');
const router = express.Router();
const db = require('../config/sql_db');

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

module.exports = router;

/**
  Que tiene que mostrar pedidos:
    - id_pedido
    - hora
    - fecha
    - detalle
    - estado
    - id_estado
    - cliente

    GET de:
    ////- pedidos activos (pendiente, en preparacion, listo) 1, 2, 3,
    ////- pedidos entregados 4
    ////- pedidos cancelados 5
    ////- todos los pedidos (independientemente del estado)
    ////- pedido por ID


    PUT
    cambiar el estado de un pedido por ID 9aca tmbn se puede cancelar)
    
    POST 
    crear un nuevo pedido
 */