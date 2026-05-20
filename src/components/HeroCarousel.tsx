import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {AppAlert} from './app_alert';
import {BRAND, IMG} from '../utils';

const CARD_RADIUS = 18;
const CARD_IMAGE_UNDERLAY = '#f5f0f8';
const SLIDE_COUNT = 3;
const AUTO_ADVANCE_MS = 10_000;
/** Matches Home `body` horizontal padding (16 + 16) for slide width / paging. */
const HOME_BODY_GUTTER = 32;
/** Banner aspect ratio (width ÷ height) — avoids stretching; `cover` trims edges only. */
const BANNER_ASPECT = 16 / 9;
const MIN_BANNER_H = 168;
const MAX_BANNER_H = 220;

const LEGIBLE_SHADOW = {
  textShadowColor: 'rgba(255, 255, 255, 0.92)',
  textShadowOffset: {width: 0, height: 0},
  textShadowRadius: 8,
};

const HeroCarousel = () => {
  const {width: screenW} = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /** Measured carousel width — must match each slide width for `pagingEnabled` to work. */
  const [pagerW, setPagerW] = useState(0);

  const slideW =
    pagerW > 0 ? pagerW : Math.max(1, Math.round(screenW - HOME_BODY_GUTTER));

  const cardHeight = useMemo(() => {
    const fromAspect = Math.round(slideW / BANNER_ASPECT);
    return Math.min(MAX_BANNER_H, Math.max(MIN_BANNER_H, fromAspect));
  }, [slideW]);

  const onCardClipLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0) {
      setPagerW(prev => (prev === w ? prev : w));
    }
  }, []);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const w = slideW;
      if (w <= 0) {
        return;
      }
      const page = Math.round(x / w);
      setActiveIndex(Math.min(SLIDE_COUNT - 1, Math.max(0, page)));
    },
    [slideW],
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (slideW <= 0) {
        return;
      }
      const clamped = Math.min(SLIDE_COUNT - 1, Math.max(0, index));
      setActiveIndex(clamped);
      scrollRef.current?.scrollTo({x: clamped * slideW, animated: true});
    },
    [slideW],
  );

  useEffect(() => {
    if (slideW <= 0) {
      return undefined;
    }
    const id = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % SLIDE_COUNT;
        scrollRef.current?.scrollTo({x: next * slideW, animated: true});
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [slideW]);

  return (
    <View style={styles.root} accessibilityRole="summary">
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
        <TouchableOpacity
          onPress={() =>
            AppAlert.alert('Special offers', 'Full offers list is coming soon.')
          }
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityRole="button"
          accessibilityLabel="See all special offers">
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.shadowOuter}>
        <View style={styles.cardClip} onLayout={onCardClipLayout}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            removeClippedSubviews={false}
            style={[styles.pager, {height: cardHeight}]}
            contentContainerStyle={{
              flexDirection: 'row',
              width: slideW * SLIDE_COUNT,
            }}
            onMomentumScrollEnd={onScrollEnd}
            accessibilityLabel={`Special offers carousel, slide ${activeIndex + 1} of ${SLIDE_COUNT}`}>
            {/* Slide 1 — promo + copy */}
            <View style={[styles.slide, {width: slideW, height: cardHeight}]}>
              <Image
                source={IMG.HERO1}
                style={styles.heroBg}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <View style={styles.copyOverlay} pointerEvents="box-none">
                <View style={styles.labelPill}>
                  <Text style={styles.labelText}>{"Today's Offers"}</Text>
                </View>
                <Text style={styles.headline}>Get Special Offer</Text>
                <View style={styles.offerRow}>
                  <Text style={styles.upTo}>Up to</Text>
                  <View
                    style={styles.numberBlock}
                    accessibilityLabel="Up to 20 percent"
                    accessible>
                    <Text style={styles.bigNumber}>20</Text>
                    <Text style={styles.percentSuffix}>%</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.cta}
                  activeOpacity={0.88}
                  onPress={() =>
                    AppAlert.alert('Order', 'Promo checkout will open here soon.')
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Order now, special offer">
                  <Text style={styles.ctaText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Slide 2 — image only */}
            <View style={[styles.slide, {width: slideW, height: cardHeight}]}>
              <Image
                source={IMG.HERO2}
                style={styles.heroBg}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            </View>

            {/* Slide 3 — image only */}
            <View style={[styles.slide, {width: slideW, height: cardHeight}]}>
              <Image
                source={IMG.HERO3}
                style={styles.heroBg}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            </View>
          </ScrollView>

          <View
            style={styles.dotsRow}
            pointerEvents="box-none"
            accessibilityLabel={`Carousel position ${activeIndex + 1} of ${SLIDE_COUNT}`}>
            {Array.from({length: SLIDE_COUNT}, (_, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => goToSlide(i)}
                hitSlop={{top: 10, bottom: 10, left: 6, right: 6}}
                accessibilityRole="button"
                accessibilityLabel={`Show slide ${i + 1} of ${SLIDE_COUNT}`}
                accessibilityState={{selected: i === activeIndex}}>
                <View
                  style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'stretch',
    marginBottom: 22,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
  shadowOuter: {
    borderRadius: CARD_RADIUS,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardClip: {
    position: 'relative',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: CARD_IMAGE_UNDERLAY,
  },
  pager: {
    width: '100%',
    alignSelf: 'stretch',
  },
  slide: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: CARD_IMAGE_UNDERLAY,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  copyOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '58%',
    paddingLeft: 16,
    paddingRight: 10,
    paddingTop: 12,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  labelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1c1917',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f0f0f',
    letterSpacing: -0.3,
    lineHeight: 23,
    marginBottom: 4,
    ...LEGIBLE_SHADOW,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'nowrap',
    marginBottom: 0,
  },
  upTo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171717',
    marginRight: 6,
    marginBottom: 10,
    ...LEGIBLE_SHADOW,
  },
  numberBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'nowrap',
  },
  bigNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#0a0a0a',
    letterSpacing: -2.5,
    lineHeight: 54,
    ...LEGIBLE_SHADOW,
  },
  percentSuffix: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a0a0a',
    lineHeight: 28,
    marginLeft: 1,
    marginBottom: 8,
    ...LEGIBLE_SHADOW,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: BRAND.maroonDark,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    zIndex: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  dotActive: {
    backgroundColor: BRAND.maroonDark,
  },
  dotInactive: {
    backgroundColor: 'rgba(60, 60, 60, 0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default HeroCarousel;
