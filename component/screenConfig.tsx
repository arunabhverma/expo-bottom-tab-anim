import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { Platform, useColorScheme } from "react-native";

const Layout = ({ title }) => {
  const theme = useTheme();
  const tint = useColorScheme();
  const headerConfig = Platform.select({
    android: {},
    ios: {
      // contentStyle: { backgroundColor: theme.colors.ba },
      headerLargeTitle: true,
      headerBlurEffect: tint,
      headerTransparent: true,
    },
  });
  return (
    <Stack
      screenOptions={{
        ...headerConfig,
        title,
      }}
    />
  );
};

export default Layout;
