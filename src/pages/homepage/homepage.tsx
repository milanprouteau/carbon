import React, { useState, useMemo } from 'react';
import './homepage.scss';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { TripForm } from '../../components/trip-form/trip-form.component';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import L from 'leaflet';

// Custom marker styling
const createCustomIcon = (color: string) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: ${color};
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const originIcon = createCustomIcon(`rgba(127, 86, 217, 1)`);
const destinationIcon = createCustomIcon(`rgba(127, 86, 217, 1)`);
const intermediateIcon = createCustomIcon(`rgba(127, 86, 217, 0.2)`);

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
  slug: string;
}

interface TripSegment {
  origin: City;
  destination: City;
  distance: number;
  transport: Transport;
  emissions: number;
}

const mapConfig = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
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
  const [isSegmentsPanelExpanded, setIsSegmentsPanelExpanded] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

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

      // Add current origin and destination if they exist
      if (originCity) allCoordinates.push(originCity.coordinates);
      if (destinationCity) allCoordinates.push(destinationCity.coordinates);

      if (allCoordinates.length > 0) {
        const bounds = L.latLngBounds(allCoordinates.map(coord => L.latLng(coord[0], coord[1])));
        return bounds;
      }
    }
    return undefined;
  };

  // Memoize the bounds calculation
  const bounds = useMemo(updateMapView, [tripSegments, originCity, destinationCity]);

  // Custom polyline options with gradient effect
  const polylineOptions: L.PolylineOptions = {
    weight: 3,
    color: '#7F56D9',
    opacity: 0.8,
    dashArray: '10, 10',
    lineCap: 'round' as L.LineCapShape,
    lineJoin: 'round' as L.LineJoinShape,
    className: 'animated-line'
  };

  const renderMarkers = () => {
    const markers = [];

    // Add markers for completed trip segments
    tripSegments.forEach((segment, index) => {
      markers.push(
        <Marker 
          key={`origin-${index}`} 
          position={[segment.origin.coordinates[0], segment.origin.coordinates[1]]}
          icon={index === 0 ? originIcon : intermediateIcon}
        >
          <Popup className="custom-popup">
            <strong>{segment.origin.name}</strong>
            <p>{segment.origin.country}</p>
          </Popup>
        </Marker>
      );

      markers.push(
        <Marker 
          key={`destination-${index}`} 
          position={[segment.destination.coordinates[0], segment.destination.coordinates[1]]}
          icon={index === tripSegments.length - 1 ? destinationIcon : intermediateIcon}
        >
          <Popup className="custom-popup">
            <strong>{segment.destination.name}</strong>
            <p>{segment.destination.country}</p>
          </Popup>
        </Marker>
      );

      // Add polyline for this segment
      markers.push(
        <Polyline
          key={`line-${index}`}
          positions={[
            [segment.origin.coordinates[0], segment.origin.coordinates[1]],
            [segment.destination.coordinates[0], segment.destination.coordinates[1]]
          ]}
          {...polylineOptions}
        />
      );
    });

    // Add current origin and destination markers
    if (originCity) {
      const isPartOfSegment = tripSegments.some(
        segment => segment.origin.name === originCity.name || segment.destination.name === originCity.name
      );

      if (!isPartOfSegment) {
        markers.push(
          <Marker 
            key="current-origin" 
            position={[originCity.coordinates[0], originCity.coordinates[1]]}
            icon={tripSegments.length === 0 ? originIcon : intermediateIcon}
          >
            <Popup className="custom-popup">
              <strong>{originCity.name}</strong>
              <p>{originCity.country}</p>
            </Popup>
          </Marker>
        );
      }
    }

    if (destinationCity) {
      const isPartOfSegment = tripSegments.some(
        segment => segment.origin.name === destinationCity.name || segment.destination.name === destinationCity.name
      );

      if (!isPartOfSegment) {
        markers.push(
          <Marker 
            key="current-destination" 
            position={[destinationCity.coordinates[0], destinationCity.coordinates[1]]}
            icon={destinationIcon}
          >
            <Popup className="custom-popup">
              <strong>{destinationCity.name}</strong>
              <p>{destinationCity.country}</p>
            </Popup>
          </Marker>
        );

        // Add polyline between current origin and destination
        if (originCity) {
          markers.push(
            <Polyline
              key="current-line"
              positions={[
                [originCity.coordinates[0], originCity.coordinates[1]],
                [destinationCity.coordinates[0], destinationCity.coordinates[1]]
              ]}
              {...polylineOptions}
            />
          );
        }
      }
    }

    return markers;
  };

  const handleSegmentAdd = (segment: TripSegment) => {
    setTripSegments([...tripSegments, segment]);
    setOriginCity(segment.destination); // Set the new origin to the last destination
    setDestinationCity(null);
    setIsHighlighted(true);
  };

  const getTransportIcon = (transportName: string) => {
    const name = transportName.toLowerCase();
    
    if (name.includes('plane')) {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6667 12.5L11.6667 10L17.5 3.33333L15.8333 1.66667L9.16668 7.5L6.66668 2.5L5.00001 4.16667L7.50001 9.16667L2.50001 15.8333L4.16668 17.5L10.8333 12.5L15.8333 15L17.5 13.3333L12.5 8.33333L15 3.33333L13.3333 1.66667L8.33334 4.16667L5.83334 1.66667L4.16668 3.33333L6.66668 5.83333" 
            stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    if (name.includes('train')) {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3333 15.8333L15 17.5V18.3333H5V17.5L6.66667 15.8333M13.3333 15.8333H6.66667M13.3333 15.8333V5.83333M6.66667 15.8333V5.83333M15 5.83333V14.1667H5V5.83333M15 5.83333H5M15 5.83333V3.33333C15 2.41286 14.2538 1.66667 13.3333 1.66667H6.66667C5.74619 1.66667 5 2.41286 5 3.33333V5.83333" 
            stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.33333 12.5H11.6667" stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.33333 9.16667H11.6667" stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    if (name.includes('bus')) {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.33334 5.83333V14.1667C3.33334 15.0871 4.07953 15.8333 5.00001 15.8333M5.00001 15.8333H6.66668M5.00001 15.8333V17.5C5.00001 17.9602 5.37315 18.3333 5.83334 18.3333H7.50001C7.9602 18.3333 8.33334 17.9602 8.33334 17.5V15.8333M13.3333 15.8333H8.33334M13.3333 15.8333H15C15.9205 15.8333 16.6667 15.0871 16.6667 14.1667V5.83333M13.3333 15.8333V17.5C13.3333 17.9602 13.7065 18.3333 14.1667 18.3333H15.8333C16.2935 18.3333 16.6667 17.9602 16.6667 17.5V15.8333M16.6667 5.83333V3.33333C16.6667 2.41286 15.9205 1.66667 15 1.66667H5.00001C4.07953 1.66667 3.33334 2.41286 3.33334 3.33333V5.83333M16.6667 5.83333H3.33334" 
            stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.83334 12.5H8.33334" stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.6667 12.5H14.1667" stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    if (name.includes('car')) {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.8333 15.8333H4.16667C3.24619 15.8333 2.5 15.0871 2.5 14.1667V12.5C2.5 11.5795 3.24619 10.8333 4.16667 10.8333H15.8333C16.7538 10.8333 17.5 11.5795 17.5 12.5V14.1667C17.5 15.0871 16.7538 15.8333 15.8333 15.8333Z" 
            stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 10.8333L13.5833 6.45833C13.3417 5.73333 12.6583 5.23333 11.8917 5.23333H8.10833C7.34167 5.23333 6.65833 5.73333 6.41667 6.45833L5 10.8333" 
            stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.83333 13.3333H5.84167" stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14.1667 13.3333H14.175" stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }

    // Default icon for other transport types
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" 
          stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.33334 6.66667L13.3333 10L8.33334 13.3333V6.66667Z" 
          stroke="#7F56D9" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <div className="homepage">
      <div className="homepage__left">
        <TripForm 
          onOriginSelect={setOriginCity}
          onDestinationSelect={setDestinationCity}
          onSegmentAdd={handleSegmentAdd}
          setIsHighlighted={setIsHighlighted}
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
            attribution={mapConfig.attribution}
            url={mapConfig.url}
          />
          {renderMarkers()}
        </MapContainer>
      </div>

      {tripSegments.length > 0 && (
        <div 
          className={`trip-summary ${isSegmentsPanelExpanded ? 'trip-summary--expanded' : ''} ${
            isHighlighted ? 'trip-summary--highlighted' : ''
          }`}
        >
          <div 
            className="trip-summary__header"
          >
            <div className="trip-summary__content" onClick={() => setIsSegmentsPanelExpanded(!isSegmentsPanelExpanded)}>
              <div className="trip-summary__cities">
                {tripSegments.length > 0 ? (
                  <>
                    {tripSegments.map((segment, index) => (
                      <React.Fragment key={index}>
                        {index === 0 && segment.origin.name}
                        {" → "}
                        {segment.destination.name}
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <>
                    {originCity?.name}
                    {destinationCity && " → "}
                    {destinationCity?.name}
                  </>
                )}
              </div>
              <div className="trip-summary__totals">
                <span>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7F56D9"><path d="m136-240-56-56 212-212q35-35 85-35t85 35l46 46q12 12 28.5 12t28.5-12l178-178H640v-80h240v240h-80v-103L621-405q-35 35-85 35t-85-35l-47-47q-11-11-28-11t-28 11L136-240Z"/></svg>
                  Total Distance: {Math.round(totalDistance)} km
                </span>
                <span>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7F56D9"><path d="M280-80v-160H0l154-240H80l280-400 120 172 120-172 280 400h-74l154 240H680v160H520v-160h-80v160H280Zm389-240h145L659-560h67L600-740l-71 101 111 159h-74l103 160Zm-523 0h428L419-560h67L360-740 234-560h67L146-320Zm0 0h155-67 252-67 155-428Zm523 0H566h74-111 197-67 155-145Zm-149 80h160-160Zm201 0Z"/></svg>
                  Total Emissions: {Math.round(totalEmissions)} kg CO2
                </span>
              </div>
            </div>
            <button className="trip-summary__save-button">Save my trip</button>
            <button 
              className="trip-summary__toggle"
              aria-label={isSegmentsPanelExpanded ? "Collapse details" : "Expand details"}
              onClick={() => setIsSegmentsPanelExpanded(!isSegmentsPanelExpanded)}
            >
              <svg 
                width="30" 
                height="30" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: isSegmentsPanelExpanded ? 'rotate(180deg)' : 'none' }}
              >
                <path d="M5 7.5L10 12.5L15 7.5" 
                  stroke="currentColor" 
                  strokeWidth="1.67" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
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
                    <span>Distance: {Math.round(segment.distance)} km</span>
                    <span className={`transport-icon transport-icon--${segment.transport.slug}`}></span>
                    <span>Emissions: {Math.round(segment.emissions)} kg CO2</span>
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
