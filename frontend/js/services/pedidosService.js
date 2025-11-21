import { authService } from './authService.js';

const API_URL = 'http://localhost:3000/api/pedidos';

export const pedidosServices = {
  getAll: async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error('Debes iniciar sesión para ver pedidos');
      }

      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error('Error al obtener pedidos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getAll pedidos:', error);
      throw error;
    }
  },
  getOne: async (id) => {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error('Debes iniciar sesión para ver el pedido');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al obtener pedido');
      }

      return data;
    } catch (error) {
      console.error('Error en getOne pedido:', error);
      throw error;
    }
  },
  create: async (nuevoPedido) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión para crear pedidos');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoPedido)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al crear pedido');
      }

      return data;
    } catch (error) {
      console.error('Error en create pedido:', error);
      throw error;
    }
  },
  updateEstado: async (id, id_estado) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión para actualizar pedidos');
      }

      const response = await fetch(`${API_URL}/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_estado })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al actualizar estado del pedido');
      }

      return data;
    } catch (error) {
      console.error('Error en updateEstado pedido:', error);
      throw error;
    }
  },
  cancelar: async (id) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión para cancelar pedidos');
      }

      const response = await fetch(`${API_URL}/${id}/cancelar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al cancelar pedido');
      }

      return data;
    } catch (error) {
      console.error('Error en cancelar pedido:', error);
      throw error;
    }
  },
  getActivos: async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error('Debes iniciar sesión para ver pedidos activos');
      }

      const response = await fetch(`${API_URL}/activos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error('Error al obtener pedidos activos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getActivos pedidos:', error);
      throw error;
    }
  },
  getEntregados: async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error('Debes iniciar sesión para ver pedidos entregados');
      }

      const response = await fetch(`${API_URL}/entregados`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error('Error al obtener pedidos entregados');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getEntregados pedidos:', error);
      throw error;
    }
  },
  getCancelados: async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error('Debes iniciar sesión para ver pedidos cancelados');
      }

      const response = await fetch(`${API_URL}/cancelados`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error('Error al obtener pedidos cancelados');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getCancelados pedidos:', error);
      throw error;
    }
  }
};