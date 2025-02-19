import axios from 'axios';

const ORS_API_KEY = '5b3ce3597851110001cf6248212a94a99fee4e6eb257bd5b85d10416';
const ORS_API_URL = 'https://api.openrouteservice.org';

interface RouteOptions {
  coordinates: [number, number][];
  profile: 'driving-car' | 'foot-walking' | 'cycling-regular' | 'cycling-road' | 'cycling-mountain';
}

export interface RouteResponse {
  routes: Array<{
    summary: {
      distance: number;
      duration: number;
    };
    segments: Array<{
      distance: number;
      duration: number;
    }>;
  }>;
}

export const checkRouteAvailability = async (
  origin: [number, number],
  destination: [number, number]
): Promise<string[]> => {
  const availableProfiles = [];
  const profiles = [
    'driving-car',
    'foot-walking',
    'cycling-regular'
  ] as const;

  console.log('Checking route from:', origin, 'to:', destination);

  // Format coordinates for ORS API (they expect [longitude, latitude])
  const coordinates = [
    [origin[1], origin[0]],
    [destination[1], destination[0]]
  ];

  // Check each transport mode
  for (const profile of profiles) {
    try {
      const response = await axios.post<RouteResponse>(
        `${ORS_API_URL}/v2/directions/${profile}/json`,
        {
          coordinates: coordinates
        },
        {
          headers: {
            'Authorization': ORS_API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Response for ${profile}:`, response.data);

      if (response.data.routes && response.data.routes.length > 0) {
        // If we get a valid route, this transport mode is available
        availableProfiles.push(profile);
      }
    } catch (error: any) {
      // Log detailed error information
      console.log(`Error for ${profile}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  }

  console.log('Available profiles:', availableProfiles);

  // Map ORS profiles to our transport types
  const transportMap: { [key: string]: string[] } = {
    'driving-car': ['car', 'bus'],
    'foot-walking': ['walk'],
    'cycling-regular': ['bike']
  };

  // Convert ORS profiles to our transport types
  const availableTransports = availableProfiles.flatMap(profile => transportMap[profile] || []);

  // Always check if flight is needed (for long distances)
  const distance = calculateDistance(origin[0], origin[1], destination[0], destination[1]);
  if (distance > 500) { // If distance is more than 500km
    availableTransports.push('plane');
  }

  // If no ground transport is available but distance is reasonable, add plane
  if (availableTransports.length === 0 && distance > 100) {
    availableTransports.push('plane');
  }

  console.log('Final available transports:', availableTransports);
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
