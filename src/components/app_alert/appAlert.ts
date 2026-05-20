import type {AppAlertButton, AppAlertConfig} from './types';

type ShowHandler = (config: AppAlertConfig) => void;

let showHandler: ShowHandler | null = null;

export function registerAppAlertHandler(handler: ShowHandler | null): void {
  showHandler = handler;
}

function normalizeButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (buttons && buttons.length > 0) {
    return buttons;
  }
  return [{text: 'OK', style: 'default'}];
}

/** Branded modal alert — drop-in replacement for `Alert.alert(title, message?, buttons?)`. */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
): void {
  showHandler?.({
    title,
    message: message?.trim() || undefined,
    buttons: normalizeButtons(buttons),
  });
}

export const AppAlert = {
  alert: appAlert,
};
