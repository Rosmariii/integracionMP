require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const express = require('express');
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
      const { items } = req.body;
      if (!items || items.length === 0) {
        return res.status(400).json({
          error: 'No se proporcionaron productos',
          details: 'Se requiere al menos un producto para crear la preferencia'
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Default for local dev
  
      const preferenceData = {
        items: items.map(item => ({
          title: item.name,
          description: item.description,
          quantity: 1,
          unit_price: item.price,
          currency_id: 'ARS'
        })),
        payer: {
          name: 'Cliente',
          surname: 'Genérico',
          email: 'cliente@ejemplo.com'
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
  

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
