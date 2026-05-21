import {View, type ViewStyle} from 'react-native';

type IconProps = {
  color: string;
  size?: number;
};

function homeIconStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, justifyContent: 'flex-end'};
  const base: ViewStyle = {
    width: size * 0.82,
    height: size * 0.52,
    borderWidth: 2,
    borderColor: color,
    borderTopWidth: 0,
    alignSelf: 'center',
  };
  const roof: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: size * 0.09,
    width: size * 0.64,
    height: size * 0.36,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: color,
    transform: [{rotate: '45deg'}, {scaleX: 0.72}],
  };
  return {root, base, roof};
}

export function IconTabHome({color, size = 24}: IconProps) {
  const s = homeIconStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.roof} />
      <View style={s.base} />
    </View>
  );
}

function heartIconStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, alignItems: 'center', justifyContent: 'center'};
  const left: ViewStyle = {
    position: 'absolute',
    left: size * 0.14,
    top: size * 0.22,
    width: size * 0.36,
    height: size * 0.36,
    borderWidth: 2,
    borderColor: color,
    borderRadius: size * 0.18,
    transform: [{rotate: '-45deg'}],
  };
  const right: ViewStyle = {
    position: 'absolute',
    right: size * 0.14,
    top: size * 0.22,
    width: size * 0.36,
    height: size * 0.36,
    borderWidth: 2,
    borderColor: color,
    borderRadius: size * 0.18,
    transform: [{rotate: '45deg'}],
  };
  const tip: ViewStyle = {
    position: 'absolute',
    bottom: size * 0.12,
    width: size * 0.34,
    height: size * 0.34,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: color,
    transform: [{rotate: '45deg'}],
  };
  return {root, left, right, tip};
}

function shopIconStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, alignItems: 'center', justifyContent: 'center'};
  const awning: ViewStyle = {
    position: 'absolute',
    top: size * 0.04,
    width: size * 0.82,
    height: size * 0.22,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: color,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  };
  const stripe: ViewStyle = {
    position: 'absolute',
    top: size * 0.1,
    left: size * 0.38,
    width: 2,
    height: size * 0.12,
    backgroundColor: color,
  };
  const facade: ViewStyle = {
    marginTop: size * 0.2,
    width: size * 0.72,
    height: size * 0.58,
    borderWidth: 2,
    borderColor: color,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: size * 0.1,
  };
  const door: ViewStyle = {
    width: size * 0.28,
    height: size * 0.3,
    borderWidth: 2,
    borderColor: color,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  };
  return {root, awning, stripe, facade, door};
}

export function IconTabShop({color, size = 24}: IconProps) {
  const s = shopIconStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.awning} />
      <View style={s.stripe} />
      <View style={s.facade}>
        <View style={s.door} />
      </View>
    </View>
  );
}

export function IconTabFavorite({color, size = 24}: IconProps) {
  const s = heartIconStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.left} />
      <View style={s.right} />
      <View style={s.tip} />
    </View>
  );
}

function cartIconStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, justifyContent: 'center'};
  const basket: ViewStyle = {
    width: size * 0.78,
    height: size * 0.52,
    borderWidth: 2,
    borderColor: color,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    alignSelf: 'center',
    marginTop: size * 0.12,
  };
  const handle: ViewStyle = {
    position: 'absolute',
    top: size * 0.08,
    left: size * 0.2,
    width: size * 0.48,
    height: size * 0.28,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: color,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  };
  const wheelL: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: size * 0.22,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color,
  };
  const wheelR: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: size * 0.22,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color,
  };
  return {root, basket, handle, wheelL, wheelR};
}

export function IconTabCart({color, size = 24}: IconProps) {
  const s = cartIconStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.handle} />
      <View style={s.basket} />
      <View style={s.wheelL} />
      <View style={s.wheelR} />
    </View>
  );
}

function profileIconStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, alignItems: 'center'};
  const head: ViewStyle = {
    width: size * 0.38,
    height: size * 0.38,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: color,
    marginTop: size * 0.06,
  };
  const body: ViewStyle = {
    width: size * 0.72,
    height: size * 0.36,
    borderWidth: 2,
    borderColor: color,
    borderTopWidth: 0,
    borderBottomLeftRadius: size * 0.36,
    borderBottomRightRadius: size * 0.36,
    marginTop: -2,
  };
  return {root, head, body};
}

export function IconTabProfile({color, size = 24}: IconProps) {
  const s = profileIconStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.head} />
      <View style={s.body} />
    </View>
  );
}
