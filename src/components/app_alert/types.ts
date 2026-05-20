export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: AppAlertButtonStyle;
};

export type AppAlertConfig = {
  title: string;
  message?: string;
  buttons: AppAlertButton[];
};
