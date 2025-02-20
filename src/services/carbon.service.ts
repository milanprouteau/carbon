import { transportCustomFetch, cityCustomFetch, transportDetailsFetch } from "../utils/customFetch";

// Transport interfaces
interface FootPrint {
  id: number;
  value: string;
}

interface TransportData {
  id: string;
  name: string;
  value: number;
  unit: string;
  description?: string;
  details: FootPrint[];
  footprintDetail?: FootPrint[];
  slug: string;
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

interface TransportParams {
  km: number;
}

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

export const fetchTransports = async (params: TransportParams): Promise<TransportData[]> => {
  try {
    const response = await transportCustomFetch.get<TransportResponse>('', { params });
    if (!response?.data?.data) {
      throw new Error('No response from transport API');
    }

    // Consolidate carpooling options before returning
    const consolidatedTransports = consolidateCarpoolingOptions(response.data.data);
    const transportsDetails = await fetchTransportDetails();

    return consolidatedTransports.map((transport) => {
      if (transport.name === "Carpool Combustion") {
        const combustionDetails = transportsDetails.find(({name}) => name === "Combustion car");
        return {
          ...transport,
          details: combustionDetails?.footprintDetail || [],
          slug: combustionDetails?.slug || '',
        };
      }

      if (transport.name === "Carpool Electric") {
        const electricDetails = transportsDetails.find(({name}) => name === "Electric car");
        return {
          ...transport,
          details: electricDetails?.footprintDetail || [],
          slug: electricDetails?.slug || '',
        };
      }
      const details = transportsDetails.find(({name}) => name === transport.name)?.footprintDetail || [];
      const slug = transportsDetails.find(({name}) => name === transport.name)?.slug || '';
      return {
        ...transport,
        details,
        slug,
      };
    });
  } catch (error: unknown) {
    console.error('Error fetching transports:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const fetchTransportDetails = async (): Promise<TransportData[]> => {
  try {
    const response = await transportDetailsFetch.get<{ data: TransportData[] }>('');
    if (!response?.data) {
      throw new Error('No response from transport details API');
    }
    return response.data.data;
  } catch (error: unknown) {
    console.error('Error fetching transport details:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const fetchCities = async (query: string): Promise<City[]> => {
  try {
    const response = await cityCustomFetch.get<CitiesApiResponse>('', { params: { q: query } });
    if (!response?.data?.features) {
      return [];
    }
    return response.data.features
      .filter(({ properties }) => properties.type === "city")
      .map(feature => new CitySearch(feature));
  } catch (error: unknown) {
    console.error('Error fetching cities:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
};

export function debounce<T extends (...args: any[]) => Promise<void>>(
  func: T,
  timeout = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return function(this: void, ...args: Parameters<T>): void {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(undefined, args);
    }, timeout);
  };
}
