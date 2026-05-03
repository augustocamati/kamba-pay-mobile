export interface CustomAlertOptions {
  title: string;
  message?: string;
  buttons?: Array<{
    text?: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

type Listener = (data: CustomAlertOptions) => void;
const listeners = new Set<Listener>();

export const AlertEmitter = {
  addListener: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emit: (data: CustomAlertOptions) => {
    listeners.forEach(listener => listener(data));
  }
};

import { Alert } from 'react-native';

export const setupGlobalAlerts = () => {
  Alert.alert = (title, message, buttons) => {
    AlertEmitter.emit({ title, message, buttons });
  };
};
