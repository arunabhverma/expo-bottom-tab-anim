import { DarkTheme, useTheme } from "@react-navigation/native";
import { View, Text, FlatList } from "react-native";

export default function Tab() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={new Array(100).fill(1)}
        keyExtractor={(_, i) => i.toString()}
        renderItem={() => (
          <View>
            <Text style={{ color: theme.colors.text }}>Hello world</Text>
          </View>
        )}
      />
    </View>
  );
}
