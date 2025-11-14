const express = require('express');
const cors = require('cors');
const port = 3000;

// endpoints
const rutasUsuarios = require('./routes/rutasUsuarios');
// const rutasPedidos = require('');
// const rutasProductos =  require('');
// const rutasEstados = require('');
// const rutasRol = require('');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a 8AM Cafe')
});

app.use('/api/usuarios', rutasUsuarios);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
})