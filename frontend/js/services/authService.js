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

      // Guardar en localStorage (persiste entre pestañas y cierres)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

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

      // Guardar en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = authService.getUser();
    return user?.id_rol === 1;
  },

  isBarista: () => {
    const user = authService.getUser();
    return user?.id_rol === 2;
  },

  isCliente: () => {
    const user = authService.getUser();
    return user?.id_rol === 3;
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
        // Si el token expiró, hacer logout automático
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al obtener perfil');
      }

      // Actualizar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(data));

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
        // Si el token expiró, hacer logout automático
        if (response.status === 401) {
          authService.logout();
        }
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      // Actualizar los datos en localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Error en updateMe:', error);
      throw error;
    }
  }
};