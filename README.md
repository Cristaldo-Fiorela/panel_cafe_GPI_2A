# ☕ Panel Café GPI 2A

Sistema de gestión para cafetería con funcionalidades CRUD y gestión de roles de usuario.

## 📋 Descripción

Trabajo Práctico de Programación Web 2025. Sistema completo de administración para cafetería que incluye gestión de productos, pedidos y usuarios con diferentes niveles de acceso.

## 🚀 Tecnologías

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Base de Datos**: MySQL
- **Herramientas**: Visual Studio Code, MySQL Workbench

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [MySQL](https://www.mysql.com/downloads/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
- [Visual Studio Code](https://code.visualstudio.com/)
- Extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) para VS Code

## 🛠️ Guía de Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Cristaldo-Fiorela/panel_cafe_GPI_2A.git
cd panel_cafe_GPI_2A
```

### 2. Configurar el Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar las dependencias
npm install
```

### 3. Configurar la Base de Datos

#### 3.1 Abrir MySQL Workbench

1. Abre **MySQL Workbench** en tu computadora
2. Conéctate a tu servidor local de MySQL

#### 3.2 Ejecutar el Script de la Base de Datos

1. En MySQL Workbench, abre el archivo `backend/db/schema.sql`
2. Ejecuta el script completo para crear la base de datos y las tablas necesarias
3. Verifica que la base de datos se haya creado correctamente

> **Nota**: El script creará automáticamente las tablas y un usuario administrador de prueba.

### 4. Iniciar el Servidor Backend

```bash
# Asegúrate de estar en la carpeta backend
npm run start
```

El servidor debería iniciarse correctamente y estar escuchando en el puerto configurado (por defecto: 3000).

### 5. Iniciar el Frontend

1. Abre Visual Studio Code
2. Abre la carpeta del proyecto
3. Navega al archivo principal del frontend (por ejemplo, `index.html` en la carpeta `frontend`)
4. Haz clic derecho sobre el archivo y selecciona **"Open with Live Server"**
5. El navegador se abrirá automáticamente con la aplicación

## 🔑 Credenciales de Acceso

Para acceder al panel administrativo, utiliza las siguientes credenciales de prueba:

```
Usuario: admin
Contraseña: admin123
Email: admin@8am.com
```

> ⚠️ **Importante**: Estas son credenciales de prueba. Se recomienda cambiarlas en un entorno de producción.

## 📁 Estructura del Proyecto

```
panel_cafe_GPI_2A/
├── backend/
│   ├── db/
│   │   └── schema.sql      # Script de creación de la base de datos
│   ├── node_modules/       # Dependencias del proyecto
│   ├── package.json        # Configuración y dependencias
│   └── ...                 # Otros archivos del backend
├── frontend/
│   ├── index.html          # Página principal
│   ├── css/                # Estilos
│   ├── js/                 # Scripts del frontend
│   └── ...                 # Otros archivos del frontend
└── README.md
```

## 👥 Contribución

Este es un proyecto académico de Programación Web 2025. Las contribuciones son bienvenidas siguiendo las buenas prácticas de desarrollo.

## 📝 Licencia

Este proyecto es parte de un trabajo práctico educativo.

## 📞 Contacto

Para consultas sobre el proyecto, contactar a través del repositorio de GitHub.

---

⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub
