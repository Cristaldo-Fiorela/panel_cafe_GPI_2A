require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;

// endpoints
const rutasUsuarios = require('./routes/rutasUsuarios');
const rutasRol = require('./routes/rutasRoles');
const rutasProductos =  require('./routes/rutasProductos');
const rutasPedidos = require('./routes/rutasPedidos');
// const rutasAuth = require('./routes/rutasAuth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a 8AM Cafe')
});

// RUTA PUBLICA
app.use('/api/productos', rutasProductos);

// RUTA PROTEGIDA
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/roles', rutasRol);
app.use('/api/pedidos', rutasPedidos);
// app.use('/api/auth', rutasAuth);


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
})