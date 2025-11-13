require('dotenv').config();
const mysql = require('mysql2');

// uso de archivo .env para desarrollo local
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// conexion y manejo de errores
connection.connect((err) => {
  if(err) {
    console.log('Error de conexion con la DB: ', err);
    return;
  }

  console.log('Conectado a la base de datos MySQL');
})

// exportar la conexion para usarla en rutas
module.exports = connection;