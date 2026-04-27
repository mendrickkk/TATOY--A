import React from 'react';
import { View, Text } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

const toastBaseStyle = {
  borderLeftWidth: 0,
  minHeight: 64,
  height: 'auto' as const,
  paddingVertical: 10,
};

const text1Style = {
  fontSize: 14,
  fontWeight: '700' as const,
};

const text2Style = {
  fontSize: 13,
  lineHeight: 18,
  color: '#475569',
};

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        ...toastBaseStyle,
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ ...text1Style, color: '#065f46' }}
      text2Style={text2Style}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        ...toastBaseStyle,
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ ...text1Style, color: '#991b1b' }}
      text2Style={{ ...text2Style, color: '#7f1d1d' }}
    />
  ),

  info: (props) => (
    <View
      style={{
        width: '92%',
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#60a5fa',
        paddingHorizontal: 14,
        paddingVertical: 12,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: '#1e3a8a',
          marginBottom: props.text2 ? 4 : 0,
        }}
      >
        {props.text1}
      </Text>
      {!!props.text2 && (
        <Text
          style={{
            fontSize: 13,
            lineHeight: 18,
            color: '#1e40af',
          }}
        >
          {props.text2}
        </Text>
      )}
    </View>
  ),
};

export default toastConfig;