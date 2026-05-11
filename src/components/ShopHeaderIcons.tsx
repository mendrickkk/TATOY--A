import {View, type ViewStyle} from 'react-native';

type IconProps = {
  color: string;
  size?: number;
};

function searchIconStyles(size: number, color: string) {
  const root: ViewStyle = {width: size, height: size};
  const ring: ViewStyle = {
    position: 'absolute',
    left: 1,
    top: 2,
    width: size * 0.48,
    height: size * 0.48,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: color,
  };
  const handle: ViewStyle = {
    position: 'absolute',
    width: size * 0.32,
    height: 2,
    backgroundColor: color,
    borderRadius: 1,
    right: 1,
    bottom: 3,
    transform: [{rotate: '45deg'}],
  };
  return {root, ring, handle};
}

/** Simple magnifying glass (stroke) for the search pill. */
export function IconSearch({color, size = 22}: IconProps) {
  const s = searchIconStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.ring} />
      <View style={s.handle} />
    </View>
  );
}

function bellIconStyles(size: number, color: string) {
  const w = size * 0.78;
  const bodyH = size * 0.62;
  const wrap: ViewStyle = {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: size * 0.08,
  };
  const body: ViewStyle = {
    width: w,
    height: bodyH,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomLeftRadius: w * 0.55,
    borderBottomRightRadius: w * 0.55,
    borderColor: color,
  };
  const clapper: ViewStyle = {
    position: 'absolute',
    bottom: size * 0.12,
    width: Math.max(3, size * 0.14),
    height: Math.max(3, size * 0.14),
    borderRadius: 99,
    backgroundColor: color,
  };
  return {wrap, body, clapper};
}

/** Minimal bell outline + clapper for the header (monochrome). */
export function IconBell({color, size = 22}: IconProps) {
  const s = bellIconStyles(size, color);
  return (
    <View style={s.wrap}>
      <View style={s.body} />
      <View style={s.clapper} />
    </View>
  );
}

function scannerIconStyles(size: number, color: string) {
  const inner = size * 0.55;
  const outer: ViewStyle = {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const frame: ViewStyle = {
    width: inner,
    height: inner,
    borderWidth: 2,
    borderColor: color,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
  };
  const line: ViewStyle = {height: 2, backgroundColor: color, opacity: 0.9};
  return {outer, frame, line};
}

/** Scanner-style frame with a horizontal scan line. */
export function IconScanner({color, size = 22}: IconProps) {
  const s = scannerIconStyles(size, color);
  return (
    <View style={s.outer}>
      <View style={s.frame}>
        <View style={s.line} />
      </View>
    </View>
  );
}

function slidersRowOuter(size: number, marginTop: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    width: size * 0.72,
    marginTop,
  };
}

function slidersKnob(size: number, color: string): ViewStyle {
  return {
    width: size * 0.16,
    height: size * 0.16,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: color,
  };
}

function slidersBar(size: number, color: string): ViewStyle {
  return {
    flex: 1,
    height: 2,
    backgroundColor: color,
    marginHorizontal: size * 0.06,
  };
}

function slidersIconStyles(size: number, color: string) {
  const root: ViewStyle = {
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
  };
  return {
    root,
    rowTop: slidersRowOuter(size, 0),
    rowBottom: slidersRowOuter(size, size * 0.18),
    knob: slidersKnob(size, color),
    bar: slidersBar(size, color),
  };
}

/** Two “slider” rows with knobs. */
export function IconSliders({color, size = 22}: IconProps) {
  const s = slidersIconStyles(size, color);
  return (
    <View style={s.root}>
      <View style={s.rowTop}>
        <View style={s.knob} />
        <View style={s.bar} />
        <View style={s.knob} />
      </View>
      <View style={s.rowBottom}>
        <View style={s.knob} />
        <View style={s.bar} />
        <View style={s.knob} />
      </View>
    </View>
  );
}
