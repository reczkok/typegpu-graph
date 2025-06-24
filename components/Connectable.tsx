import { useSetAtom } from "jotai";
import { useContext, useId } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useDerivedValue,
} from "react-native-reanimated";
import { NodeTranslateCtx } from "@/components/GraphNode";
import {
  addConnectionAtom,
  nodePositionsData,
  removeConnectionsAtom,
} from "@/stores";

interface NodeProps {
  title: string;
  type: "input" | "output";
}

export function Connectable({ title, type }: NodeProps) {
  const id = useId();
  const addConnection = useSetAtom(addConnectionAtom);
  const removeConnections = useSetAtom(removeConnectionsAtom);
  const ref = useAnimatedRef<Animated.View>();
  // biome-ignore lint/style/noNonNullAssertion: its ok
  const { tx, ty } = useContext(NodeTranslateCtx)!;

  useDerivedValue(() => {
    if (!id) return;
    const m = measure(ref);
    if (!m) return;
    nodePositionsData.value = {
      ...nodePositionsData.value,
      [id]: {
        x: m.pageX + m.width / 2,
        y: m.pageY + m.height / 2,
        type,
      },
    };
  }, [tx, ty]);

  const longPressGesture = Gesture.LongPress()
    .onStart(() => {
      console.log(`Long press on ${title}, removing connections`);
      runOnJS(removeConnections)(id);
    });

  const panGesture = Gesture.Pan().onEnd((e) => {
    const pos = {
      pageX: e.absoluteX,
      pageY: e.absoluteY,
    };
    let closestNode: string | null = null;
    let closestDistance = Infinity;

    console.log(`Node ${title} position:`, pos);

    for (const [otherId, otherPos] of Object.entries(nodePositionsData.value)) {
      if (otherId === id || otherPos.type === type) {
        continue;
      }
      const distance = Math.sqrt(
        (pos.pageX - otherPos.x) ** 2 + (pos.pageY - otherPos.y) ** 2,
      );

      console.log(
        `Distance from ${title} to ${otherId}: ${distance.toFixed(2)}`,
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = otherId;
      }
    }

    if (closestNode) {
      if (closestDistance < 50) {
        console.log(`Connecting ${title} to ${closestNode}`);
        runOnJS(addConnection)({
          inputNodeId: type === "input" ? id : closestNode,
          outputNodeId: type === "output" ? id : closestNode,
        });
      } else {
        console.log(
          `No close enough node found for ${title}, closest was ${closestNode} at distance ${
            closestDistance.toFixed(
              2,
            )
          }`,
        );
      }
    } else {
      console.log(`No connection made for ${title}`);
    }
  });

  const combinedGesture = Gesture.Race(
    longPressGesture,
    panGesture,
  );

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        style={[type === "input" ? styles.portRow : styles.invertedPortRow]}
      >
        <View
          ref={ref}
          style={[
            styles.port,
            type === "input" ? styles.inputPort : styles.outputPort,
          ]}
        />
        <Text style={styles.portLabel}>{title}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  portRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  invertedPortRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginVertical: 4,
  },
  port: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  inputPort: {
    backgroundColor: "#4CAF50",
    borderColor: "#2E7D32",
    marginRight: 6,
  },
  outputPort: {
    backgroundColor: "#FF9800",
    borderColor: "#E65100",
    marginLeft: 6,
  },
  portLabel: {
    color: "#ccc",
    fontSize: 12,
  },
});
