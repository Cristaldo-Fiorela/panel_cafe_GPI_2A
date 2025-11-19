const API_URL = 'http://localhost:3000/api/auth';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // guardar en sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // guardar en sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  },
  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  },
  getToken: () => {
    return sessionStorage.getItem('token');
  },
  getUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },
  isAdmin: () => {
    const user = authService.getUser();
    return user?.id_rol === 1;
  },
  getMe: async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener perfil');
      }

      return data;
    } catch (error) {
      console.error('Error en getMe:', error);
      throw error;
    }
  },
  updateMe: async (userData) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      // actualiza los datos en sessionStorage
      sessionStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Error en updateMe:', error);
      throw error;
    }
  }
};