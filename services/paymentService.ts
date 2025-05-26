import { PaymentMethod } from '@/types';

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    isDefault: true,
  },
  {
    id: '2',
    type: 'apple_pay',
    isDefault: false,
  },
  {
    id: '3',
    type: 'google_pay',
    isDefault: false,
  },
];

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  // In a real app, this would fetch from your payment processor (Stripe, etc.)
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPaymentMethods;
};

export const addPaymentMethod = async (
  paymentData: Omit<PaymentMethod, 'id'>
): Promise<PaymentMethod> => {
  // In a real app, this would integrate with Stripe or another payment processor
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newMethod: PaymentMethod = {
    ...paymentData,
    id: Date.now().toString(),
  };
  
  return newMethod;
};

export const removePaymentMethod = async (id: string): Promise<boolean> => {
  // In a real app, this would remove the payment method from your payment processor
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};

export const setDefaultPaymentMethod = async (id: string): Promise<boolean> => {
  // In a real app, this would update the default payment method
  await new Promise(resolve => setTimeout(resolve, 300));
  return true;
};

export const processPayment = async (
  amount: number,
  paymentMethodId: string,
  description: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // In a real app, this would process the payment through your payment processor
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05;
  
  if (success) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
    };
  } else {
    return {
      success: false,
      error: 'Payment failed. Please try again or use a different payment method.',
    };
  }
};

export const getPaymentIcon = (type: PaymentMethod['type']): string => {
  const iconMap: Record<PaymentMethod['type'], string> = {
    card: '💳',
    paypal: '🅿️',
    apple_pay: '🍎',
    google_pay: '🟢',
  };
  
  return iconMap[type] || '💳';
};

export const formatPaymentMethod = (method: PaymentMethod): string => {
  switch (method.type) {
    case 'card':
      return `${method.brand} •••• ${method.last4}`;
    case 'apple_pay':
      return 'Apple Pay';
    case 'google_pay':
      return 'Google Pay';
    case 'paypal':
      return 'PayPal';
    default:
      return 'Payment Method';
  }
};
