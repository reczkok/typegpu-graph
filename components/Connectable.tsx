import { useSetAtom } from "jotai";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useDerivedValue,
} from "react-native-reanimated";
import { NodeTranslateCtx } from "@/components/GraphNode";
import type { Socket } from "@/runtime/nodeRegistry";
import {
  addConnectionAtom,
  nodePositionsData,
  removeConnectionsAtom,
} from "@/stores";

interface ConnectableProps {
  nodeId: string;
  socket: Socket;
  type: "input" | "output";
}

export function Connectable({ nodeId, socket, type }: ConnectableProps) {
  const addConnection = useSetAtom(addConnectionAtom);
  const removeConnections = useSetAtom(removeConnectionsAtom);
  const ref = useAnimatedRef<Animated.View>();
  // biome-ignore lint/style/noNonNullAssertion: its ok
  const { tx, ty } = useContext(NodeTranslateCtx)!;

  useDerivedValue(() => {
    const m = measure(ref);
    if (!m) return;
    nodePositionsData.value = {
      ...nodePositionsData.value,
      [`${nodeId}-${socket.name}`]: {
        x: m.pageX + m.width / 2,
        y: m.pageY + m.height / 2,
        type,
      },
    };
  }, [tx, ty]);

  const longPressGesture = Gesture.LongPress().onStart(() => {
    console.log(`Long press on ${socket.name}, removing connections`);
    runOnJS(removeConnections)(nodeId);
  });

  const panGesture = Gesture.Pan().onEnd((e) => {
    const pos = {
      pageX: e.absoluteX,
      pageY: e.absoluteY,
    };
    let closestNode: string | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    console.log(`Node ${socket.name} position:`, pos);

    for (const [otherId, otherPos] of Object.entries(nodePositionsData.value)) {
      if (otherId === (`${nodeId}-${socket.name}`) || otherPos.type === type) {
        continue;
      }
      const distance = Math.sqrt(
        (pos.pageX - otherPos.x) ** 2 + (pos.pageY - otherPos.y) ** 2,
      );

      console.log(
        `Distance from ${socket.name} to ${otherId}: ${distance.toFixed(2)}`,
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = otherId;
      }
    }

    if (closestNode) {
      const [targetNodeId, targetSocketName] = closestNode.split("-");
      if (closestDistance < 50) {
        console.log(`Connecting ${socket.name} to ${closestNode}`);
        runOnJS(addConnection)({
          from: {
            nodeId: type === "output" ? nodeId : targetNodeId,
            socket: type === "output" ? socket.name : targetSocketName,
          },
          to: {
            nodeId: type === "input" ? nodeId : targetNodeId,
            socket: type === "input" ? socket.name : targetSocketName,
          },
        });
      } else {
        console.log(
          `No close enough node found for ${socket.name}, closest was ${closestNode} at distance ${
            closestDistance.toFixed(
              2,
            )
          }`,
        );
      }
    } else {
      console.log(`No connection made for ${socket.name}`);
    }
  });

  const combinedGesture = Gesture.Race(longPressGesture, panGesture);

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
        <Text style={styles.portLabel}>{socket.name}</Text>
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
