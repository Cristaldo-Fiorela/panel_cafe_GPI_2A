// services/usuariosService.js
import { authService } from './authService';

const API_URL = 'http://localhost:3000/api/usuarios';

export const usuariosServices = {
  getAll: async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión');
      }

      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al obtener usuarios');
      }
      
      return data;
    } catch (error) {
      console.error('Error en getAll usuarios:', error);
      throw error;
    }
  },
  getOne: async (id) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión');
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
        throw new Error(data.error || 'Error al obtener usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en getOne usuario:', error);
      throw error;
    }
  },
  create: async (nuevoUsuario) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al crear usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en create usuario:', error);
      throw error;
    }
  },
  update: async (usuario) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión');
      }

      const response = await fetch(`${API_URL}/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuario)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en update usuario:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Debes iniciar sesión');
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
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en delete usuario:', error);
      throw error;
    }
  }
};