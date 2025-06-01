require('dotenv').config();
const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const { addUser, findUserByEmail, findUserByUsername, hashPassword, verifyPassword } = require('./userController');

// Configuración de rutas
const usersFilePath = path.join(__dirname, 'users.json');

// Geocodificar dirección a coordenadas
const geocode = async (address) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
  } catch (e) {
    console.error('Error en geocoding:', e);
  }
  return null;
};
const { addOrder, readOrders } = require('./orderController');
const cors = require('cors');

// 1. Verificar que exista el token en .env
if (!process.env.MP_ACCESS_TOKEN) {
  console.error('Error: No se encontró MP_ACCESS_TOKEN en .env');
  process.exit(1);
}

// 2. Instanciar el cliente con MercadoPagoConfig
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const app = express();
app.use(cors());
app.use(express.json());

// Registro de usuario
app.post('/api/register', async (req, res) => {
  const { username, password, email, nombre, apellido, direccion, pais, ciudad, codigoPostal, telefono } = req.body;

  // Validación básica
  if (!username || !password || !email || !nombre || !apellido || !direccion || !pais || !ciudad || !codigoPostal) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  if (findUserByUsername(username)) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese nombre de usuario' });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
  }

  // Obtener coordenadas de la dirección
  const direccionCompleta = `${direccion}, ${ciudad}, ${pais}`;
  const coords = await geocode(direccionCompleta);

  const hashedPassword = hashPassword(password);
  const user = {
    username,
    password: hashedPassword,
    email,
    nombre,
    apellido,
    direccion,
    pais,
    ciudad,
    codigoPostal,
    telefono,
    coords // Guardamos las coordenadas
  };

  addUser(user);
  
  // No devolver la contraseña
  const { password: _, ...userData } = user;
  return res.status(201).json({ 
    message: 'Usuario registrado exitosamente', 
    user: userData 
  });
});

// Login de usuario
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan usuario o contraseña' });
  }
  const user = findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  
  if (!verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  
  // Si el usuario no tiene coordenadas, intentar obtenerlas
  if (!user.coords && user.direccion && user.ciudad && user.pais) {
    try {
      const direccionCompleta = `${user.direccion}, ${user.ciudad}, ${user.pais}`;
      const coords = await geocode(direccionCompleta);
      
      if (coords) {
        // Actualizar usuario con las nuevas coordenadas
        user.coords = coords;
        
        // Guardar el usuario actualizado
        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        const updatedUsers = users.map(u => 
          u.username === user.username ? { ...u, coords } : u
        );
        fs.writeFileSync(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        
        console.log(`Coordenadas actualizadas para el usuario: ${user.username}`);
      }
    } catch (error) {
      console.error('Error al actualizar coordenadas:', error);
    }
  }
  
  // No devolver la contraseña
  const { password: _, ...userData } = user;
  return res.json({ message: 'Login exitoso', user: userData });
});

// Consultar estado de pago en Mercado Pago
app.get('/api/order-status/:preferenceId', async (req, res) => {
  const { preferenceId } = req.params;
  if (!preferenceId) return res.status(400).json({ error: 'Falta preferenceId' });
  try {
    // Buscar pagos asociados a la preferencia
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${preferenceId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    const data = await mpRes.json();
    // El array "results" puede estar vacío si aún no hay pago
    if (data.results && data.results.length > 0) {
      // Tomar el más reciente
      const payment = data.results[0];
      return res.json({
        status: payment.status,
        status_detail: payment.status_detail,
        payment_id: payment.id,
        payment_method: payment.payment_method_id,
        amount: payment.transaction_amount,
        date_created: payment.date_created,
        raw: payment
      });
    } else {
      return res.json({ status: 'pending', status_detail: 'no_payment_found' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Error consultando Mercado Pago', details: e.message });
  }
});

// Historial de compras de un usuario
app.get('/api/orders/:username', (req, res) => {
  const username = req.params.username;
  if (!username) return res.status(400).json({ error: 'Falta username' });
  const orders = readOrders().filter(order => order.user && order.user.username === username);
  res.json(orders);
});

// Ruta para actualizar usuarios existentes (solo para desarrollo)
app.get('/api/update-users-coords', async (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    let updated = 0;
    
    for (const user of users) {
      if (!user.coords && user.direccion && user.ciudad && user.pais) {
        const direccionCompleta = `${user.direccion}, ${user.ciudad}, ${user.pais}`;
        const coords = await geocode(direccionCompleta);
        
        if (coords) {
          user.coords = coords;
          updated++;
        }
      }
    }
    
    if (updated > 0) {
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      return res.json({ message: `Se actualizaron ${updated} usuarios con coordenadas` });
    }
    
    return res.json({ message: 'No se encontraron usuarios para actualizar' });
  } catch (error) {
    console.error('Error al actualizar usuarios:', error);
    return res.status(500).json({ error: 'Error al actualizar usuarios' });
  }
});

// 3. Ruta para devolver productos (no hace falta tocarla)
app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'Producto 1', description: 'Desc 1', price: 1000, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Producto 2', description: 'Desc 2', price: 1500, image: 'https://via.placeholder.com/150' }
  ];
  res.json(products);
});

// 4. Endpoint para crear preferencia
app.post('/api/create-preference', async (req, res) => {
    try {
      const { items, user } = req.body;
      if (!items || items.length === 0) {
        return res.status(400).json({
          error: 'No se proporcionaron productos',
          details: 'Se requiere al menos un producto para crear la preferencia'
        });
      }
      if (!user || !user.username || !user.email) {
        return res.status(400).json({
          error: 'No se proporcionó usuario logueado',
          details: 'La compra debe estar asociada a un usuario.'
        });
      }

      // Remove trailing slash if present to avoid double slashes in back_urls
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''); // Default for local dev
console.log('frontendUrl:', frontendUrl);
  
      const preferenceData = {
        items: items.map(item => ({
          title: item.name,
          description: item.description,
          quantity: 1,
          unit_price: item.price,
          currency_id: 'ARS'
        })),
        payer: {
          name: user.nombre || 'Cliente',
          surname: user.apellido || '',
          email: user.email || ''
        },
        back_urls: {
          success: `${frontendUrl}/success`,
          failure: `${frontendUrl}/failure`,
          pending: `${frontendUrl}/pending`
        },
        external_reference: `order_${Date.now()}`
      };
  
      console.log('Intentando crear preferencia con este body:', preferenceData);
      const preferenceResource = new Preference(client);
  
      let preferenceResult;
      try {
        preferenceResult = await preferenceResource.create({ body: preferenceData });
        console.log('Respuesta completa de Mercado Pago:', preferenceResult);
      } catch (mpError) {
        console.error('Mercado Pago devolvió error al crear preferencia:', mpError);
        return res.status(500).json({
          error: 'Error al crear la preferencia',
          details: mpError.message,
          raw: mpError
        });
      }

      // Buscar el id de preferencia de forma robusta
      let data = null;
      if (preferenceResult && preferenceResult.body && preferenceResult.body.id) {
        data = preferenceResult.body;
      } else if (preferenceResult && preferenceResult.response && preferenceResult.response.id) {
        data = preferenceResult.response;
      } else if (preferenceResult && preferenceResult.id) {
        data = preferenceResult;
      }

      if (!data || !data.id) {
        console.error('No llegó ID en la respuesta. Objeto completo:', preferenceResult);
        return res.status(500).json({
          error: 'No se recibió ID de preferencia',
          details: 'La respuesta no contiene ningún id válido',
          raw: preferenceResult
        });
      }

      console.log('ID de preferencia creado:', data.id);
      console.log('init_point:', data.init_point);

      // Guardar orden en orders.json
      addOrder({
        timestamp: new Date().toISOString(),
        user,
        items,
        preferenceId: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point
      });
      // Finalmente, devolvemos al front-end el id y el init_point
      return res.json({
        id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point // si quieres incluir la URL de testing
      });
    } catch (error) {
      console.error('Error general en create-preference:', error);
      return res.status(500).json({
        error: 'Error al crear preferencia',
        details: error
      });
    }
  });

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor backend corriendo en puerto ${port}`);
});
