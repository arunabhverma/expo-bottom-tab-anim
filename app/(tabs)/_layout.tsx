import React from "react";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const TabBar = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const Icon =
          options.tabBarIcon !== undefined
            ? options.tabBarIcon
            : options.tabBarIcon;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index.toString()}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Icon
              color={
                isFocused
                  ? options.tabBarActiveTintColor
                  : options.tabBarInactiveTintColor
              }
              focused={isFocused}
            />
            <Text
              style={[
                { fontSize: 10 },
                {
                  color: isFocused
                    ? options.tabBarActiveTintColor
                    : options.tabBarInactiveTintColor,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabLayout = () => {
  const theme = useTheme();
  const tint = useColorScheme();
  const { width, height } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const isLandScape = width > height;
  const TAB_PADDING = 5;

  const ACTIVE_WIDTH = isLandScape ? height : width * 0.8;
  const CLAMP_HEIGHT = (isLandScape ? -width * 0.03 : -height * 0.01) - bottom;

  const isLongSet = useSharedValue(0);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });

  useAnimatedReaction(
    () => {
      if (isLongSet.value === 1) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
      }
    },
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
      }
    }
  );

  const dragGesture = Gesture.Pan()
    .onBegin(() => {})
    .onUpdate((e) => {
      const HEIGHT_THRESHOLD_NEW = (height + offset.value.y) / height;
      if (isLongSet.value) {
        offset.value = {
          x: (e.translationX * HEIGHT_THRESHOLD_NEW) / 2.5 + start.value.x,
          y: e.translationY * HEIGHT_THRESHOLD_NEW + start.value.y,
        };
      }
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    })
    .onFinalize(() => {
      if (isLongSet.value) {
        if (offset.value.y > CLAMP_HEIGHT) {
          start.value = withTiming(
            {
              x: 0,
              y: 0,
            },
            {
              duration: 250,
            }
          );
          offset.value = withTiming(
            {
              x: 0,
              y: 0,
            },
            {
              duration: 250,
            }
          );
        } else {
          start.value = withTiming(
            {
              x: 0,
              y: CLAMP_HEIGHT,
            },
            {
              duration: 250,
            }
          );
          offset.value = withTiming(
            {
              x: 0,
              y: CLAMP_HEIGHT,
            },
            {
              duration: 250,
            }
          );
        }
        isLongSet.value = 0;
      }
    });

  const animatedStyles = useAnimatedStyle(() => {
    const bottomSpace = Platform.OS === "android" ? TAB_PADDING : bottom;
    const paddingBottom = interpolate(
      offset.value.y,
      [0, CLAMP_HEIGHT],
      [bottomSpace, TAB_PADDING],
      Extrapolation.CLAMP
    );
    const rounded = interpolate(
      offset.value.y,
      [0, CLAMP_HEIGHT],
      [3, 100],
      Extrapolation.CLAMP
    );
    const xpace = interpolate(
      offset.value.y,
      [0, CLAMP_HEIGHT],
      [width, ACTIVE_WIDTH],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        {
          translateX: offset.value.x,
        },
        {
          translateY: offset.value.y,
        },
        {
          translateX: (width - xpace) / 2,
        },
      ],
      paddingBottom: paddingBottom,
      backgroundColor:
        Platform.OS === "android"
          ? isLongSet.value
            ? theme.colors.border
            : theme.colors.card
          : isLongSet.value
          ? theme.colors.card
          : "transparent",
      elevation: isLongSet.value ? 10 : 5,
      width: xpace,
      borderRadius: rounded,
    };
  }, [width, height, theme.colors.card]);

  const longPressGesture = Gesture.LongPress()
    .onStart((_event) => {
      isLongSet.value = 1;
    })
    .onEnd(() => {});

  const composed = Gesture.Simultaneous(dragGesture, longPressGesture);

  const TabBarAnim = (props: BottomTabBarProps) => {
    return (
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              paddingVertical: TAB_PADDING,
              overflow: "hidden",
              shadowColor: "#000",
            },
            animatedStyles,
          ]}
        >
          <BlurView
            tint={tint}
            intensity={Platform.select({ android: 0, ios: 100 })}
            style={StyleSheet.absoluteFill}
          />
          <TabBar {...props} />
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <Tabs
      initialRouteName="(home)"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: tint === "dark" ? "#757575" : "#666",
        headerShown: false,
      }}
      tabBar={TabBarAnim}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={"home"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(favorite)"
        options={{
          title: "Favorite",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign
              // name={focused ? "star" : "staro"}
              name={"star"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <AntDesign name="search1" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              // name={focused ? "person" : "person-outline"}
              name={"person"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
