import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ center = [37.7749, -122.4194], tasks = [] }) {
  const [actualCenter, setActualCenter] = useState(center);

  useEffect(() => {
    if (center[0] === 37.7749 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setActualCenter([pos.coords.latitude, pos.coords.longitude]),
        () => setActualCenter(center) // fallback
      );
    } else {
      setActualCenter(center);
    }
  }, [center]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft relative">
      <MapContainer center={actualCenter} zoom={13} scrollWheelZoom className="h-[40vh] w-full md:h-[480px] lg:h-[560px]">
        <MapController center={actualCenter} />
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>' 
        />
        {tasks.map((task) => (
          <Marker key={task.id} position={[task.latitude || actualCenter[0], task.longitude || actualCenter[1]]} icon={markerIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-text-secondary">Reward: {task.pay}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
