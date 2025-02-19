import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CitySearchInput } from '../city-search/city-search-input.component';
import { calculateDistance } from '../../utils/distance.utils';
import { checkRouteAvailability } from '../../services/route.service';
import './trip-form.component.scss';
import { fetchTransports } from '../../services/carbon.service';

interface City {
  name: string;
  country: string;
  state?: string;
  coordinates: [number, number];
}

interface Transport {
  id: string;
  name: string;
  value: number;
}

interface TripSegment {
  origin: City;
  destination: City;
  distance: number;
  transport: Transport;
  emissions: number;
  passengers?: number;
}

interface TripFormData {
  origin: string;
  destination: string;
}

interface TripFormProps {
  onOriginSelect: (city: City | null) => void;
  onDestinationSelect: (city: City | null) => void;
  onSegmentAdd: (segment: TripSegment) => void;
}

export const TripForm: React.FC<TripFormProps> = ({ 
  onOriginSelect, 
  onDestinationSelect,
  onSegmentAdd 
}) => {
  const methods = useForm<TripFormData>();
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransportOptions, setShowTransportOptions] = useState(false);
  const [selectedPassengers, setSelectedPassengers] = useState<{ [key: string]: number }>({});

  const handleOriginSelect = (city: City | null) => {
    setOriginCity(city);
    onOriginSelect(city);
    setShowTransportOptions(false);
  };

  const handleDestinationSelect = (city: City | null) => {
    setDestinationCity(city);
    onDestinationSelect(city);
    setShowTransportOptions(false);
  };

  const filterTransportsByAvailability = (transports: Transport[], availableModes: string[]): Transport[] => {
    return transports.filter(transport => {
      const name = transport.name.toLowerCase();
      return availableModes.some(mode => name.includes(mode.toLowerCase()));
    });
  };

  const handlePassengerChange = (transportId: string, change: number) => {
    setSelectedPassengers(prev => {
      const current = prev[transportId] || 1;
      const newValue = Math.max(1, Math.min(4, current + change));
      return { ...prev, [transportId]: newValue };
    });
  };

  const isCarpool = (transport: Transport) => {
    const name = transport.name.toLowerCase();
    return name.includes('carpool');
  };

  const calculateEmissionsPerPassenger = (transport: Transport) => {
    if (isCarpool(transport)) {
      const passengers = selectedPassengers[transport.id] || 1;
      return transport.value / passengers;
    }
    return transport.value;
  };

  const onSubmit = async (data: TripFormData) => {
    if (originCity && destinationCity) {
      setIsLoading(true);
      const [originLat, originLon] = originCity.coordinates;
      const [destLat, destLon] = destinationCity.coordinates;
      const tripDistance = calculateDistance(originLat, originLon, destLat, destLon);
      setDistance(tripDistance);
      
      try {
        const availableModes = await checkRouteAvailability(
          originCity.coordinates,
          destinationCity.coordinates
        );

        const transportData = await fetchTransports({ km: tripDistance });
        if (transportData) {
          const filteredTransports = filterTransportsByAvailability(transportData.data, availableModes);
          setTransports(filteredTransports);
          
          const initialPassengers: { [key: string]: number } = {};
          filteredTransports.forEach(transport => {
            if (isCarpool(transport)) {
              initialPassengers[transport.id] = 1;
            }
          });
          setSelectedPassengers(initialPassengers);
          
          setShowTransportOptions(true);
        }
      } catch (error) {
        console.error('Error fetching transports:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTransportSelect = (transport: Transport) => {
    if (originCity && destinationCity && distance) {
      const newSegment: TripSegment = {
        origin: originCity,
        destination: destinationCity,
        distance: distance,
        transport: transport,
        emissions: calculateEmissionsPerPassenger(transport),
        passengers: isCarpool(transport) ? selectedPassengers[transport.id] : undefined
      };

      onSegmentAdd(newSegment);
      
      setOriginCity(destinationCity);
      setDestinationCity(null);
      methods.reset();
      setDistance(null);
      setTransports([]);
      setShowTransportOptions(false);
      setSelectedPassengers({});
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="trip-form">
        <div className="trip-form__cities">
          <div className="trip-form__city">
            <label>Origin</label>
            <CitySearchInput
              name="origin"
              placeholder="Enter origin city"
              setCity={handleOriginSelect}
              value={originCity?.name}
              disabled={!!originCity}
            />
          </div>
          <div className="trip-form__city">
            <label>Destination</label>
            <CitySearchInput
              name="destination"
              placeholder="Enter destination city"
              setCity={handleDestinationSelect}
              disabled={!originCity}
            />
          </div>
        </div>

        {!showTransportOptions && (
          <button 
            type="submit" 
            className="trip-form__submit"
            disabled={!originCity || !destinationCity || isLoading}
          >
            {isLoading ? 'Calculating...' : 'Calculate Route'}
          </button>
        )}

        {showTransportOptions && transports.length > 0 && (
          <div className="trip-form__transport-options">
            <h3>Select Transport Mode</h3>
            <div className="trip-form__transport-list">
              {transports.map((transport) => (
                <div key={transport.id} className="trip-form__transport-item">
                  <button
                    type="button"
                    className="trip-form__transport-button"
                    onClick={() => handleTransportSelect(transport)}
                  >
                    <span>{transport.name}</span>
                    <span>{calculateEmissionsPerPassenger(transport).toFixed(2)} kg CO2</span>
                  </button>
                  {isCarpool(transport) && (
                    <div className="trip-form__passenger-counter">
                      <button
                        type="button"
                        onClick={() => handlePassengerChange(transport.id, -1)}
                        disabled={selectedPassengers[transport.id] <= 1}
                      >
                        -
                      </button>
                      <span>{selectedPassengers[transport.id] || 1} passengers</span>
                      <button
                        type="button"
                        onClick={() => handlePassengerChange(transport.id, 1)}
                        disabled={selectedPassengers[transport.id] >= 4}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showTransportOptions && transports.length === 0 && (
          <div className="trip-form__no-transport">
            <p>No suitable transport options available for this route.</p>
            <p>This might be due to the distance or geographical constraints.</p>
          </div>
        )}
      </form>
    </FormProvider>
  );
};
