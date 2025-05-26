import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

const { width } = Dimensions.get('window');

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={colors.success} />;
      case 'error':
        return <XCircle size={20} color={colors.error} />;
      case 'warning':
        return <AlertCircle size={20} color={colors.warning} />;
      case 'info':
        return <Info size={20} color={colors.info} />;
    }
  };

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { background: colors.successBackground, border: colors.success };
      case 'error':
        return { background: colors.errorBackground, border: colors.error };
      case 'warning':
        return { background: colors.warningBackground, border: colors.warning };
      case 'info':
        return { background: colors.infoBackground, border: colors.info };
    }
  };

  const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(removeToast)(toast.id);
        });
      }, toast.duration! - 300);

      return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    const toastColors = getToastColors(toast.type);

    return (
      <Animated.View
        style={[
          styles.toast,
          animatedStyle,
          {
            backgroundColor: toastColors.background,
            borderColor: toastColors.border,
          }
        ]}
      >
        {getToastIcon(toast.type)}
        <Text style={[styles.toastText, { color: colors.text }]}>{toast.message}</Text>
      </Animated.View>
    );
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <View style={[styles.toastContainer, { top: insets.top + 10 }]} pointerEvents="none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
  },  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
