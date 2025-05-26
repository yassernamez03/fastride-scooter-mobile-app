import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Scan, X, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { unlockScooter } from '@/services/scooterService';

export default function ScanScreen() {
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scannedCode) {
      setScannedCode(data);
    }
  };

  const resetScan = () => {
    setScannedCode(null);
    setIsUnlocking(false);
  };

  const handleUnlock = async () => {
    if (!scannedCode) return;
    
    setIsUnlocking(true);
    try {
      // In a real app, you would validate the QR code and unlock the scooter
      const result = await unlockScooter(scannedCode);
      if (result.success) {
        // Navigate to active ride screen or show success message
        router.push({
          pathname: '/ride',
          params: { scooterId: result.scooterId }
        });
      } else {
        // Show error
        setIsUnlocking(false);
      }
    } catch (error) {
      console.error('Error unlocking scooter:', error);
      setIsUnlocking(false);
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.text }]}>Camera Access Required</Text>
        <Text style={[styles.text, { color: colors.secondaryText, marginBottom: 24 }]}>
          We need your permission to access the camera to scan scooter QR codes.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera view */}
      <CameraView
        style={styles.camera}
        facing={CameraType.back}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
        onBarcodeScanned={scannedCode ? undefined : handleBarCodeScanned}
      >
        {/* Header */}
        <View style={[styles.header, { marginTop: insets.top }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <BlurView intensity={80} tint={theme === 'dark' ? 'dark' : 'light'} style={styles.blurButton}>
              <ChevronLeft size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scanner UI */}
        {!scannedCode ? (
          <View style={styles.scannerContainer}>
            <View style={styles.scanner}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <Text style={styles.scannerText}>
              Align QR code within the frame
            </Text>
          </View>
        ) : (
          <BlurView 
            intensity={90} 
            tint={theme === 'dark' ? 'dark' : 'light'} 
            style={styles.resultContainer}
          >
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Scooter Found!</Text>
                <TouchableOpacity onPress={resetScan}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scooterInfo}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/5061568/pexels-photo-5061568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
                  style={styles.scooterImage} 
                />
                <View style={styles.scooterDetails}>
                  <Text style={[styles.scooterName, { color: colors.text }]}>FastRide Scooter</Text>
                  <Text style={[styles.scooterID, { color: colors.secondaryText }]}>
                    ID: {scannedCode.substring(0, 8)}...
                  </Text>
                  <View style={styles.scooterStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>87%</Text>
                      <Text style={styles.statLabel}>Battery</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>$0.15</Text>
                      <Text style={styles.statLabel}>Per min</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.unlockButton, 
                  { backgroundColor: colors.primary },
                  isUnlocking && { opacity: 0.7 }
                ]}
                onPress={handleUnlock}
                disabled={isUnlocking}
              >
                <Text style={styles.unlockButtonText}>
                  {isUnlocking ? 'Unlocking...' : 'Unlock Scooter'}
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanner: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: 'white',
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: 'white',
    borderTopRightRadius: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: 'white',
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: 'white',
    borderBottomRightRadius: 10,
  },
  scannerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
    marginTop: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 400,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#2B2B2B',
  },
  scooterInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  scooterImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  scooterDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  scooterName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  scooterID: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginBottom: 8,
  },
  scooterStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#32CD32',
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#757575',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  unlockButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});