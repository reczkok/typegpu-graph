import { useAtomValue } from "jotai";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { connectionsAtom, nodePositionsData } from "@/stores";
import type { Connection } from "@/stores/connectionsAtoms";

// Reanimated-friendly animated SVG Path component
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Small horizontal “stubs” so the cable leaves an output slightly rightwards
 * and enters an input slightly leftwards, lifting the line off the node box.
 */
const OUTPUT_STUB = 64; // px →
const INPUT_STUB = -64; // px ←

/** Max horizontal distance each Bézier control point sticks out from the stub */
const CURVE_RADIUS = 128; // px

export default function ConnectionsOverlay() {
  const connections = useAtomValue(connectionsAtom);

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      {connections.map((conn) => (
        <Wire key={`${conn.inputNodeId}-${conn.outputNodeId}`} {...conn} />
      ))}
    </Svg>
  );
}

function Wire({ inputNodeId, outputNodeId }: Connection) {
  const animatedProps = useAnimatedProps(() => {
    const out = nodePositionsData.value[outputNodeId]; // output socket centre
    const inp = nodePositionsData.value[inputNodeId]; // input socket centre

    // Apply stub offsets
    const startX = out.x + OUTPUT_STUB;
    const startY = out.y;
    const endX = inp.x + INPUT_STUB;
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
    const d = `M ${out.x} ${out.y} ` + // raw output centre
      `L ${startX} ${startY} ` + // output stub
      `C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY} ` + // curve
      `L ${inp.x} ${inp.y}`; // input stub

    return {
      d,
      strokeWidth: 4,
      stroke: "#00BFFF",
      fill: "none",
    } as const;
  });

  return <AnimatedPath animatedProps={animatedProps} />;
}
