// SERVICIOS
import {  productosServices } from './services/productosService.js';
import { pedidosServices } from './services/pedidosService.js';
import { authService } from './services/authService.js';

// DOM containers
const productsContainer = document.querySelector('.products-grid');
const cartItemsContainer = document.querySelector('.cart-items');
const confirmOrderButton = document.querySelector('.confirm-btn');
const totalOrderElement = document.querySelector('.order-totals .total-row.final span:last-child');
const userMenu = document.querySelector('.user-menu');

// VARIABLES 
let shoppingCart = [];
let productsAvailable = [];

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
    logoutBtn.addEventListener('click', (e) => {
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
productsContainer.addEventListener('click', (e) => {
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
cartItemsContainer.addEventListener('click', (e) => {
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
confirmOrderButton.addEventListener('click', createOrder);

// ============= INICIALIZACIÓN =============
document.addEventListener('DOMContentLoaded', () => {
  renderAuthUI();
  getProducts();
  loadCartSS();
});