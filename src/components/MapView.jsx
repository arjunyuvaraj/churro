import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
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

export default function MapView({ center = [37.7749, -122.4194], tasks = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-[40vh] w-full md:h-[480px] lg:h-[560px]">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        {tasks.map((task) => (
          <Marker key={task.id} position={[task.latitude || center[0], task.longitude || center[1]]} icon={markerIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-text-secondary">${task.pay}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
