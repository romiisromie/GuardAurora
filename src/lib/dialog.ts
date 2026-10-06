import { Alert, AlertButton, Platform } from 'react-native';

/**
 * Alert.alert is a no-op in react-native-web, so on web fall back to the browser's
 * confirm/alert: the first non-cancel button is the confirm action.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const cancel = buttons?.find(button => button.style === 'cancel');
  const action = buttons?.find(button => button !== cancel);
  if (!action) {
    window.alert(text);
    cancel?.onPress?.();
    return;
  }
  if (window.confirm(text)) action.onPress?.();
  else cancel?.onPress?.();
}
