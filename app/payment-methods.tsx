import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  CreditCard, 
  Plus, 
  Check, 
  Trash2,
  ArrowLeft
} from 'lucide-react-native';
import { 
  getPaymentMethods, 
  removePaymentMethod, 
  setDefaultPaymentMethod,
  getPaymentIcon,
  formatPaymentMethod
} from '@/services/paymentService';
import { PaymentMethod } from '@/types';

export default function PaymentMethodsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      
      // Update local state
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const handleRemove = (method: PaymentMethod) => {
    if (method.isDefault) {
      Alert.alert(
        'Cannot Remove',
        'You cannot remove your default payment method. Please set another method as default first.'
      );
      return;
    }

    Alert.alert(
      'Remove Payment Method',
      `Are you sure you want to remove ${formatPaymentMethod(method)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePaymentMethod(method.id);
              setPaymentMethods(prev => 
                prev.filter(m => m.id !== method.id)
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            }
          },
        },
      ]
    );
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={[styles.methodCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.methodInfo}>
        <View style={styles.methodIcon}>
          <Text style={styles.iconText}>{getPaymentIcon(item.type)}</Text>
        </View>
        <View style={styles.methodDetails}>
          <Text style={[styles.methodName, { color: colors.text }]}>
            {formatPaymentMethod(item)}
          </Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Check size={12} color="white" />
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.methodActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error }]}
          onPress={() => handleRemove(item)}
        >
          <Trash2 size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <CreditCard size={64} color={colors.secondaryText} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Payment Methods
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.secondaryText }]}>
        Add a payment method to start riding
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (router && router.back) {
              router.back();
            }
          }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            // In a real app, this would navigate to add payment method screen
            Alert.alert('Add Payment Method', 'This would open the add payment method flow');
          }}
        >
          <Plus size={24} color="white" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#32CD32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  actionButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: 'white',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
});
