import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react-native';
import { getWeatherData, getWeatherRecommendation } from '@/services/weatherService';
import { WeatherData } from '@/types';

type WeatherWidgetProps = {
  latitude?: number;
  longitude?: number;
  onPress?: () => void;
};

export function WeatherWidget({ latitude = 37.7749, longitude = -122.4194, onPress }: WeatherWidgetProps) {
  const { colors } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, [latitude, longitude]);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await getWeatherData(latitude, longitude);
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun size={20} color="#FFA500" />;
      case 'cloudy':
        return <Cloud size={20} color="#87CEEB" />;
      case 'rainy':
        return <CloudRain size={20} color="#4682B4" />;
      case 'partly_cloudy':
        return <Cloud size={20} color="#87CEEB" />;
      default:
        return <Sun size={20} color="#FFA500" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return '#FFA500';
      case 'cloudy':
        return '#87CEEB';
      case 'rainy':
        return '#4682B4';
      case 'partly_cloudy':
        return '#87CEEB';
      default:
        return colors.text;
    }
  };
  if (loading) {
    return (
      <View style={[
        styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          shadowColor: colors.text,
        }
      ]}>
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Loading weather...
        </Text>
      </View>
    );
  }

  if (!weather) {
    return null;
  }
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          shadowColor: colors.text,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.mainInfo}>
          {getWeatherIcon(weather.condition)}
          <Text style={[styles.temperature, { color: colors.text }]}>
            {weather.temperature}°C
          </Text>
        </View>
        <Text style={[styles.condition, { color: getConditionColor(weather.condition) }]}>
          {weather.condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
      </View>
        <View style={styles.details}>
        <View style={styles.detailItem}>
          <Droplets size={14} color={colors.secondaryText} />
          <Text style={[styles.detailText, { color: colors.secondaryText }]}>
            {weather.humidity}%
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Wind size={14} color={colors.secondaryText} />
          <Text style={[styles.detailText, { color: colors.secondaryText }]}>
            {weather.windSpeed} km/h
          </Text>
        </View>
      </View>
      
      <Text style={[styles.recommendation, { color: colors.secondaryText }]} numberOfLines={2}>
        {getWeatherRecommendation(weather)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 16,
    left: 16,
    zIndex: 1000,
    padding: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    // Make it more compact for floating design
    maxWidth: 280,
    alignSelf: 'flex-end',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    marginLeft: 6,
  },
  condition: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  recommendation: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
});
