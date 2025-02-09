"use client"

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface MapProps {
  center: [number, number];
  onMapClick: (lat: number, lng: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

export default function Map({ center, onMapClick }: MapProps) {
  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAb8x4doNH4duO9kamNG4-lbJh-FmstjtY'}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: center[0], lng: center[1] }}
        zoom={13}
        onClick={handleClick}
      >
        <Marker position={{ lat: center[0], lng: center[1] }} />
      </GoogleMap>
    </LoadScript>
  );
}