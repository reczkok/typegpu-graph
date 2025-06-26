import type React from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import ConnectionsOverlay from "@/components/ConnectionsOverlay";
import { GhostConnection } from "@/components/GhostConnection";

interface CanvasProps {
  children: React.ReactNode;
}

export function Canvas({ children }: CanvasProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const prevTranslateX = useSharedValue(0);
  const prevTranslateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const prevScale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      prevTranslateX.value = translateX.value;
      prevTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = prevTranslateX.value + e.translationX;
      translateY.value = prevTranslateY.value + e.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      prevScale.value = scale.value;
    })
    .onUpdate((e) => {
      const [minScale, maxScale] = [0.5, 3];
      scale.value = Math.min(
        maxScale,
        Math.max(minScale, prevScale.value * e.scale),
      );
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.canvas}>
          <GhostConnection />
          <ConnectionsOverlay />
          <Animated.View style={animatedStyle}>
            {children}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  canvas: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
