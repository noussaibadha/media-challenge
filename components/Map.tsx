// components/Map.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface AddressProps {
  addresses: string[];
}

interface MarkerData {
  lat: number;
  lng: number;
  label: string;
}

// Fix icônes Leaflet dans Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Map: React.FC<AddressProps> = ({ addresses }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const geocodeAddresses = async () => {
      setLoading(true);
      const results: MarkerData[] = [];

      for (const address of addresses) {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`;
          const res = await fetch(url, {
            headers: {
              'Accept-Language': 'fr',
              'User-Agent': 'NextjsLeafletDemo/1.0 (contact@example.com)', // Remplacer par votre email
            },
          });
          const data = await res.json();
          if (data && data[0]) {
            results.push({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
              label: address,
            });
          }
        } catch (error) {
          console.error(`Erreur géocodage pour "${address}":`, error);
        }
      }

      setMarkers(results);
      setLoading(false);
    };

    if (addresses.length > 0) {
      geocodeAddresses();
    } else {
      setMarkers([]);
      setLoading(false);
    }
  }, [addresses]);

  const center = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : [48.8566, 2.3522]; // Paris par défaut

  return (
    <div style={{ height: 400, width: '100%' }}>
      {loading && <p>Chargement des adresses...</p>}
      {!loading && (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker, idx) => (
            <Marker key={idx} position={[marker.lat, marker.lng]}>
              <Popup>{marker.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default Map;
