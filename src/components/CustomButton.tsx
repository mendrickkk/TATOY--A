import type {ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {Text, TouchableOpacity, View} from 'react-native';

type CustomButtonProps = {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  label: ReactNode;
  onPress: () => void;
};

const CustomButton = ({
  containerStyle,
  textStyle,
  label,
  onPress,
}: CustomButtonProps) => {
  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
          }}>
          <Text style={textStyle}>{label}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
