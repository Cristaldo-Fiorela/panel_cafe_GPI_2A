-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS 8AM;
USE 8AM;

-- Tabla: rol
CREATE TABLE rol (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  descripcion VARCHAR(50) NOT NULL
);

-- Tabla: usuario
CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  id_rol INT NOT NULL,
  FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- Tabla: estado
CREATE TABLE estado (
  id_estado INT AUTO_INCREMENT PRIMARY KEY,
  descripcion VARCHAR(50) NOT NULL
);

-- Tabla: pedido
CREATE TABLE pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10, 2) NOT NULL,
  id_usuario INT NOT NULL,
  hora TIME NOT NULL,
  fecha DATE NOT NULL,
  id_estado INT NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  FOREIGN KEY (id_estado) REFERENCES estado(id_estado)
);

-- Tabla: producto
CREATE TABLE producto (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  imagen_url VARCHAR(255),
  stock INT NOT NULL DEFAULT 0,
  disponible BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla: pedido_producto
CREATE TABLE pedido_producto (
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_pedido, id_producto),
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- Insertar roles por defecto
INSERT INTO rol (descripcion) VALUES 
  ('admin'),
  ('barista'),
  ('cliente');

-- Insertar estados por defecto
INSERT INTO estado (descripcion) VALUES 
  ('Pendiente'),
  ('En preparación'),
  ('Listo'),
  ('Entregado'),
  ('Cancelado');

-- Productos de cafetería variados
INSERT INTO producto (nombre, descripcion, precio, imagen_url, stock, disponible) VALUES 
  -- Cafés calientes
  ('Café Americano', 'Café negro clásico, intenso y aromático', 2.50, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e', 100, TRUE),
  ('Café Latte', 'Espresso con leche vaporizada y arte latte', 3.50, 'https://images.unsplash.com/photo-1561047029-3000c68339ca', 85, TRUE),
  ('Cappuccino', 'Espresso con espuma de leche cremosa', 3.75, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d', 90, TRUE),
  ('Flat White', 'Espresso doble con microespuma de leche', 4.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc', 45, TRUE),
  ('Macchiato', 'Espresso con una cucharada de espuma', 3.00, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7', 60, TRUE),
  ('Cortado', 'Espresso cortado con leche caliente', 3.25, 'https://images.unsplash.com/photo-1511920170033-f8396924c348', 0, FALSE),
  ('Mocha', 'Café con chocolate y crema batida', 4.50, 'https://images.unsplash.com/photo-1607260550778-aa9d29444ce1', 70, TRUE),
  ('Caramel Latte', 'Latte con sirope de caramelo', 4.25, 'https://images.unsplash.com/photo-1534778101976-62847782c213', 55, TRUE),
  
  -- Cafés fríos
  ('Cold Brew', 'Café de filtrado en frío, suave y refrescante', 4.00, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7', 40, TRUE),
  ('Iced Latte', 'Latte servido con hielo', 3.75, 'https://images.unsplash.com/photo-1578374173703-9e3ad749eb52', 80, TRUE),
  ('Frappé de Café', 'Café batido con hielo y crema', 5.00, 'https://images.unsplash.com/photo-1562447636-ca2d7d4a6a4a', 35, TRUE),
  ('Iced Americano', 'Americano servido con hielo', 3.00, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7', 10, TRUE),
  
  -- Bebidas especiales
  ('Affogato', 'Helado de vainilla con shot de espresso', 5.50, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 0, FALSE),
  ('Espresso', 'Shot puro de café espresso', 2.00, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04', 120, TRUE),
  ('Espresso Doble', 'Doble shot de espresso', 3.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd', 120, TRUE),
  
  -- Acompañamientos
  ('Medialunas', 'Pack de 3 medialunas recién horneadas', 2.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', 50, TRUE),
  ('Croissant', 'Croissant de manteca artesanal', 3.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', 30, TRUE),
  ('Tostado', 'Tostado mixto con jamón y queso', 4.50, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af', 25, TRUE),
  ('Brownie', 'Brownie de chocolate con nueces', 3.50, 'https://images.unsplash.com/photo-1515037893149-de7f840978e2', 0, FALSE),
  ('Cheesecake', 'Porción de cheesecake de frutos rojos', 5.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad', 15, TRUE),
  ('Muffin', 'Muffin de arándanos', 2.75, 'https://images.unsplash.com/photo-1607478900766-efe13248b125', 40, TRUE),
  ('Cookie', 'Cookie de chips de chocolate', 2.00, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e', 60, TRUE);

-- crear admin inicial 
INSERT INTO usuario (username, password, email, id_rol) 
VALUES (
  'admin', 
  '$2b$10$IYEsbTrQptt758Mtujc7M.RCtT4X/LUG/9R7l9xbonwHPgFMrh0si',
  'admin@8am.com',
  1
);