'use client';

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

export default function HolidayMap({
  pins,
  onMapClick,
  onDelete,
}: {
  pins: Pin[];
  onMapClick: (lat: number, lng: number) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />

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
  );
}