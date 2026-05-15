import { Client } from '@googlemaps/google-maps-services-js';

let _client: Client | null = null;
function client(): Client { return _client ?? (_client = new Client({})); }

export interface GeocodeResult { lat: number; lng: number; formatted_address: string; }

export async function geocode(address: string): Promise<GeocodeResult | null> {
  const res = await client().geocode({
    params: { address, key: process.env.GOOGLE_MAPS_API_KEY!, region: 'it', language: 'it' },
  });
  const top = res.data.results[0];
  if (!top) return null;
  return { lat: top.geometry.location.lat, lng: top.geometry.location.lng, formatted_address: top.formatted_address };
}

// Waypoint-optimised directions for the daily tecnico route.
// origin/destination usually = tecnico home_address.
export async function optimizedRoute(opts: { origin: string; destination: string; waypoints: string[] }) {
  const res = await client().directions({
    params: {
      origin: opts.origin,
      destination: opts.destination,
      waypoints: opts.waypoints.map((w) => `via:${w}`),
      // optimize:true reorders waypoints for the shortest total drive
      optimize: true as any,
      key: process.env.GOOGLE_MAPS_API_KEY!,
      region: 'it', language: 'it', mode: 'driving' as any,
    },
  });
  return res.data;
}
