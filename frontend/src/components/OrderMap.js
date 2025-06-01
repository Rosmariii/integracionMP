import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir el ícono del marcador
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const OrderMap = ({ coords }) => {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  useEffect(() => {
    if (!coords || !coords.lat || !coords.lon) return;
    
    const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lon], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    L.marker([coords.lat, coords.lon])
      .addTo(map)
      .bindPopup('Ubicación de entrega')
      .openPopup();
    
    mapRef.current = map;
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [coords]);

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: 220, borderRadius: 12, marginTop: 10, boxShadow: '0 2px 8px #0001' }} />
  );
};

export default OrderMap;
