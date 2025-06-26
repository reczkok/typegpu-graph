import { StyleSheet } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { Path, type PathProps, Svg } from "react-native-svg";
import {
  ghostConnectionEnd,
  ghostConnectionSnapTarget,
  ghostConnectionStart,
  isConnecting,
  nodePositionsData,
} from "@/stores/connectionsAtoms";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PORT_OFFSET = 10;
const CURVE_RADIUS = 128;

export function GhostConnection() {
  const lineProps = useAnimatedProps<PathProps>(() => {
    const start = ghostConnectionStart.value;
    const end = ghostConnectionEnd.value;
    const snapTarget = ghostConnectionSnapTarget.value;
    const connecting = isConnecting.value;

    if (!connecting || !start) {
      return { d: "", strokeWidth: 0 };
    }

    let finalEndX = end?.x || 0;
    let finalEndY = end?.y || 0;

    if (snapTarget) {
      const targetNode = nodePositionsData.value[snapTarget];
      if (targetNode) {
        finalEndX = targetNode.x;
        finalEndY = targetNode.y;
      }
    }

    const startX = start.x + PORT_OFFSET;
    const startY = start.y;
    const endX = finalEndX - PORT_OFFSET;
    const endY = finalEndY;

    const dx = Math.abs(endX - startX);
    const radius = Math.min(CURVE_RADIUS, dx / 2);

    const cp1X = startX + radius;
    const cp1Y = startY;
    const cp2X = endX - radius;
    const cp2Y = endY;

    const d = `M ${start.x} ${start.y} ` +
      `L ${startX} ${startY} ` +
      `C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY} ` +
      `L ${finalEndX} ${finalEndY}`;

    return {
      d,
      // "#00BFFF" but more transparent
      stroke: "rgba(0, 191, 255, 0.4)",
      strokeWidth: 4,
      fill: "none",
    };
  });

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatedPath animatedProps={lineProps} />
    </Svg>
  );
}
