import {
  Lexend_400Regular,
  Lexend_600SemiBold,
  Lexend_700Bold,
  useFonts,
} from "@expo-google-fonts/lexend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import type { OnboardingSlide } from "../../constants/onboarding";
import slides from "../../constants/onboarding";

const { width, height } = Dimensions.get("window");

export default function DashboardScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<OnboardingSlide>>(null);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  useEffect(() => {
    const check = async () => {
      //await AsyncStorage.removeItem("hasSeenOnboarding");
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      if (seen === "true") {
        router.replace("/(auth)/login");
      }
    };
    check();
  }, []);

  const handleFinish = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)/login");
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (!fontsLoaded) return null;

  const renderItem = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width, flex: 1, backgroundColor: "#F9FAFB" }}>
      <View style={{ height: height * 0.77, width, overflow: "hidden" }}>
        <Image
          source={item.image}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
          blurRadius={20}
        />
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(6, 61, 36, 0.35)", // primary-dark @ 35%
          }}
        />

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <View
            style={{
              width: width * 0.86,
              aspectRatio: 1,
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <Image
              source={item.image}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* Bottom Content Area */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 24,
          paddingTop: 32,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          marginTop: -20,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        <Text
          style={{
            fontFamily: "Lexend_700Bold",
            fontSize: 22,
            color: "#111827",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontFamily: "Lexend_400Regular",
            fontSize: 15,
            color: "#4B5563",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination Dots */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 90,
          width,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {slides.map((_, i) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={{
                width: dotWidth,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                opacity,
                backgroundColor: "#0A5C36",
              }}
            />
          );
        })}
      </View>

      {/* Action Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 24,
          width,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={handleFinish}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderWidth: 1.5,
            borderColor: "#D1D5DB",
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text
            style={{
              fontFamily: "Lexend_600SemiBold",
              fontSize: 15,
              color: "#4B5563",
            }}
          >
            Skip
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: "#0A5C36",
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Lexend_600SemiBold",
              fontSize: 15,
              color: "#FFFFFF",
            }}
          >
            {activeIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
