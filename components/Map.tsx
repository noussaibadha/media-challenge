// components/Map.tsx
'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Article {
  id: string;
  title: string;
  description: string;
  img: string;
  adress: string;
  categorie: string;
  affluence: string;
}

interface MapProps {
  articles: Article[];
  onMarkerClick?: (article: Article) => void;
  selectedArticle?: Article | null;
}

interface MarkerData {
  lat: number;
  lng: number;
  article: Article;
}

// Fix icônes Leaflet dans Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Cache pour les adresses géocodées
const geocodeCache = new globalThis.Map<string, { lat: number; lng: number } | null>();

// Créer des icônes personnalisées selon la catégorie
const createCustomIcon = (category: string, isSelected: boolean = false) => {
  const getColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'rock': return '#ef4444';
      case 'rap': return '#8b5cf6';
      case 'electro': return '#06b6d4';
      case 'jazz': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const color = getColor(category);
  const size = isSelected ? 40 : 30;

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.4}px;
        ${isSelected ? 'transform: scale(1.2); z-index: 1000;' : ''}
      ">
        🎵
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Service de géocodage avec cache et gestion d'erreurs améliorée
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // Vérifier le cache d'abord
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address) || null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Paris, France')}&limit=1`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SpotIn-App/1.0'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };

      // Vérifier que les coordonnées sont valides
      if (isNaN(coords.lat) || isNaN(coords.lng)) {
        geocodeCache.set(address, null);
        return null;
      }

      geocodeCache.set(address, coords);
      return coords;
    }

    geocodeCache.set(address, null);
    return null;
  } catch (error) {
    console.warn(`Géocodage échoué pour "${address}":`, error instanceof Error ? error.message : 'Erreur inconnue');
    geocodeCache.set(address, null);
    return null;
  }
};

// Adresses par défaut pour Paris (fallback)
const getDefaultParisLocation = (category: string): { lat: number; lng: number } => {
  const locations = {
    rock: { lat: 48.8566, lng: 2.3522 }, // Centre de Paris
    rap: { lat: 48.8737, lng: 2.2950 }, // Pigalle
    electro: { lat: 48.8606, lng: 2.3376 }, // République
    jazz: { lat: 48.8534, lng: 2.3488 }, // Saint-Germain
    default: { lat: 48.8566, lng: 2.3522 }
  };

  return locations[category.toLowerCase() as keyof typeof locations] || locations.default;
};

const Map: React.FC<MapProps> = ({ articles, onMarkerClick, selectedArticle }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mémoriser le centre de la carte
  const mapCenter = useMemo<[number, number]>(() => {
    if (markers.length === 0) return [48.8566, 2.3522]; // Paris par défaut

    const avgLat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length;
    return [avgLat, avgLng];
  }, [markers]);

  const handleMarkerClick = useCallback((article: Article) => {
    if (onMarkerClick) {
      onMarkerClick(article);
    }
  }, [onMarkerClick]);

  useEffect(() => {
    const geocodeAddresses = async () => {
      if (articles.length === 0) {
        setMarkers([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      const results: MarkerData[] = [];
      let successCount = 0;

      try {
        // Traiter les articles par batch pour éviter de surcharger l'API
        const batchSize = 3;
        for (let i = 0; i < articles.length; i += batchSize) {
          const batch = articles.slice(i, i + batchSize);

          const batchPromises = batch.map(async (article) => {
            if (!article.adress || article.adress.trim() === '') {
              // Utiliser une position par défaut si pas d'adresse
              const defaultCoords = getDefaultParisLocation(article.categorie || 'default');
              return {
                lat: defaultCoords.lat + (Math.random() - 0.5) * 0.01, // Petite variation
                lng: defaultCoords.lng + (Math.random() - 0.5) * 0.01,
                article
              };
            }

            try {
              const coords = await geocodeAddress(article.adress.trim());

              if (coords) {
                successCount++;
                return {
                  lat: coords.lat,
                  lng: coords.lng,
                  article
                };
              } else {
                // Fallback vers position par défaut
                const defaultCoords = getDefaultParisLocation(article.categorie || 'default');
                return {
                  lat: defaultCoords.lat + (Math.random() - 0.5) * 0.01,
                  lng: defaultCoords.lng + (Math.random() - 0.5) * 0.01,
                  article
                };
              }
            } catch {
              // En cas d'erreur, utiliser position par défaut
              const defaultCoords = getDefaultParisLocation(article.categorie || 'default');
              return {
                lat: defaultCoords.lat + (Math.random() - 0.5) * 0.01,
                lng: defaultCoords.lng + (Math.random() - 0.5) * 0.01,
                article
              };
            }
          });

          const batchResults = await Promise.allSettled(batchPromises);

          batchResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              results.push(result.value);
            }
          });

          // Petite pause entre les batches
          if (i + batchSize < articles.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        setMarkers(results);

        // Afficher un avertissement si peu d'adresses ont été géocodées
        if (successCount < articles.length * 0.5 && articles.length > 1) {
          console.warn(`Seulement ${successCount}/${articles.length} adresses ont pu être géolocalisées précisément`);
        }

      } catch (error) {
        console.error('Erreur lors du géocodage:', error);
        setError('Erreur lors du chargement des emplacements');

        // En cas d'erreur globale, créer des marqueurs avec positions par défaut
        const fallbackMarkers = articles.map((article) => {
          const defaultCoords = getDefaultParisLocation(article.categorie || 'default');
          return {
            lat: defaultCoords.lat + (Math.random() - 0.5) * 0.01,
            lng: defaultCoords.lng + (Math.random() - 0.5) * 0.01,
            article
          };
        });
        setMarkers(fallbackMarkers);
      } finally {
        setLoading(false);
      }
    };

    geocodeAddresses();
  }, [articles]);

  if (loading) {
    return (
      <div className="h-full bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Chargement des emplacements...</p>
          <p className="text-sm text-gray-300 mt-1">
            {articles.length} spot{articles.length > 1 ? 's' : ''} à localiser
          </p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="h-full bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-lg font-medium">Aucun spot à afficher</p>
          <p className="text-sm text-gray-300 mt-1">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-600 text-white p-3 rounded-lg z-10">
          <p className="text-sm">⚠️ {error}</p>
          <p className="text-xs mt-1">Les spots sont affichés avec des positions approximatives</p>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        whenCreated={(mapInstance) => {
          // Gérer les erreurs de la carte
          mapInstance.on('error', (e) => {
            console.error('Erreur de carte:', e);
          });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        />

        {markers.map((marker, index) => {
          const isSelected = selectedArticle?.id === marker.article.id;

          return (
            <Marker
              key={`${marker.article.id}-${index}`}
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon(marker.article.categorie, isSelected)}
              eventHandlers={{
                click: () => handleMarkerClick(marker.article)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {marker.article.title}
                  </h3>

                  {marker.article.img && (
                    <img
                      src={marker.article.img}
                      alt={marker.article.title}
                      className="w-full h-24 object-cover rounded mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}

                  <div className="mb-2">
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor: (() => {
                          switch (marker.article.categorie?.toLowerCase()) {
                            case 'rock': return '#ef4444';
                            case 'rap': return '#8b5cf6';
                            case 'electro': return '#06b6d4';
                            case 'jazz': return '#f59e0b';
                            default: return '#6b7280';
                          }
                        })()
                      }}
                    >
                      {marker.article.categorie}
                    </span>
                  </div>

                  {marker.article.adress && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="truncate">{marker.article.adress}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 mb-2">
                    Affluence: {marker.article.affluence}
                  </div>

                  <button
                    onClick={() => handleMarkerClick(marker.article)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                  >
                    Voir les détails
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;