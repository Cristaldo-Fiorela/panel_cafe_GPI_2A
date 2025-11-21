import { authService } from './authService.js';

const API_URL = 'http://localhost:3000/api/estados';

export const estadosServices = {
  getAll: async () => {
    try {  
      const token = authService.getToken();

      if (!token) {
        throw new Error('Debes iniciar sesión para ver estados');
      }

      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estados');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getAll estados:', error);
      throw error;
    }
  },
  getOne: async (id) => {
    try {

      const token = authService.getToken();

      if (!token) {
        throw new Error('Debes iniciar sesión para ver estados');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener estado');
      }

      return data;
    } catch (error) {
      console.error('Error en getOne estado:', error);
      throw error;
    }
  },
};