# Registro de Cambios

## [1.2.0] - 2025-06-02
### 🚀 Mejoras
- **Integración de Mapas en Historial de Compras**
  - Añadida visualización de mapas en el detalle de cada orden
  - Implementado guardado de coordenadas en el registro de usuarios
  - Optimizado el rendimiento al guardar coordenadas en el backend

### 🔧 Backend
- Agregada geocodificación automática de direcciones
- Creado endpoint `/api/update-users-coords` para actualizar usuarios existentes
- Mejorado el manejo de errores en login/registro
- Corregidas declaraciones duplicadas en el código

### 🎨 Frontend
- Creado componente `OrderMap` para mostrar ubicaciones
- Mejorada la interfaz del historial de compras
- Añadidos estilos CSS para mapas y tarjetas de órdenes
- Implementada carga condicional de mapas

## [1.1.0] - 2025-06-01
### ✨ Características
- Implementado historial de compras con filtros y búsqueda
- Añadida descarga de historial en CSV
- Mejorada la interfaz de usuario del perfil

## [1.0.0] - 2025-05-31
### 🎉 Lanzamiento Inicial
- Integración con Mercado Pago
- Sistema de autenticación
- Carrito de compras
- Páginas de estado de pago

## 📦 Dependencias
- `leaflet`: ^1.9.4
- `react-leaflet`: ^4.2.1
- `mercadopago`: ^1.5.14
- `node-fetch`: ^2.6.9

## 📝 Notas de Instalación
```bash
# Instalar dependencias
cd frontend && npm install
cd ../backend && npm install

# Iniciar servidores
cd ../backend && npm start
# En otra terminal
cd ../frontend && npm start
```

## 🔜 Próximas Mejoras
- [ ] Integración con APIs de seguimiento de envíos
- [ ] Notificaciones en tiempo real
- [ ] Panel de administración
- [ ] Sistema de reseñas

---
*Este archivo sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)*
