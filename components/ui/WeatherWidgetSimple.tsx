import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  PanResponder,
  Dimensions,
  LayoutChangeEvent,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Cloud, Sun, CloudRain, Wind, Droplets, Move, X, Eye, EyeOff } from 'lucide-react-native';
import { getWeatherData, getWeatherRecommendation } from '@/services/weatherService';
import { WeatherData } from '@/types';

type WeatherWidgetProps = {
  latitude?: number;
  longitude?: number;
  onPress?: () => void;
};

// Keys for storing widget settings in AsyncStorage
const POSITION_STORAGE_KEY = 'weather_widget_position';
const VISIBILITY_STORAGE_KEY = 'weather_widget_visible';

export function WeatherWidgetSimple({ latitude = 37.7749, longitude = -122.4194, onPress }: WeatherWidgetProps) {
  const { colors } = useTheme();  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [showOptionsHint, setShowOptionsHint] = useState<boolean>(true);
  const [widgetDimensions, setWidgetDimensions] = useState({ width: 0, height: 0 });
  
  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Animated values for position
  const positionX = useSharedValue(screenWidth - 296); 
  const positionY = useSharedValue(100);
  // Load saved position and visibility settings on init
  useEffect(() => {
    async function loadSettings() {
      try {
        // Load position
        const positionString = await AsyncStorage.getItem(POSITION_STORAGE_KEY);
        if (positionString) {
          const savedPosition = JSON.parse(positionString);
          positionX.value = savedPosition.x;
          positionY.value = savedPosition.y;
        }
        
        // Load visibility setting
        const visibilityString = await AsyncStorage.getItem(VISIBILITY_STORAGE_KEY);
        if (visibilityString !== null) {
          setIsVisible(JSON.parse(visibilityString));
        }
      } catch (err) {
        console.error('Failed to load widget settings:', err);
      }
    }
    
    loadSettings();
    
    // Hide options hint after 5 seconds
    const optionsHintTimer = setTimeout(() => {
      setShowOptionsHint(false);
    }, 5000);
    
    return () => {
      clearTimeout(optionsHintTimer);
    };
  }, []);
  
  // Load weather data when coordinates change
  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        const weatherData = await getWeatherData(latitude, longitude);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error loading weather:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadWeather();
  }, [latitude, longitude]);
  
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setWidgetDimensions({ width, height });
  }, []);
    // Store position when dragging ends
  async function storePosition(x: number, y: number) {
    try {
      await AsyncStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify({ x, y }));
    } catch (error) {
      console.error('Error saving position:', error);
    }
  }
  
  // Toggle widget visibility
  async function toggleVisibility() {
    try {
      const newVisibility = !isVisible;
      setIsVisible(newVisibility);
      await AsyncStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(newVisibility));
      
      // Show confirmation
      if (!newVisibility) {
        Alert.alert(
          "Weather Widget Hidden", 
          "Weather widget has been hidden. You can restore it from the Settings screen.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error toggling widget visibility:', error);
    }
  }
    // Toggle options menu
  function handleLongPress() {
    setShowOptions(!showOptions);
    if (showOptionsHint) {
      setShowOptionsHint(false);
    }
  }
  
  // Handle drag end
  function handleDragEnd() {
    setIsMoving(false);
    
    // Snap to edges if near
    const snapThreshold = 20;
    const maxX = screenWidth - widgetDimensions.width;
    const maxY = screenHeight - widgetDimensions.height - 80; // Account for bottom tabs
    
    let finalX = positionX.value;
    let finalY = positionY.value;
    
    // Snap to right edge
    if (positionX.value > maxX - snapThreshold) {
      finalX = maxX;
      positionX.value = withSpring(maxX);
    }
    
    // Snap to left edge
    if (positionX.value < snapThreshold) {
      finalX = 0;
      positionX.value = withSpring(0);
    }
    
    // Ensure widget stays within vertical bounds
    if (positionY.value < 90) { // Account for header
      finalY = 90;
      positionY.value = withSpring(90);
    } else if (positionY.value > maxY) {
      finalY = maxY;
      positionY.value = withSpring(maxY);
    }
    
    // Save position
    storePosition(finalX, finalY);
  }
  
  // Store previous gesture values to calculate deltas
  const prevGestureX = useRef(0);
  const prevGestureY = useRef(0);
  
  // PanResponder to handle dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        prevGestureX.current = 0;
        prevGestureY.current = 0;
        setIsMoving(true);
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate deltas from last position to avoid jumps
        const dx = gestureState.dx - prevGestureX.current;
        const dy = gestureState.dy - prevGestureY.current;
        
        // Update positions
        positionX.value = positionX.value + dx;
        positionY.value = positionY.value + dy;
        
        // Store current gesture state for next delta calculation
        prevGestureX.current = gestureState.dx;
        prevGestureY.current = gestureState.dy;
      },
      onPanResponderRelease: () => {
        runOnJS(handleDragEnd)();
      },
      onPanResponderTerminate: () => {
        runOnJS(handleDragEnd)();
      },
    })
  ).current;
  
  // Weather icon mapping
  function getWeatherIcon(condition: string) {
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
  }

  // Get condition color
  function getConditionColor(condition: string) {
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
  }
    function renderContent() {
    if (!isVisible) {
      return null;
    }
    
    if (loading) {
      return (
        <View style={[
          styles.widgetContent,
          { 
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
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
      <View 
        style={[
          styles.widgetContent, 
          { 
            backgroundColor: colors.cardBackground,
            borderColor: isMoving ? colors.primary : colors.border,
            opacity: isMoving ? 0.9 : 1,
          }
        ]}
      >
        <View style={styles.topBar}>
          <View 
            style={styles.dragHandle} 
            {...panResponder.panHandlers}
            onTouchEnd={() => setShowOptions(false)}
          >
            <View style={styles.dragIcon}>
              <Move size={18} color={isMoving ? colors.primary : colors.secondaryText} />
            </View>
          </View>
            <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionsButton}
              onPress={handleLongPress}
            >
              <View style={styles.optionsDots}>
                <View style={[styles.optionsDot, { backgroundColor: colors.text }]} />
                <View style={[styles.optionsDot, { backgroundColor: colors.text }]} />
                <View style={[styles.optionsDot, { backgroundColor: colors.text }]} />
              </View>
            </TouchableOpacity>
            {showOptionsHint && (
              <View style={[styles.optionsHint, { backgroundColor: colors.primary }]}>
                <Text style={styles.optionsHintText}>Tap for options</Text>
              </View>
            )}
          </View>
        </View>
        
        {showOptions && (
          <View style={[styles.optionsMenu, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.optionItem} 
              onPress={toggleVisibility}
            >
              <EyeOff size={16} color={colors.error} />
              <Text style={[styles.optionText, { color: colors.error }]}>Hide Widget</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.header}>
          <View style={styles.mainInfo}>
            {getWeatherIcon(weather.condition)}
            <Text style={[styles.temperature, { color: colors.text }]}>
              {weather.temperature}°C
            </Text>
          </View>
          <Text style={[styles.condition, { color: getConditionColor(weather.condition) }]}>
            {weather.condition.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
      </View>
    );
  }

  // Create animated styles for the widget
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
      ],
    };
  });
  if (!isVisible) {
    // If widget is hidden, render a small button to restore it
    return (
      <TouchableOpacity
        style={[styles.restoreButton, { backgroundColor: colors.primary }]}
        onPress={toggleVisibility}
      >
        <Eye size={18} color={colors.cardBackground} />
      </TouchableOpacity>
    );
  }
  
  return (
    <Animated.View 
      style={[styles.container, animatedStyles]}
      onLayout={onLayout}
    >
      {renderContent()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    width: 280,
  },
  widgetContent: {
    padding: 12,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
  },  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 4,
  },
  dragHandle: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 15,
  },
  dragIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  optionsContainer: {
    position: 'relative',
  },
  optionsButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  optionsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
    opacity: 0.6,
  },
  optionsHint: {
    position: 'absolute',
    right: 0,
    top: 28,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    zIndex: 2000,
  },
  optionsHintText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  optionsMenu: {
    position: 'absolute',
    top: 38,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    zIndex: 1001,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  restoreButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 40, 
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
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
  },
  detailText: {
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
