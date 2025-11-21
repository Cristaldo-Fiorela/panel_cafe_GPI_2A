// SERVICIOS
import {  productosServices } from './services/productosService.js';
import { pedidosServices } from './services/pedidosService.js';
import { estadosServices } from './services/estadosService.js';
import { authService } from './services/authService.js';

// DOM containers
const productsContainer = document.querySelector('.products-grid');
const cartItemsContainer = document.querySelector('.cart-items');
const confirmOrderButton = document.querySelector('.confirm-btn');
const totalOrderElement = document.querySelector('.order-totals .total-row.final span:last-child');
const userMenu = document.querySelector('.user-menu');
console.log(userMenu);

// FORMS
const loginForm = document.getElementById('login')

// VARIABLES 
let shoppingCart = [];
let productsAvailable = [];
let estadosDisponibles = [];

// ADMIN VAR
let pedidosActivos = [];
let todosPedidos = [];
let vistaActual = 'activos';


function renderAuthUI() {
  const user = authService.getUser();

  if (user) {
    // Usuario logueado - mostrar menú
    userMenu.innerHTML = `
      <button class="user-button" aria-label="Abrir menú de usuario" aria-haspopup="true">
        <span class="user-name">${user.username}</span>
        <div class="user-avatar" role="img" aria-label="Foto de perfil de ${user.username}"
          style='background-image: url("https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=d46211&color=fff");'>
        </div>
      </button>
      <div class="user-dropdown" role="menu">
        <a href="/perfil.html" class="dropdown-link" role="menuitem">Mi Perfil</a>
        <a href="/pedidos.html" class="dropdown-link" role="menuitem">Historial de Pedidos</a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-link danger logout-btn" role="menuitem">Cerrar Sesión</button>
      </div>
    `;

    // Event listener para logout
    const logoutBtn = userMenu.querySelector('.logout-btn');
    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        authService.logout();
      }
    });

  } else {
    userMenu.innerHTML = `
      <a href="/frontend/pages/login.html" class="login-btn">
        <span>Iniciar Sesión</span>
      </a>
    `;
  }
}

function protectAdminRoute() {
  if (!authService.isAuthenticated()) {
    window.location.href = '/frontend/pages/login.html';
    return;
  }

  if (!authService.isAdmin() && !authService.isBarista()) {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = '/frontend/index.html';
    return;
  }
}

function formatDate(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatHour(hora) {
  return hora.substring(0, 5);
}

// ============= INDEX  ==================

function addToCart(producto) {
  const itemAlreadyExist = shoppingCart.find(item => item.id_producto === producto.id_producto);

  if(itemAlreadyExist) {
    itemAlreadyExist.cantidad ++;
  } else {
    shoppingCart.push({
      ...producto,
      cantidad: 1
    })
  }

  updateCart();
  saveCartSS();
}

function updateProductAmount(idProducto, cambio) {
  const item = shoppingCart.find(item => item.id_producto === idProducto);
  
  if (item) {
    item.cantidad += cambio;
    
    if (item.cantidad <= 0) {
      shoppingCart = shoppingCart.filter(item => item.id_producto !== idProducto);
    }
    
    updateCart();
    saveCartSS();
  }
}

function calculateTotal() {
  const total = shoppingCart.reduce((total, item) => {
    return total + (item.precio * item.cantidad);
  }, 0);
  
  return {
    total: total.toFixed(2)
  };
}

function renderCartItem(producto) {
  const { id_producto, nombre, imagen_url, precio, cantidad} = producto;
  return `
    <article class="cart-item" data-product-id="${id_producto}">
      <div class="cart-item-image" role="img" aria-label="${nombre}"
        style="background-image: url('${imagen_url}');">
      </div>
      <div class="cart-item-info">
        <h3 class="cart-item-name">${nombre}</h3>
        <p class="cart-item-price">$${precio}</p>
      </div>
      <div class="quantity-control">
        <button class="quantity-btn decrease" aria-label="Disminuir cantidad de ${nombre}">-</button>
        <span class="quantity-value">${cantidad}</span>
        <button class="quantity-btn increase" aria-label="Aumentar cantidad de ${nombre}">+</button>
      </div>
    </article>
  `;
}

function updateCart() {
  // Si el carrito está vacío
  if (shoppingCart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
    confirmOrderButton.disabled = true;
    totalOrderElement.textContent = '$0.00';
    return;
  }
  
  // Renderizar items del carrito
  cartItemsContainer.innerHTML = shoppingCart.map(producto => renderCartItem(producto)).join('');
  
  // Calcular y actualizar totales
  const total = calculateTotal();
  console.log(total);
  totalOrderElement.textContent = `$${total.total}`;
  confirmOrderButton.disabled = false;
}

function saveCartSS() {
  sessionStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
}

function loadCartSS() {
  const saveShoppingCart = sessionStorage.getItem('shoppingCart');
  if (saveShoppingCart) {
    shoppingCart = JSON.parse(saveShoppingCart);
    updateCart();
  }
}

function emptyCart() {
  shoppingCart = [];
  updateCart();
  saveCartSS();
}

function productCard(data) {
  const {id_producto, descripcion, disponible, imagen_url, nombre, precio } = data;
  
  const card = `
    <div class="product-image ${disponible == 0 ? 'out-of-stock' : ''}" 
         role="img" 
         aria-label="${descripcion}"
         style="background-image: url(${imagen_url});">
      ${disponible == 0 ? '<div class="stock-badge">Sin Stock</div>' : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name">${nombre}</h3>
      <p class="product-description">${descripcion}</p>
      <footer class="product-footer">
        <span class="product-price">$${precio}</span>
        <button class="add-to-cart-btn" 
                ${disponible == 0 ? 'disabled' : ''} 
                data-product-id="${id_producto}"
                aria-label="Agregar ${nombre} al carrito">
          <span class="material-symbols-outlined" aria-hidden="true">🛒</span>
          <span>${disponible == 0 ? 'Sin Stock' : 'Agregar'}</span>
        </button>
      </footer>
    </div>
  `;
  
  return card;
}

function renderProducts(products) {
  productsContainer.innerHTML = "";

  if(products.length !== 0) {
    products.forEach(product => {
      const article = document.createElement('article');
      article.classList.add('product-card');
      if (product.disponible == 0) {
        article.classList.add('disabled');
      }
      article.dataset.id = product.id_producto;
      article.innerHTML = productCard(product);
      productsContainer.appendChild(article);
    });
    
    // Guardar productos disponibles para usarlos después
    productsAvailable = products;
  }
}

async function getProducts() {
  try {
    const products = await productosServices.getAll();
    renderProducts(products);
  } catch (err) {
    emptyCart();
    console.error("Error al cargar productos:", err);
  }
}

// ============= CREAR PEDIDO =============
async function createOrder() {
  try {
    // Validar carrito vacío
    if (shoppingCart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Obtener usuario actual
    const usuario = authService.getUser();
    if (!usuario) {
      alert('Debes iniciar sesión para realizar un pedido');
      return;
    }

    // Fecha y hora actual
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = ahora.toTimeString().split(' ')[0]; // HH:MM:SS

    // Calcular total
    const { total } = calculateTotal();

    // Preparar productos
    const productos = shoppingCart.map(item => ({
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: parseFloat(item.precio)
    }));

    // Objeto del pedido
    const nuevoPedido = {
      total: parseFloat(total),
      id_usuario: usuario.id,
      hora: hora,
      fecha: fecha,
      id_estado: 1, // Pendiente
      productos: productos
    };

    console.log('Enviando pedido:', nuevoPedido);

    // Deshabilitar botón
    confirmOrderButton.disabled = true;
    confirmOrderButton.textContent = 'Procesando...';

    // Enviar pedido
    const resultado = await pedidosServices.create(nuevoPedido);

    // Éxito
    alert(`¡Pedido creado exitosamente! ID: ${resultado.id_pedido}`);
    emptyCart();

  } catch (error) {
    console.error('Error al crear pedido:', error);
    alert('Error al crear el pedido: ' + error.message);
  } finally {
    confirmOrderButton.disabled = false;
    confirmOrderButton.textContent = 'Confirmar Pedido';
  }
}

// ============= EVENT LISTENERS =============

// Agregar productos al carrito
productsContainer?.addEventListener('click', (e) => {
  const button = e.target.closest('.add-to-cart-btn');
  if (button && !button.disabled) {
    const productId = parseInt(button.dataset.productId);
    const producto = productsAvailable.find(p => p.id_producto === productId);
    
    if (producto) {
      addToCart(producto);
      
      // Feedback visual
      const originalContent = button.innerHTML;
      button.innerHTML = '<span>✓ Agregado</span>';
      setTimeout(() => {
        button.innerHTML = originalContent;
      }, 1000);
    }
  }
});

// Controles de cantidad en el carrito
cartItemsContainer?.addEventListener('click', (e) => {
  const button = e.target.closest('.quantity-btn');
  if (button) {
    const cartItem = button.closest('.cart-item');
    const productId = parseInt(cartItem.dataset.productId);
    
    if (button.classList.contains('increase')) {
      updateProductAmount(productId, 1);
    } else if (button.classList.contains('decrease')) {
      updateProductAmount(productId, -1);
    }
  }
});

// Confirmar pedido
confirmOrderButton?.addEventListener('click', createOrder);

// LOGIN
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // datos del form
  const formData = new FormData(e.target);
  const usernameOrEmail = formData.get('username');
  const password = formData.get('password');

  if (!usernameOrEmail || !password) {
    alert('Por favor, completa todos los campos');
    return;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');

  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Iniciando sesión...';
 
    const response = await authService.login({
      username: usernameOrEmail,
      password: password
    });

    if (response.user) {      // para seguridad
      e.target.reset();
      
      // Redirigir según el rol del usuario
      if (authService.isAdmin()) {
        window.location.href = '/frontend/pages/admin.html';
      } else if (authService.isBarista()) {
        window.location.href = '/frontend/pages/admin.html';
      } else if (authService.isCliente()) {
        window.location.href = '/frontend/index.html';
      } else {
        window.location.href = '/frontend/index.html';
      }
    }

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert(error.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.');
    
    // Rehabilitar el botón
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.textContent = 'Iniciar Sesión';
    
    // por seguridad
    document.getElementById('password').value = '';
  }

});

// ================ ADMIN =======================
async function getEstados() {
  try {
    estadosDisponibles = await estadosServices.getAll();
  } catch (error) {
    console.error('Error al cargar estados desde backend:', error);
    alert('Error al cargar los estados. Por favor, recarga la página.');
    estadosDisponibles = [];
  }
}

function getEstadosInfo(idEstado) {
  const estado = estadosDisponibles.find(e => e.id_estado === idEstado);
  
  // ! clases de css para cada estado
  const mapeoClases = {
    'Pendiente': 'status-pending',
    'En preparación': 'status-in-prep',
    'En Preparación': 'status-in-prep',
    'Listo': 'status-ready',
    'Entregado': 'status-delivered',
    'Entregada': 'status-delivered',
    'Cancelado': 'status-cancelled',
    'Cancelada': 'status-cancelled'
  };
  
  if (estado) {
    return {
      texto: estado.nombre,
      clase: mapeoClases[estado.nombre] || 'status-pending'
    };
  }
  
  // Fallback si no se encuentra el estado
  return { texto: 'Desconocido', clase: 'status-pending' };
}

function getBtnAction(pedido) {
  const { id_pedido, id_estado } = pedido;
  
  switch(id_estado) {
    case 1: // Pendiente
      return `
        <button class="action-btn btn-prep" data-pedido-id="${id_pedido}" data-nuevo-estado="2">
          Marcar en Preparación
        </button>
      `;
    case 2: // En preparación
      return `
        <button class="action-btn btn-ready" data-pedido-id="${id_pedido}" data-nuevo-estado="3">
          Marcar como Listo
        </button>
      `;
    case 3: // Listo
      return `
        <button class="action-btn btn-delivered" data-pedido-id="${id_pedido}" data-nuevo-estado="4">
          Marcar Entregado
        </button>
      `;
    case 4: // Entregado
      return `
        <button class="action-btn btn-disabled" disabled>
          Completado
        </button>
      `;
    case 5: // Cancelado
      return `
        <button class="action-btn btn-disabled" disabled>
          Cancelado
        </button>
      `;
    default:
      return `<button class="action-btn btn-disabled" disabled>-</button>`;
  }
}

function getOrderDetail(productos) {
  if (!productos || productos.length === 0) {
    return 'Sin productos';
  }
  
  return productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
}

function renderUIRowOrder(pedido) {
  const estadoInfo = getEstadosInfo(pedido.id_estado);
  const detalle = getOrderDetail(pedido.productos);
  
  return `
    <tr>
      <td>#${pedido.id_pedido}</td>
      <td>${formatHour(pedido.hora)}</td>
      <td>${formatDate(pedido.fecha)}</td>
      <td>${pedido.nombre_cliente || 'Cliente'}</td>
      <td>${detalle}</td>
      <td>
        <span class="status-badge ${estadoInfo.clase}">${estadoInfo.texto}</span>
      </td>
      <td>
        ${getBtnAction(pedido)}
      </td>
    </tr>
  `;
}

function renderOrdersTable(pedidos) {
  const tbody = document.querySelector('.table-wrapper tbody');
  
  if (!tbody) return;
  
  if (pedidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem;">
          No hay pedidos para mostrar
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = pedidos.map(pedido => renderUIRowOrder(pedido)).join('');
}

function updateStats(pedidos) {
  const statValue = document.querySelector('.stat-value');
  
  if (!statValue) return;
  
  // contar pedidos pendientes
  const pendientes = pedidos.filter(p => p.id_estado === 1).length;
  statValue.textContent = pendientes;
}

async function getOrders() {
  try {
    if (vistaActual === 'activos') {
      pedidosActivos = await pedidosServices.getActivos();
      renderOrdersTable(pedidosActivos);
      updateStats(pedidosActivos);
    } else {
      todosPedidos = await pedidosServices.getAll();
      renderOrdersTable(todosPedidos);
      updateStats(todosPedidos);
    }
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    alert('Error al cargar los pedidos: ' + error.message);
  }
}

async function changeOrderEstado(idPedido, nuevoEstado) {
  try {
    await pedidosServices.updateEstado(idPedido, nuevoEstado);
    
    // Recargar pedidos
    await getOrders();
    
    // Feedback visual
    alert('Estado actualizado correctamente');
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert('Error al cambiar el estado: ' + error.message);
  }
}

function navConfig() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remover active de todos
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Agregar active al clickeado
      link.classList.add('active');
      
      const texto = link.textContent.trim();
      
      if (texto === 'Dashboard' || texto === 'Órdenes Activas') {
        vistaActual = 'activos';
        document.querySelector('#orders-heading').textContent = 'Órdenes Activas';
        getOrders();
      }
    });
  });
}

function configFilters() {
  const statusFilter = document.getElementById('status-filter');
  
  if (!statusFilter) return;
  
  // Llenar el select con los estados del backend
  statusFilter.innerHTML = '<option value="">Todos los estados</option>';
  estadosDisponibles.forEach(estado => {
    const option = document.createElement('option');
    option.value = estado.id_estado;
    option.textContent = estado.nombre;
    statusFilter.appendChild(option);
  });
  
  // Event listener para filtrar
  statusFilter.addEventListener('change', (e) => {
    const idEstadoSeleccionado = e.target.value;
    const pedidosActuales = vistaActual === 'activos' ? pedidosActivos : todosPedidos;
    
    // Si no hay filtro, mostrar todos
    if (!idEstadoSeleccionado) {
      renderizarTablaPedidos(pedidosActuales);
      return;
    }
    
    // Filtrar por ID de estado
    const pedidosFiltrados = pedidosActuales.filter(
      p => p.id_estado === parseInt(idEstadoSeleccionado)
    );
    renderizarTablaPedidos(pedidosFiltrados);
  });
}

function btnsActionConfig() {
  const tableWrapper = document.querySelector('.table-wrapper');
  
  if (!tableWrapper) return;
  
  tableWrapper.addEventListener('click', async (e) => {
    const button = e.target.closest('.action-btn');
    
    if (button && !button.disabled) {
      const idPedido = parseInt(button.dataset.pedidoId);
      const nuevoEstado = parseInt(button.dataset.nuevoEstado);
      
      if (idPedido && nuevoEstado) {
        // Deshabilitar botón mientras procesa
        button.disabled = true;
        button.textContent = 'Procesando...';
        
        await changeOrderEstado(idPedido, nuevoEstado);
      }
    }
  });
}

function refreshOrders() {
  setInterval(() => {
    getOrders();
  }, 60000);
}

async function adminPanel() {
  const page = window.location.pathname;
  
  // Solo ejecutar en admin.html
  if (!page.includes('admin.html')) return;
  
  // Proteger ruta
  protectAdminRoute();
  
  // Cargar estados primero (necesarios para renderizar)
  await getEstados();
  
  // Configurar UI
  renderAuthUI();
  navConfig();
  configFilters();
  btnsActionConfig();
  
  // Cargar datos iniciales
  await getOrders();
  
  // Iniciar actualización automática
  refreshOrders();
}

// ============= INICIALIZACIÓN =============
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname;

  if (page.endsWith('index.html') || page.endsWith('/')) {
    renderAuthUI();
    getProducts();
    loadCartSS();
  }

  if (page.includes('admin.html')) {
    adminPanel();
  }
});
