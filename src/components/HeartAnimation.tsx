import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';

interface HeartAnimationProps {
  trigger: number;
}

interface FloatingHeart {
  id: number;
  animY: Animated.Value;
  animOpacity: Animated.Value;
  animScale: Animated.Value;
  xOffset: number;
}

export const HeartAnimation: React.FC<HeartAnimationProps> = ({ trigger }) => {
  const [hearts, setHearts] = React.useState<FloatingHeart[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (!trigger) return;

    const id = nextId.current++;
    const animY = new Animated.Value(0);
    const animOpacity = new Animated.Value(1);
    const animScale = new Animated.Value(0.6);
    const xOffset = (Math.random() - 0.5) * 160;

    const newHeart: FloatingHeart = {
      id,
      animY,
      animOpacity,
      animScale,
      xOffset,
    };

    setHearts((prev) => [...prev, newHeart]);

    Animated.parallel([
      Animated.timing(animY, {
        toValue: -280,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.timing(animScale, {
        toValue: 1.4,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    });
  }, [trigger]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {hearts.map((heart) => (
        <Animated.View
          key={heart.id}
          style={[
            styles.heartContainer,
            {
              transform: [
                { translateX: heart.xOffset },
                { translateY: heart.animY },
                { scale: heart.animScale },
              ],
              opacity: heart.animOpacity,
            },
          ]}
        >
          <Text style={styles.heartEmoji}>💖</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  heartContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
  },
  heartEmoji: {
    fontSize: 34,
  },
});

