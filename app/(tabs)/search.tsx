import { useTheme } from "@react-navigation/native";
import { View, Text } from "react-native";

export default function Tab() {
  const theme = useTheme();
  return (
    <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Text style={{ color: theme.colors.text }}>Tab Search</Text>
    </View>
  );
}
