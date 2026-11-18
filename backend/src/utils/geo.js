/**
 * Geospatial utility functions for EquipShare:
 * - Haversine Great-Circle distance formula (km)
 * - Bounding box generator for fast 2D SQL spatial indexing
 * - Known Nepal city coordinate presets
 */

// Earth mean radius in kilometers
const EARTH_RADIUS_KM = 6371;

// Approximate km per degree of latitude
const KM_PER_DEG_LAT = 111.045;

/**
 * Standard coordinates for major Nepal cities and regional depots.
 */
const NEPAL_CITY_COORDINATES = {
  bhaktapur: { lat: 27.6698, lng: 85.4385 },
  kathmandu: { lat: 27.7172, lng: 85.3240 },
  lalitpur: { lat: 27.6710, lng: 85.3206 },
  pokhara: { lat: 28.2096, lng: 83.9856 },
  chitwan: { lat: 27.6934, lng: 84.4300 },
  butwal: { lat: 27.7006, lng: 83.4484 },
  bhairahawa: { lat: 27.5045, lng: 83.4500 },
  hetauda: { lat: 27.4287, lng: 85.0328 },
  biratnagar: { lat: 26.4525, lng: 87.2718 },
  dhading: { lat: 27.8722, lng: 84.8989 },
  kavre: { lat: 27.6253, lng: 85.5561 },
  surkhet: { lat: 28.6019, lng: 81.6338 },
  nepalgunj: { lat: 28.0500, lng: 81.6167 },
  dhangadhi: { lat: 28.6852, lng: 80.5960 },
  itahari: { lat: 26.6667, lng: 87.2833 },
  dharan: { lat: 26.8124, lng: 87.2834 },
  janakpur: { lat: 26.7288, lng: 85.9244 },
  birgunj: { lat: 27.0135, lng: 84.8773 },
};

/**
 * Lookup default coordinates from city/location string (case-insensitive)
 */
function getCoordinatesForLocation(locationStr) {
  if (!locationStr || typeof locationStr !== "string") return null;
  const lower = locationStr.toLowerCase();
  for (const [city, coords] of Object.entries(NEPAL_CITY_COORDINATES)) {
    if (lower.includes(city)) {
      return coords;
    }
  }
  // Default to central Nepal (Kathmandu Valley) if unrecognized
  return { lat: 27.7172, lng: 85.3240 };
}

/**
 * Calculates Great-Circle distance in km using the Haversine formula
 */
function calculateHaversineDistanceKm(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

/**
 * Computes a 2D bounding box (latMin, latMax, lngMin, lngMax) around a center point
 * within a given radius in kilometers.
 * Enables PostgreSQL to perform ultra-fast B-tree index scans.
 */
function computeBoundingBox(centerLat, centerLng, radiusKm) {
  const deltaLat = radiusKm / KM_PER_DEG_LAT;
  const radLat = (centerLat * Math.PI) / 180;
  const deltaLng = radiusKm / (KM_PER_DEG_LAT * Math.cos(radLat));

  return {
    minLat: Math.max(-90, centerLat - deltaLat),
    maxLat: Math.min(90, centerLat + deltaLat),
    minLng: Math.max(-180, centerLng - deltaLng),
    maxLng: Math.min(180, centerLng + deltaLng),
  };
}

module.exports = {
  EARTH_RADIUS_KM,
  NEPAL_CITY_COORDINATES,
  getCoordinatesForLocation,
  calculateHaversineDistanceKm,
  computeBoundingBox,
};
