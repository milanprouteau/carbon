import { transportCustomFetch, cityCustomFetch, tripDistanceFetch } from "../utils/customFetch";

// Transport interfaces
interface TransportData {
  id: string;
  name: string;
  value: number;
  unit: string;
  description?: string;
}

interface TransportResponse {
  data: TransportData[];
}

// City interfaces
interface CityProperties {
  name: string;
  type: string;
  country: string;
  state?: string;
}

interface CityGeometry {
  coordinates: [number, number]; // [longitude, latitude]
}

interface CityFeature {
  type: "Feature";
  geometry: CityGeometry;
  properties: CityProperties;
}

interface CitiesApiResponse {
  features: CityFeature[];
}

export interface City {
  name: string;
  coordinates: [number, number];
  country: string;
  state?: string;
}

// Trip distance interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface TripDistanceRequest {
  origins: Coordinates;
  destinations: Coordinates;
}

interface TripDistanceResponse {
  distance: number;
  duration: number;
}

// Class to transform API response to our City type
class CitySearch implements City {
  name: string;
  coordinates: [number, number];
  country: string;
  state?: string;

  constructor(feature: CityFeature) {
    this.name = feature.properties.name;
    // Reverse coordinates as the API returns [longitude, latitude]
    this.coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
    this.country = feature.properties.country;
    this.state = feature.properties.state;
  }
};

const consolidateCarpoolingOptions = (transports: TransportData[]): TransportData[] => {
  const result: TransportData[] = [];
  const carpoolCombustion: TransportData | undefined = transports.find(t => 
    t.name.toLowerCase().includes('carpool') && !t.name.toLowerCase().includes('electric')
  );
  const carpoolElectric: TransportData | undefined = transports.find(t => 
    t.name.toLowerCase().includes('carpool') && t.name.toLowerCase().includes('electric')
  );

  // Add non-carpooling options
  transports.forEach(transport => {
    const name = transport.name.toLowerCase();
    if (!name.includes('carpool')) {
      result.push(transport);
    }
  });

  // Add single carpooling options
  if (carpoolCombustion) {
    result.push({
      ...carpoolCombustion,
      id: 'carpool-combustion',
      name: 'Carpool Combustion'
    });
  }

  if (carpoolElectric) {
    result.push({
      ...carpoolElectric,
      id: 'carpool-electric',
      name: 'Carpool Electric'
    });
  }

  return result;
};

export const fetchTransports = async (params): Promise<TransportResponse | null> => {
  try {
    const response = await transportCustomFetch.get<TransportResponse>("", { params });
    if (response.data && response.data.data) {
      // Consolidate carpooling options before returning
      const consolidatedTransports = consolidateCarpoolingOptions(response.data.data);
      return {
        ...response.data,
        data: consolidatedTransports
      };
    }
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCities = async (query: string): Promise<City[]> => {
  try {
    const params = { q: query };
    const response = await cityCustomFetch.get<CitiesApiResponse>("", { params });
    return response.data.features
      .filter(({ properties }) => properties.type === "city")
      .map((city) => new CitySearch(city));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getTripDistance = async ({ origin, destination }: { origin: [number, number], destination: [number, number] }): Promise<TripDistanceResponse | null> => {
  try {
    const data: TripDistanceRequest = {
      origins: {
        latitude: origin[0],
        longitude: origin[1],
      },
      destinations: {
        latitude: destination[0],
        longitude: destination[1],
      }
    };
    const response = await tripDistanceFetch.post<TripDistanceResponse>("", data);
    return response.data;
  } catch (err) {
    console.error('Error getting trip distance:', err);
    return null;
  }
};

export function debounce<T extends (...args: any[]) => any>(func: T, timeout = 300) {
  let timer: NodeJS.Timeout;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
};
