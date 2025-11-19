import { authService } from './authService';

const API_URL = 'http://localhost:3000/api/productos';

export const productosServices = {
  getAll: async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getAll productos:', error);
      throw error;
    }
  },
  getOne: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener producto');
      }

      return data;
    } catch (error) {
      console.error('Error en getOne producto:', error);
      throw error;
    }
  },
  create: async (nuevoProducto) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión para crear productos');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoProducto)
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el token expiró
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al crear producto');
      }

      return data;
    } catch (error) {
      console.error('Error en create producto:', error);
      throw error;
    }
  },
  update: async (producto) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión para actualizar productos');
      }

      const response = await fetch(`${API_URL}/${producto.id_producto}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(producto)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al actualizar producto');
      }

      return data;
    } catch (error) {
      console.error('Error en update producto:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión para eliminar productos');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al eliminar producto');
      }

      return data;
    } catch (error) {
      console.error('Error en delete producto:', error);
      throw error;
    }
  }
};