require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verificarToken, esAdmin } = require('./middleware/auth');
const port = process.env.PORT || 3000;

// endpoints
const rutasUsuarios = require('./routes/rutasUsuarios');
const rutasRol = require('./routes/rutasRoles');
const rutasProductos =  require('./routes/rutasProductos');
const rutasPedidos = require('./routes/rutasPedidos');
const rutasAuth = require('./routes/rutasAuth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a 8AM Cafe')
});

// RUTA PUBLICA
app.use('/api/auth', rutasAuth);

// RUTA MIXTA
app.use('/api/productos', rutasProductos); // Create, Update y Delete protegidos 
app.use('/api/pedidos', rutasPedidos); // GETS por estados, EDIT para admin
// RUTAS ADMIN
app.use('/api/usuarios', verificarToken, esAdmin, rutasUsuarios);
app.use('/api/roles', verificarToken, esAdmin, rutasRol);


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
})