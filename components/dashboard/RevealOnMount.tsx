// components/dashboard/RevealOnMount.tsx
import { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface RevealOnMountProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export function RevealOnMount({
  children,
  delay = 0,
  style,
}: RevealOnMountProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
