import React, { useState } from 'react';
import './homepage.scss';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { TripForm } from '../../components/trip-form/trip-form.component';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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
}

const mapThemes = {
  default: {
    name: 'OpenStreetMap Default',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: {
    name: 'Dark Theme',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  },
  light: {
    name: 'Light Theme',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

const MapUpdater: React.FC<{ bounds?: L.LatLngBounds }> = ({ bounds }) => {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const Homepage: React.FC = () => {
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);
  const [tripSegments, setTripSegments] = useState<TripSegment[]>([]);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isSegmentsPanelExpanded, setIsSegmentsPanelExpanded] = useState(false);

  // Calculate total distance and emissions
  const totalDistance = tripSegments.reduce((sum, segment) => sum + segment.distance, 0);
  const totalEmissions = tripSegments.reduce((sum, segment) => sum + segment.emissions, 0);

  const updateMapView = () => {
    if (tripSegments.length > 0 || (originCity && destinationCity)) {
      const allCoordinates: [number, number][] = [];
      
      // Add coordinates from completed trip segments
      tripSegments.forEach(segment => {
        allCoordinates.push(segment.origin.coordinates);
        allCoordinates.push(segment.destination.coordinates);
      });

      // Add current cities if they exist
      if (originCity) allCoordinates.push(originCity.coordinates);
      if (destinationCity) allCoordinates.push(destinationCity.coordinates);

      if (allCoordinates.length > 0) {
        return L.latLngBounds(allCoordinates);
      }
    }
    return undefined;
  };

  const getMarkerColor = (index: number, total: number) => {
    if (total === 1) return 'blue';
    const hue = (index / (total - 1)) * 120; // Gradient from 0 (red) to 120 (green)
    return `hsl(${hue}, 100%, 50%)`;
  };

  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Get all cities in order of appearance
  const getAllCities = () => {
    const cities: City[] = [];
    if (tripSegments.length === 0 && originCity) {
      cities.push(originCity);
      if (destinationCity) cities.push(destinationCity);
      return cities;
    }

    // Add first origin
    if (tripSegments.length > 0) {
      cities.push(tripSegments[0].origin);
    }

    // Add all destinations in order
    tripSegments.forEach(segment => {
      cities.push(segment.destination);
    });

    // Add current selection if it exists and is different
    if (destinationCity && cities[cities.length - 1]?.name !== destinationCity.name) {
      cities.push(destinationCity);
    }

    return cities;
  };

  const handleSegmentAdd = (segment: TripSegment) => {
    setTripSegments([...tripSegments, segment]);
    setOriginCity(segment.destination); // Set the new origin to the last destination
    setDestinationCity(null);
  };

  const bounds = updateMapView();
  const cities = getAllCities();

  return (
    <div className="homepage">
      <div className="homepage__left">
        <TripForm 
          onOriginSelect={setOriginCity}
          onDestinationSelect={setDestinationCity}
          onSegmentAdd={handleSegmentAdd}
        />
      </div>
      <div className="homepage__right">
        <MapContainer
          center={[48.8566, 2.3522]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapUpdater bounds={bounds} />
          <TileLayer
            attribution={mapThemes[currentTheme].attribution}
            url={mapThemes[currentTheme].url}
          />
          
          {cities.map((city, index) => (
            <Marker 
              key={`${city.name}-${index}`}
              position={city.coordinates}
              icon={createCustomIcon(getMarkerColor(index, cities.length))}
            >
              <Popup>
                <strong>{index + 1}. {city.name}</strong>
                <br />
                {city.country}{city.state ? `, ${city.state}` : ''}
              </Popup>
            </Marker>
          ))}
          
          {tripSegments.map((segment, index) => (
            <Polyline
              key={index}
              positions={[segment.origin.coordinates, segment.destination.coordinates]}
              color={getMarkerColor(index, tripSegments.length)}
              weight={3}
              opacity={0.7}
            />
          ))}
          
          {originCity && destinationCity && (
            <Polyline
              positions={[originCity.coordinates, destinationCity.coordinates]}
              color={getMarkerColor(tripSegments.length, tripSegments.length + 1)}
              weight={3}
              opacity={0.7}
              dashArray="5, 10"
            />
          )}
        </MapContainer>
      </div>

      {tripSegments.length > 0 && (
        <div className={`trip-summary ${isSegmentsPanelExpanded ? 'trip-summary--expanded' : ''}`}>
          <div 
            className="trip-summary__header"
            onClick={() => setIsSegmentsPanelExpanded(!isSegmentsPanelExpanded)}
          >
            <div className="trip-summary__totals">
              <span>Total Distance: {Math.round(totalDistance)} km</span>
              <span>Total Emissions: {Math.round(totalEmissions * 100) / 100} kg CO₂e</span>
            </div>
            <button className="trip-summary__toggle">
              {isSegmentsPanelExpanded ? '▼' : '▲'}
            </button>
          </div>
          
          {isSegmentsPanelExpanded && (
            <div className="trip-summary__details">
              {tripSegments.map((segment, index) => (
                <div key={index} className="trip-summary__segment">
                  <div className="trip-summary__segment-header">
                    <span className="trip-summary__segment-number">#{index + 1}</span>
                    <span className="trip-summary__segment-cities">
                      {segment.origin.name} → {segment.destination.name}
                    </span>
                  </div>
                  <div className="trip-summary__segment-details">
                    <span>{Math.round(segment.distance)} km</span>
                    <span>{segment.transport.name}</span>
                    <span>{Math.round(segment.emissions * 100) / 100} kg CO₂e</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Homepage;
