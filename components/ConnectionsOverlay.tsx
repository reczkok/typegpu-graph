import { useAtomValue } from "jotai";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import Svg, { Path, type PathProps } from "react-native-svg";
import { connectionsAtom, nodePositionsData } from "@/stores";
import type { Connection } from "@/stores/connectionsAtoms";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PORT_OFFSET = 10;
const CURVE_RADIUS = 128;

export default function ConnectionsOverlay() {
  const connections = useAtomValue(connectionsAtom);

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      {connections.map((conn) => (
        <Wire
          key={`${conn.from.nodeId}-${conn.from.socket}-${conn.to.nodeId}-${conn.to.socket}`}
          connection={conn}
        />
      ))}
    </Svg>
  );
}

function Wire({ connection }: { connection: Connection }) {
  const animatedProps = useAnimatedProps<PathProps>(() => {
    const out = nodePositionsData.value[
      `${connection.from.nodeId}-${connection.from.socket}`
    ]; // output socket centre
    const inp = nodePositionsData.value[
      `${connection.to.nodeId}-${connection.to.socket}`
    ]; // input socket centre

    if (!out || !inp) {
      return { d: "", strokeWidth: 0 };
    }

    // Apply stub offsets
    const startX = out.x + out.width / 2 + PORT_OFFSET;
    const startY = out.y;
    const endX = inp.x - inp.width / 2 - PORT_OFFSET;
    const endY = inp.y;

    // Horizontal distance between stubs – determines how much we can curve
    const dx = Math.abs(endX - startX);
    const radius = Math.min(CURVE_RADIUS, dx / 2);

    // Control points push horizontally to create a gentle S-curve
    const cp1X = startX + radius; // after start stub, bend rightwards
    const cp1Y = startY;
    const cp2X = endX - radius; // before end stub, bend leftwards
    const cp2Y = endY;

    /*
     * SVG Path:
     *   M      – move to output socket
     *   L      – short stub out of output
     *   C      – cubic Bézier to end stub (smooth curve)
     *   L      – short stub into input
     */
    const d = `M ${out.x} ${out.y} ` +
      `L ${startX} ${startY} ` +
      `C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY} ` +
      `L ${inp.x} ${inp.y}`;

    return {
      d,
      strokeWidth: 4,
      stroke: "#00BFFF",
      fill: "none",
    };
  });

  return <AnimatedPath animatedProps={animatedProps} />;
}
