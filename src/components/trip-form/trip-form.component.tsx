import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CitySearchInput } from '../city-search/city-search-input.component';
import { calculateDistance } from '../../utils/distance.utils';
import { fetchTransports } from '../../services/carbon.service';
import './trip-form.component.scss';

interface City {
  name: string;
  country: string;
  state?: string;
  coordinates: [number, number];
}

interface FootPrint {
  id: number,
  value: string,
}

interface Transport {
  id: string;
  name: string;
  value: number;
  unit: string;
  description?: string;
  slug: string;
  details: FootPrint[];
}

interface TransportResponse {
  data: Transport[];
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
  setIsHighlighted: (value: boolean) => void;
}

export const TripForm: React.FC<TripFormProps> = ({ 
  onOriginSelect, 
  onDestinationSelect,
  onSegmentAdd,
  setIsHighlighted
}) => {
  const methods = useForm<TripFormData>();
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);
  const [distance, setDistance] = useState<number>(0);
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

  const getFootprintName = (id: number): string => {
    if (id === 5) {
      return 'Construction cost'
    } else if (id === 6) {
      return 'Consumption'
    } else if (id === 7) {
      return 'Condensation trails'
    } else {
      return 'other'
    }
  }

  const calculateDetailValue = (detail: FootPrint, distance: number) => {
    if (detail.id === 6 || detail.id === 7) {
      return parseFloat(detail.value) * distance;
    }
    return parseFloat(detail.value);
  };

  const calculateTotalEmissions = (details: FootPrint[], distance: number) => {
    return details.reduce((sum, detail) => sum + calculateDetailValue(detail, distance), 0);
  };

  const calculateEmissionsPerPassenger = (transport: Transport): number => {
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
      setIsHighlighted(false);

      try {
        const transportData = await fetchTransports({ km: tripDistance });
        if (transportData) {
          setTransports(transportData);
          setShowTransportOptions(true);
        }
      } catch (error: unknown) {
        console.error('Error fetching transports:', error instanceof Error ? error.message : 'Unknown error');
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
      setDistance(0);
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
              {transports.map((transport, index) => (
                <div key={transport.id} className="trip-form__transport-item">
                  <button
                    type="button"
                    className="trip-form__transport-button"
                    onClick={() => handleTransportSelect(transport)}
                  >
                    <div className="trip-form__transport-info">
                      <span className={`transport-icon transport-icon--${transport.slug}`}></span>
                      <div>
                        {transport.name}
                        <div className="trip-form__emissions">
                          {(calculateEmissionsPerPassenger(transport)).toFixed(0)} kg CO2 ({distance} km)
                        </div>
                      </div>
                    </div>
                    <div className="trip-form__info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="#475467">
                        <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                      </svg>
                      <div className="trip-form__info-popup">
                        <div className="trip-form__info-title">Details (g CO2 per km)</div>
                        <div className="trip-form__chart">
                        <div className="trip-form__chart-item">
                            <div className="trip-form__chart-label">
                              {Number((calculateTotalEmissions(transport.details, 1) * 1000) ?? 0).toFixed(2)}
                            </div>
                            <div className="trip-form__chart-bar">
                              <div 
                                className="trip-form__chart-fill" 
                                style={{ 
                                  width: '100%',
                                  background: `linear-gradient(to right, ${
                                    transport.details.reduce((acc: { gradient: string[], width: number }, detail, index) => {
                                      const total = calculateTotalEmissions(transport.details, 1);
                                      const colors = ['#7F56D9', '#b98ff3', '#d6cff3'];
                                      const previousWidth = acc.width;
                                      const currentWidth = (calculateDetailValue(detail, 1) / total) * 100;
                                      acc.gradient.push(`${colors[index]} ${previousWidth}%`);
                                      acc.gradient.push(`${colors[index]} ${previousWidth + currentWidth}%`);
                                      acc.width += currentWidth;
                                      return acc;
                                    }, { gradient: [], width: 0 }).gradient.join(', ')
                                  })`
                                }}
                              ></div>
                              <span className="trip-form__chart-value">
                                Total
                              </span>
                            </div>
                          </div>
                          {transport.details.map((detail, index) => (
                          <div key={detail.id} className="trip-form__chart-item">
                            <div className="trip-form__chart-label">
                              {Number((calculateDetailValue(detail, 1) * 1000) ?? 0).toFixed(2)}
                            </div>
                            <div className="trip-form__chart-bar">
                              <div className="trip-form__chart-fill" style={{ 
                                width: `${(calculateDetailValue(detail, 1) / calculateTotalEmissions(transport.details, 1)) * 100}%`,
                                backgroundColor: index === 0 ? '#7F56D9' : index === 1 ? '#b98ff3' : '#d6cff3'
                              }}></div>
                              <span className="trip-form__chart-value">{getFootprintName(detail.id)}</span>
                            </div>
                          </div>
                          ))}
                        </div>
                      </div>
                    </div>
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
