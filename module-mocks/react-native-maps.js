// Comprehensive mock for react-native-maps on web
import * as React from 'react';

// Main components
const MapView = (props) => {
  return React.createElement('div', { 
    ...props, 
    style: { width: '100%', height: '400px', backgroundColor: '#f0f0f0', ...props.style } 
  }, props.children || 'Map View Placeholder');
};

// Marker component
const Marker = (props) => {
  return React.createElement('div', { ...props }, 'Map Marker');
};

// Callout component
const Callout = (props) => {
  return React.createElement('div', { ...props }, props.children);
};

// Polyline component
const Polyline = () => null;

// Circle component
const Circle = () => null;

// Polygon component
const Polygon = () => null;

// Other components
const Overlay = () => null;
const Heatmap = () => null;

// Mock the AnimatedRegion
class AnimatedRegion {
  constructor() {}
  timing() { return { start: () => {} }; }
}

// Add these as properties to MapView
MapView.Marker = Marker;
MapView.Callout = Callout;
MapView.Polyline = Polyline;
MapView.Polygon = Polygon;
MapView.Circle = Circle;
MapView.Overlay = Overlay;
MapView.Heatmap = Heatmap;
MapView.AnimatedRegion = AnimatedRegion;

// Export specific components
export {
  Marker,
  Callout,
  Polyline,
  Circle,
  Polygon,
  Overlay,
  Heatmap,
  AnimatedRegion
};

// Mock the native commands that are causing issues
export const Commands = {
  // Add any commands used in your app
  setNativeProps: () => {},
  animateToRegion: () => {},
  fitToElements: () => {},
  fitToSuppliedMarkers: () => {},
  fitToCoordinates: () => {},
};

// Export default
export default MapView;
