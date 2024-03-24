import React, { useEffect } from "react";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  ReduceMotion,
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
import { DarkTheme, useTheme } from "@react-navigation/native";

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
              color={isFocused ? options.tabBarActiveTintColor : "#666"}
              focused={isFocused}
            />
            <Text
              style={[
                { fontSize: 10 },
                {
                  color: isFocused ? options.tabBarActiveTintColor : "#666",
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
  const { width, height } = useWindowDimensions();
  const isLandScape = width > height;

  const ACTIVE_WIDTH = isLandScape ? height : width * 0.8;
  const CLAMP_HEIGHT = isLandScape ? -width * 0.03 : -height * 0.03;

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
    const rounded = interpolate(
      offset.value.y,
      [0, CLAMP_HEIGHT],
      [0, 100],
      Extrapolation.CLAMP
    );
    const xpace = interpolate(
      offset.value.y,
      [0, CLAMP_HEIGHT],
      [width, ACTIVE_WIDTH],
      Extrapolation.CLAMP
    );
    const bgColor = interpolateColor(
      isLongSet.value,
      [0, 1],
      [theme.colors.card, theme.colors.border]
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
      backgroundColor: bgColor,
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
              paddingVertical: 3,
              shadowColor: "#000",
            },
            animatedStyles,
          ]}
        >
          <TabBar {...props} />
        </Animated.View>
      </GestureDetector>
    );
  };

  // {
  //   "colors":{
  //   "background":"rgb(1, 1, 1)",
  //   "border":"rgb(39, 39, 41)",
  //   "card":"rgb(18, 18, 18)",
  //   "notification":"rgb(255, 69, 58)",
  //   "primary":"rgb(10, 132, 255)",
  //   "text":"rgb(229, 229, 231)"
  //   },
  //   "dark":true
  //   }

  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: theme.colors.primary }}
      tabBar={TabBarAnim}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              // name={focused ? "home" : "home-outline"}
              name={"home"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
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
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <AntDesign name="search1" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
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
