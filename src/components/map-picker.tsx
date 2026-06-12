/**
 * MapPicker
 *
 * An interactive map component that lets the user pick a location by:
 *  1. Clicking anywhere on the map
 *  2. Dragging the marker
 *  3. Searching by place name (Nominatim / OpenStreetMap geocoding — no API key)
 *
 * Uses Leaflet + React-Leaflet with free OpenStreetMap tiles.
 * Fixes Leaflet's default marker icon issue with Vite bundling.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Button, Input, Spinner } from '@heroui/react'
import { MapPin, Search, X, LocateFixed } from 'lucide-react'

// ── Fix Leaflet default marker icons with Vite ────────────────────────────────
// Leaflet tries to resolve icon URLs relative to the CSS file, which breaks
// when bundled. We override the default icon with inline SVG data URIs.
const defaultIcon = L.divIcon({
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

// ── Parse Google Maps URL ─────────────────────────────────────────────────────
// Handles formats:
//   !3d29.97!4d31.28       (data parameter — most precise, actual pin location)
//   /@lat,lng,zoom         (viewport center — fallback)
//   ?q=lat,lng             (short link)
function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  // Most precise: !3d29.9745151!4d31.2808435 (actual pinned place coordinates)
  const dMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (dMatch) return { lat: parseFloat(dMatch[1]), lng: parseFloat(dMatch[2]) }

  // Fallback: /@29.9745151,31.2808435,17z (map viewport center)
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }

  // ?q=lat,lng or ?q=lat%2Clng (short share links)
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*)[,%2C]+(-?\d+\.?\d*)/)
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }

  return null
}

// ── Resolve shortened Google Maps URL ────────────────────────────────────────
// maps.app.goo.gl links serve an HTML page directly (no standard redirect).
// Our backend fetches the page and extracts coordinates from the og:image meta tag.
async function resolveShortUrl(url: string): Promise<{ lat: number; lng: number } | null> {
  const { useAuthStore } = await import('@/auth-store')
  const token = useAuthStore.getState().accessToken

  const res = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:5170/dashboard'}/resolve-url?url=${encodeURIComponent(url)}`,
    {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  )
  if (!res.ok) return null
  const json = await res.json()
  if (typeof json?.lat === 'number' && typeof json?.lng === 'number') {
    return { lat: json.lat, lng: json.lng }
  }
  return null
}
type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

async function searchPlaces(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '0',
    'accept-language': 'ar,en',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'PulseDashboard/1.0' },
  })
  return res.json()
}

// ── Internal: click + drag handler ───────────────────────────────────────────
function LocationPicker({
  position,
  onChange,
}: {
  position: [number, number] | null
  onChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return position ? (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable
      eventHandlers={{
        dragend(e) {
          const m = e.target as L.Marker
          const { lat, lng } = m.getLatLng()
          onChange(lat, lng)
        },
      }}
    />
  ) : null
}

// ── Internal: fly-to controller ───────────────────────────────────────────────
function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 1.2 })
  }, [target, map])
  return null
}

// ── Props ─────────────────────────────────────────────────────────────────────
export type MapPickerValue = { lat: number; lng: number } | null

type Props = {
  value: MapPickerValue
  onChange: (value: MapPickerValue) => void
  /** Height of the map container, defaults to 320px */
  height?: number
}

// ── Component ─────────────────────────────────────────────────────────────────
export function MapPicker({ value, onChange, height = 320 }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [mapsUrl, setMapsUrl] = useState('')
  const [mapsUrlError, setMapsUrlError] = useState(false)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const position: [number, number] | null = value ? [value.lat, value.lng] : null

  // Default center: Egypt
  const defaultCenter: [number, number] = [26.82, 30.8]
  const defaultZoom = 6

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      onChange({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) })
      setSearchResults([])
    },
    [onChange],
  )

  // Debounced search
  const handleSearchInput = (val: string) => {
    setSearchQuery(val)
    if (searchRef.current) clearTimeout(searchRef.current)
    if (!val.trim()) { setSearchResults([]); return }
    searchRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchPlaces(val)
        setSearchResults(results)
      } catch {
        // silently fail — user can still click on map
      } finally {
        setSearching(false)
      }
    }, 600)
  }

  const handleSelectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    onChange({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) })
    setFlyTarget([lat, lng])
    setSearchQuery(r.display_name)
    setSearchResults([])
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        onChange({ lat, lng })
        setFlyTarget([lat, lng])
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 },
    )
  }

  const handleClear = () => {
    onChange(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleMapsUrl = async (url: string) => {
    setMapsUrl(url)
    setMapsUrlError(false)
    if (!url.trim()) return

    const trimmed = url.trim()

    // Detect shortened URLs (maps.app.goo.gl or goo.gl) — resolve server-side
    if (/goo\.gl|maps\.app\.goo\.gl/.test(trimmed)) {
      setSearching(true)
      try {
        const coords = await resolveShortUrl(trimmed)
        if (coords) {
          onChange({ lat: parseFloat(coords.lat.toFixed(6)), lng: parseFloat(coords.lng.toFixed(6)) })
          setFlyTarget([coords.lat, coords.lng])
        } else {
          setMapsUrlError(true)
        }
      } catch {
        setMapsUrlError(true)
      } finally {
        setSearching(false)
      }
      return
    }

    // Full Google Maps URL — parse coordinates directly from the URL
    const coords = parseGoogleMapsUrl(trimmed)
    if (coords) {
      onChange({ lat: parseFloat(coords.lat.toFixed(6)), lng: parseFloat(coords.lng.toFixed(6)) })
      setFlyTarget([coords.lat, coords.lng])
    } else {
      setMapsUrlError(true)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* ── Google Maps URL paste ── */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Input
            value={mapsUrl}
            onChange={(e) => { void handleMapsUrl(e.target.value) }}
            variant="secondary"
            placeholder="الصق رابط Google Maps هنا (كامل أو مختصر)..."
            dir="ltr"
            className="w-full"
            aria-label="رابط Google Maps"
          />
          {mapsUrl && (
            <button
              type="button"
              onClick={() => { setMapsUrl(''); setMapsUrlError(false) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted hover:text-foreground transition-colors"
              aria-label="مسح الرابط"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {mapsUrlError && (
        <p className="text-xs text-danger px-1">
          تعذّر استخراج الإحداثيات — تأكد من أن الرابط من Google Maps
        </p>
      )}

      {/* ── Search bar ── */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            {searching
              ? <Spinner size="sm" />
              : <Search className="h-4 w-4 text-muted" />
            }
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            variant="secondary"
            placeholder="ابحث عن موقع... مثال: مستشفى القاهرة"
            dir="rtl"
            className="w-full [&_input]:pr-10"
            aria-label="بحث عن موقع"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults([]) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted hover:text-foreground transition-colors"
              aria-label="مسح البحث"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full z-[9999] rounded-xl border border-divider bg-surface shadow-lg overflow-hidden">
              {searchResults.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full flex items-start gap-2 px-3 py-2.5 text-right hover:bg-surface-secondary transition-colors border-b border-divider last:border-0"
                >
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground leading-snug line-clamp-2">
                    {r.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Locate me button */}
        <Button
          type="button"
          variant="secondary"
          isIconOnly
          onPress={handleLocateMe}
          isPending={locating}
          aria-label="موقعي الحالي"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Lat / Lng inputs ── */}
      <div className="flex gap-2">
        <Input
          value={value ? String(value.lat) : ''}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange({ lat: v, lng: value?.lng ?? 0 })
          }}
          variant="secondary"
          placeholder="خط العرض (Latitude)"
          type="number"
          step="any"
          className="flex-1"
          dir="ltr"
          aria-label="خط العرض"
        />
        <Input
          value={value ? String(value.lng) : ''}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange({ lat: value?.lat ?? 0, lng: v })
          }}
          variant="secondary"
          placeholder="خط الطول (Longitude)"
          type="number"
          step="any"
          className="flex-1"
          dir="ltr"
          aria-label="خط الطول"
        />
      </div>

      {/* ── Map ── */}
      <div
        className="relative rounded-xl overflow-hidden border border-divider"
        style={{ height }}
      >
        <MapContainer
          center={position ?? defaultCenter}
          zoom={position ? 14 : defaultZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker position={position} onChange={handleMapClick} />
          <FlyTo target={flyTarget} />
        </MapContainer>

        {/* Hint overlay — only shown when no pin set */}
        {!position && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-white" />
              <span className="text-xs text-white font-medium whitespace-nowrap">
                انقر على الخريطة لتحديد الموقع
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Coordinates display + clear ── */}
      {value && (
        <div className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-mono text-foreground" dir="ltr">
              {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-danger hover:underline transition-colors"
            aria-label="إزالة تحديد الموقع"
          >
            إزالة
          </button>
        </div>
      )}
    </div>
  )
}
