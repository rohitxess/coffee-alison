'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.3), 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type Pin = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  notes: string;
  photo: string;
};

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToUser({ position }: { position: [number, number] | null }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 6, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function HolidayMap({
  pins,
  onMapClick,
  onDelete,
}: {
  pins: Pin[];
  onMapClick: (lat: number, lng: number) => void;
  onDelete: (id: string) => void;
}) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [mapKey, setMapKey] = useState(0); // ← key forces fresh map instance

  useEffect(() => {
    // ← Force new map instance on mount to prevent "already initialized"
    setMapKey((prev) => prev + 1);

    if (!('geolocation' in navigator)) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus('granted');
      },
      (err) => {
        console.error('Location error:', err.message);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // ← Cleanup Leaflet map on unmount to prevent reinitialization
    return () => {
      const containers = document.querySelectorAll('.leaflet-container');
      containers.forEach((container: any) => {
        if (container._leaflet_id) {
          container._leaflet_id = null;
        }
      });
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* ← key prop forces complete remount of MapContainer */}
      <MapContainer
        key={mapKey}
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />
        <ClickHandler onMapClick={onMapClick} />

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>📍 You are here</div>
            </Popup>
          </Marker>
        )}

        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={icon}>
            <Popup>
              <div style={{ minWidth: '180px' }}>
                {pin.photo && (
                  <img
                    src={pin.photo}
                    alt={pin.name}
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                  />
                )}
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700' }}>
                  {pin.name}
                </h4>
                {pin.notes && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#71717a' }}>
                    {pin.notes}
                  </p>
                )}
                <button
                  onClick={() => onDelete(pin.id)}
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Location status banners */}
      {locationStatus === 'requesting' && (
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '8px 16px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '13px', color: '#71717a', zIndex: 1000 }}>
          📍 Requesting your location...
        </div>
      )}
      {locationStatus === 'denied' && (
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '8px 16px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '13px', color: '#ef4444', zIndex: 1000 }}>
          ⚠️ Location access denied
        </div>
      )}
    </div>
  );
}