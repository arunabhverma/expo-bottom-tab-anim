import React, { memo, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const CommentSection = () => {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const [state, setState] = useState({
    imageData: [],
    likedIndex: [],
  });

  useEffect(() => {
    getImages();
  }, []);

  const getImages = () => {
    fetch("https://picsum.photos/v2/list?page=5&limit=50")
      .then((res) => res.json())
      .then((res) => setState((prev) => ({ ...prev, imageData: res })));
  };

  const renderItem = ({ item, index }) => {
    let imageWidth = width / 2;

    let aspectRatio = item.width / item.height;
    const imageHeight = imageWidth / aspectRatio;

    return (
      <View
        style={{
          width: "100%",
          height: imageHeight,
          borderRadius: 15,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: item.download_url }}
          style={{ width: "100%", height: imageHeight }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["right", "left"]}>
      <ScrollView
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 10,
          paddingBottom: tabBarHeight,
        }}
      >
        <View
          style={[
            {
              flex: 1,
              flexDirection: "row",
              gap: 10,
            },
          ]}
        >
          {Array.from(Array(2), (_, num) => {
            return (
              <View
                key={`masonry-column-${num}`}
                style={{
                  flex: 1 / 2,
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {state.imageData
                  .map((el, i) => {
                    if (i % 2 === num) {
                      return (
                        <View key={`masonry-row-${num}-${i}`}>
                          {renderItem({ item: el, i })}
                        </View>
                      );
                    }
                    return null;
                  })
                  .filter((e) => !!e)}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default memo(CommentSection);

const styles = StyleSheet.create({
  containerStyle: {},
});
