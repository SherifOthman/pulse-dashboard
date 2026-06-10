/**
 * MapView — read-only map that displays a pinned location.
 * No interaction, no search. Just a marker on OpenStreetMap.
 */
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

// ── Custom pin icon (same as MapPicker) ───────────────────────────────────────
const pinIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
      fill="#3B82F6" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>`,
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -42],
})

type Props = {
  lat: number
  lng: number
  height?: number
}

export function MapView({ lat, lng, height = 220 }: Props) {
  const position: [number, number] = [lat, lng]

  return (
    <div className="flex flex-col gap-2">
      {/* Map */}
      <div
        className="relative rounded-xl overflow-hidden border border-divider"
        style={{ height }}
      >
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={pinIcon} interactive={false} />
        </MapContainer>

        {/* "Open in maps" overlay button */}
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-2 z-[1000] flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-surface/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm hover:bg-white transition-colors border border-divider"
        >
          <MapPin className="h-3 w-3 text-primary" />
          فتح في خرائط Google
        </a>
      </div>

      {/* Coordinates */}
      <p className="text-xs text-muted font-mono text-center" dir="ltr">
        {lat.toFixed(6)}, {lng.toFixed(6)}
      </p>
    </div>
  )
}
