import {View, type ViewStyle} from 'react-native';

type IconProps = {color: string; size?: number};

function personStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, alignItems: 'center'};
  const head: ViewStyle = {
    width: size * 0.36,
    height: size * 0.36,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: color,
    marginTop: 1,
  };
  const body: ViewStyle = {
    width: size * 0.62,
    height: size * 0.3,
    borderWidth: 1.5,
    borderColor: color,
    borderTopWidth: 0,
    borderBottomLeftRadius: size * 0.3,
    borderBottomRightRadius: size * 0.3,
    marginTop: -1,
  };
  return {root, head, body};
}

export function IconProfilePerson({color, size = 22}: IconProps) {
  const s = personStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.head} />
      <View style={s.body} />
    </View>
  );
}

function lockStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, justifyContent: 'flex-end', alignItems: 'center'};
  const body: ViewStyle = {
    width: size * 0.58,
    height: size * 0.42,
    borderWidth: 1.5,
    borderColor: color,
    borderRadius: 3,
  };
  const shackle: ViewStyle = {
    position: 'absolute',
    top: 0,
    width: size * 0.34,
    height: size * 0.28,
    borderWidth: 1.5,
    borderColor: color,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  };
  return {root, body, shackle};
}

export function IconProfileLock({color, size = 22}: IconProps) {
  const s = lockStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.shackle} />
      <View style={s.body} />
    </View>
  );
}

function ordersStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size};
  const face: ViewStyle = {
    width: size * 0.72,
    height: size * 0.72,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: color,
    alignSelf: 'center',
  };
  const hand: ViewStyle = {
    position: 'absolute',
    right: 0,
    bottom: size * 0.2,
    width: size * 0.28,
    height: 1.5,
    backgroundColor: color,
    transform: [{rotate: '-35deg'}],
  };
  return {root, face, hand};
}

export function IconProfileOrders({color, size = 22}: IconProps) {
  const s = ordersStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.face} />
      <View style={s.hand} />
    </View>
  );
}

function wishlistStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, alignItems: 'center', justifyContent: 'center'};
  const left: ViewStyle = {
    position: 'absolute',
    left: size * 0.16,
    top: size * 0.2,
    width: size * 0.34,
    height: size * 0.34,
    borderWidth: 1.5,
    borderColor: color,
    borderRadius: size * 0.17,
    transform: [{rotate: '-45deg'}],
  };
  const right: ViewStyle = {
    position: 'absolute',
    right: size * 0.16,
    top: size * 0.2,
    width: size * 0.34,
    height: size * 0.34,
    borderWidth: 1.5,
    borderColor: color,
    borderRadius: size * 0.17,
    transform: [{rotate: '45deg'}],
  };
  const tip: ViewStyle = {
    position: 'absolute',
    bottom: size * 0.14,
    width: size * 0.32,
    height: size * 0.32,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: color,
    transform: [{rotate: '45deg'}],
  };
  return {root, left, right, tip};
}

export function IconProfileWishlist({color, size = 22}: IconProps) {
  const s = wishlistStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.left} />
      <View style={s.right} />
      <View style={s.tip} />
    </View>
  );
}

function logoutStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size, justifyContent: 'center'};
  const door: ViewStyle = {
    width: size * 0.5,
    height: size * 0.62,
    borderWidth: 1.5,
    borderColor: color,
    borderRightWidth: 0,
    marginLeft: size * 0.12,
  };
  const arrow: ViewStyle = {
    position: 'absolute',
    right: 0,
    width: size * 0.38,
    height: 1.5,
    backgroundColor: color,
    top: size * 0.42,
  };
  return {root, door, arrow};
}

export function IconProfileLogout({color, size = 22}: IconProps) {
  const s = logoutStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.door} />
      <View style={s.arrow} />
    </View>
  );
}

function pencilStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size};
  const body: ViewStyle = {
    position: 'absolute',
    left: size * 0.2,
    top: size * 0.42,
    width: size * 0.52,
    height: 2,
    backgroundColor: color,
    borderRadius: 1,
    transform: [{rotate: '-45deg'}],
  };
  const tip: ViewStyle = {
    position: 'absolute',
    right: size * 0.18,
    top: size * 0.14,
    width: size * 0.22,
    height: size * 0.22,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: color,
    transform: [{rotate: '45deg'}],
  };
  return {root, body, tip};
}

export function IconPencil({color, size = 18}: IconProps) {
  const s = pencilStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.body} />
      <View style={s.tip} />
    </View>
  );
}
