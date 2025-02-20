import axios from 'axios';

export const checkRouteAvailability = async (
  origin: [number, number],
  destination: [number, number]
): Promise<string[]> => {
  const distance = calculateDistance(origin[0], origin[1], destination[0], destination[1]);
  const availableTransports: string[] = [];

  // Add default transport options based on distance
  if (distance <= 15) {
    availableTransports.push('walk');
  }
  
  if (distance <= 50) {
    availableTransports.push('bike');
  }

  // Car and bus are always available for now
  availableTransports.push('car', 'bus');

  // Add train for medium to long distances
  if (distance >= 20 && distance <= 1000) {
    availableTransports.push('train');
  }

  // Add plane for very long distances
  if (distance > 500) {
    availableTransports.push('plane');
  }

  return availableTransports;
};

// Helper function to calculate distance between coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
