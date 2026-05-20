import React, {useCallback, useEffect, useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {BRAND, FONTS} from '../../utils';
import {registerAppAlertHandler} from './appAlert';
import type {AppAlertButton, AppAlertConfig} from './types';

function AlertButton({
  button,
  stacked,
  onPress,
}: {
  button: AppAlertButton;
  stacked: boolean;
  onPress: (button: AppAlertButton) => void;
}) {
  const style = button.style ?? 'default';
  const isCancel = style === 'cancel';
  const isDestructive = style === 'destructive';

  return (
    <Pressable
      style={({pressed}) => [
        stacked ? styles.btnStacked : styles.btnInline,
        isCancel && styles.btnCancel,
        isDestructive && styles.btnDestructive,
        !isCancel && !isDestructive && styles.btnPrimary,
        pressed && styles.btnPressed,
      ]}
      onPress={() => onPress(button)}
      accessibilityRole="button"
      accessibilityLabel={button.text}>
      <Text
        style={[
          styles.btnText,
          isCancel && styles.btnTextCancel,
          isDestructive && styles.btnTextDestructive,
          !isCancel && !isDestructive && styles.btnTextPrimary,
        ]}>
        {button.text}
      </Text>
    </Pressable>
  );
}

const AppAlertProvider = ({children}: {children: React.ReactNode}) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AppAlertConfig | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const show = useCallback((next: AppAlertConfig) => {
    setConfig(next);
    setVisible(true);
  }, []);

  useEffect(() => {
    registerAppAlertHandler(show);
    return () => registerAppAlertHandler(null);
  }, [show]);

  const onButtonPress = useCallback(
    (button: AppAlertButton) => {
      dismiss();
      requestAnimationFrame(() => {
        button.onPress?.();
      });
    },
    [dismiss],
  );

  const buttons = config?.buttons ?? [];
  const stacked = buttons.length > 2;

  return (
    <>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={dismiss}
        statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={dismiss} accessibilityLabel="Close dialog">
          <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>{config?.title}</Text>
            {config?.message ? <Text style={styles.message}>{config.message}</Text> : null}
            <View style={[styles.actions, stacked && styles.actionsStacked]}>
              {buttons.map((btn, index) => (
                <AlertButton
                  key={`${btn.text}-${index}`}
                  button={btn}
                  stacked={stacked}
                  onPress={onButtonPress}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: BRAND.maroonPrimary,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: '700',
    color: BRAND.productTitle,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 4,
  },
  message: {
    fontFamily: FONTS.body,
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    textAlign: 'center',
  },
  actions: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  btnInline: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  btnStacked: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnPrimary: {
    backgroundColor: BRAND.maroonPrimary,
  },
  btnCancel: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btnDestructive: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#b91c1c',
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: '700',
  },
  btnTextPrimary: {
    color: '#ffffff',
  },
  btnTextCancel: {
    color: '#374151',
  },
  btnTextDestructive: {
    color: '#b91c1c',
  },
});

export default AppAlertProvider;
