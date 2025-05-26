module.exports = function(api) {
  // Set the cache configuration (this is what's missing in your configuration)
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // Only handle the @ alias here
            '@': './',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // Ensure it resolves these extensions
        },
      ],
    ],
  };
};
