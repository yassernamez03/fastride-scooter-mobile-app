import { WeatherData } from '@/types';

// Mock weather API - replace with real weather service like OpenWeatherMap
const WEATHER_API_KEY = 'your_weather_api_key_here';

export const getWeatherData = async (
  latitude: number, 
  longitude: number
): Promise<WeatherData> => {
  // In a real app, this would make an API call to a weather service
  // Example: https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock weather data
  const conditions = ['sunny', 'cloudy', 'rainy', 'partly_cloudy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: Math.round(15 + Math.random() * 20), // 15-35°C
    condition: randomCondition,
    icon: getWeatherIcon(randomCondition),
    humidity: Math.round(40 + Math.random() * 40), // 40-80%
    windSpeed: Math.round(Math.random() * 15), // 0-15 km/h
  };
};

const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    partly_cloudy: '⛅',
  };
  
  return iconMap[condition] || '🌤️';
};

export const getWeatherRecommendation = (weather: WeatherData): string => {
  if (weather.condition === 'rainy') {
    return 'Rainy conditions - consider alternative transport or wait for better weather.';
  }
  
  if (weather.windSpeed > 20) {
    return 'High winds detected - ride with caution and consider a helmet.';
  }
  
  if (weather.temperature < 5) {
    return 'Cold weather - dress warmly and consider gloves for better grip.';
  }
  
  if (weather.temperature > 30) {
    return 'Hot weather - stay hydrated and consider riding in shaded areas.';
  }
  
  return 'Perfect weather for riding! Enjoy your journey.';
};
