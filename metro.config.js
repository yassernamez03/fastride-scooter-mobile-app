const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Enable custom resolver to provide mocks for native modules on web platform
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle react-native-maps on web platform
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, './module-mocks/react-native-maps.js'),
      type: 'sourceFile',
    };
  }
    // Direct mock for the problematic MapMarkerNativeComponent file
  if (platform === 'web' && (moduleName === 'react-native-maps/lib/MapMarkerNativeComponent.js' || 
      moduleName === 'react-native-maps/lib/MapMarkerNativeComponent')) {
    return {
      filePath: path.resolve(__dirname, './module-mocks/MapMarkerNativeComponent.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle other specific submodules from react-native-maps
  if (platform === 'web' && moduleName.startsWith('react-native-maps/lib')) {
    return {
      filePath: path.resolve(__dirname, './module-mocks/react-native-maps.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle the specific native commands module that's causing problems
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    // Provide a specific mock for codegenNativeCommands
    return {
      filePath: path.resolve(__dirname, './module-mocks/codegenNativeCommands.js'),
      type: 'sourceFile',
    };
  }
  
  // Default resolution for all other modules
  return require('metro-resolver').resolve(
    {
      ...context,
      resolveRequest: undefined,
    },
    moduleName,
    platform
  );
};

// Ensure Metro knows about the project root for aliases
defaultConfig.watchFolders = [path.resolve(__dirname)];

// If still facing issues, you might need to ensure sourceExts includes ts, tsx, etc.
// but expo/metro-config usually handles this.
// Example: defaultConfig.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx');

module.exports = defaultConfig;
