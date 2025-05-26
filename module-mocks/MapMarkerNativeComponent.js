// Mock for MapMarkerNativeComponent.js on web platform
// This is a direct mock for the file mentioned in the error message

import React from 'react';

// Mock component that returns null on web
const MapMarkerNativeComponent = () => null;

// Mock any methods or properties used from this component
MapMarkerNativeComponent.Commands = {
  // Add any commands used in the app
  animateMarkerToCoordinate: () => {},
  redraw: () => {},
  showCallout: () => {},
  hideCallout: () => {},
};

export default MapMarkerNativeComponent;
