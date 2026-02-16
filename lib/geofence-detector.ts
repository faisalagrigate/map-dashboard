// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a location is within a geofence
export function isInsideGeofence(
  employeeLat: number,
  employeeLng: number,
  geofenceLat: number,
  geofenceLng: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(employeeLat, employeeLng, geofenceLat, geofenceLng);
  return distance <= radiusMeters;
}

// Determine which geofence(s) an employee is inside
export function getEmployeeGeofences(
  employeeLat: number,
  employeeLng: number,
  geofences: Array<{ id: string; coordinates: { lat: number; lng: number }; radius: number }>
): string[] {
  return geofences
    .filter((geo) =>
      isInsideGeofence(employeeLat, employeeLng, geo.coordinates.lat, geo.coordinates.lng, geo.radius)
    )
    .map((geo) => geo.id);
}

// Format time duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
