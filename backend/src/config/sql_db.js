require('dotenv').config();
const mysql = require('mysql2/promise');

// uso de archivo .env para desarrollo local
// Un pool de conexiones es como un "estacionamiento" de conexiones a la base de datos que están listas para usar.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  // para el POOl
  waitForConnections: true,
  connectionLimit: 10, // max 10 conexiones simultáneas (default)
  queueLimit: 0
});

// conexion y manejo de errores (verifica la conexion)
// 1. el getConnection presta una de las conexiones disponibles de connectionLimit
pool.getConnection()
  .then(connection => {
    // tenemos 9 conexiones
    console.log('Conectado a la base de datos MySQL');
    // Importante: liberar la conexión de vuelta al pool de 10
    connection.release(); 
    // volvemos a tener 10 conexiones disponibles
  })
  .catch(err => {
    console.error('Error de conexión con la DB:', err);
  });

// exportar la conexion para usarla en rutas
module.exports = pool;