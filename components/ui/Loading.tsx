import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

type LoadingSkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
};

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width: skeletonWidth = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);
  const skeletonActualWidth = typeof skeletonWidth === 'string' 
    ? (skeletonWidth === '100%' ? width : 200) 
    : skeletonWidth;

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-skeletonActualWidth, skeletonActualWidth]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth,
          height,
          borderRadius,
          backgroundColor: colors.disabled,
        },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          animatedStyle,
          {
            backgroundColor: colors.surface,
          }
        ]}
      />
    </View>
  );
};

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large';
  color?: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color
}) => {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);

  const sizes = {
    small: 20,
    medium: 40,
    large: 60,
  };

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.spinner,
        animatedStyle,
        {
          width: sizes[size],
          height: sizes[size],
          borderColor: colors.disabled,
          borderTopColor: color || colors.primary,
        }
      ]}
    />
  );
};

type SkeletonCardProps = {
  showImage?: boolean;
  lines?: number;
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = false,
  lines = 3
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {showImage && (
        <LoadingSkeleton
          width={60}
          height={60}
          borderRadius={8}
          style={styles.cardImage}
        />
      )}
      <View style={styles.cardContent}>
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingSkeleton
            key={index}
            width={index === lines - 1 ? '60%' : '100%'}
            height={16}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '50%',
    height: '100%',
    opacity: 0.5,
  },
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
    borderStyle: 'solid',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardImage: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
});
