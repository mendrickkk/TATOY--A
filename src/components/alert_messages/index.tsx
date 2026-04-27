import Toast from 'react-native-toast-message';

interface AlertMessageProps {
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
  visibilityTime?: number;
}

const DEFAULT_POSITION: NonNullable<AlertMessageProps['position']> = 'top';
const DEFAULT_VISIBILITY = 3000;

export const showError = ({
  title,
  message,
  type = 'error',
  position,
  visibilityTime,
}: AlertMessageProps) => {
  Toast.show({
    text1: title,
    text2: message,
    type,
    position: position ?? DEFAULT_POSITION,
    visibilityTime: visibilityTime ?? DEFAULT_VISIBILITY,
  });
};

export const showSuccess = ({
  title,
  message,
  type = 'success',
  position,
  visibilityTime,
}: AlertMessageProps) => {
  Toast.show({
    text1: title,
    text2: message,
    type,
    position: position ?? DEFAULT_POSITION,
    visibilityTime: visibilityTime ?? DEFAULT_VISIBILITY,
  });
};

export const showInfo = ({
  title,
  message,
  type = 'info',
  position,
  visibilityTime,
}: AlertMessageProps) => {
  Toast.show({
    text1: title,
    text2: message,
    type,
    position: position ?? DEFAULT_POSITION,
    visibilityTime: visibilityTime ?? DEFAULT_VISIBILITY,
  });
};
