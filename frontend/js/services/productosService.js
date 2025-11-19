const API_URL = 'http://localhost:3000/api/productos';

export const productosServices = {

  getAll: async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) throw new Error('Error al obtener productos');
      
      return await response.json();      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  getOne: async(id) => {
    try {
      const response =  await fetch(`${API_URL}/${id}`);

      if(!response.ok) {
        throw new Error(data.error || 'Error al obtener producto.')
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Error en getOne de producto', error);
      throw error;
    }
  },
  create: async (nuevoProducto) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
      })

      const data = await response.json();

      if(!response.ok) {
        throw new Error(data.error || 'Error al crear producto.')
      }

      return data;
    } catch (error) {
      console.log('Error en create de producto', error);
      throw error;
    }
  },
  update: async (producto) => {
    const { id } = producto;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto),
      })

      if(!response.ok) {
        throw new Error('Error al actualizar producto');
      }

      return await response.json();
    } catch (err) {
      console.log('Error en update de producto', err);
      throw err;
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE' 
      });

      const data = await parseJSON(response);

      if (!response.ok) {
        throw new Error(data?.error || 'Error al eliminar producto.');
      }
      return data;
    } catch (error) {
      console.log('Error en eliminarIntegrante', error);
      throw error;
    }
  }
};