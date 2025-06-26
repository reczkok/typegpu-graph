import { useAtom } from "jotai";
import { createContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Connectable } from "@/components/Connectable";
import { NodeRegistry } from "@/runtime/nodeRegistry";
import { topNodeAtom } from "@/stores";
import type { GraphNode } from "@/stores/graphDataAtoms";

export const NodeTranslateCtx = createContext<
  {
    tx: SharedValue<number>;
    ty: SharedValue<number>;
  } | null
>(null);

export function GraphNodeView({ node }: { node: GraphNode }) {
  const { id, type, x, y } = node;
  const positionX = useSharedValue(x);
  const positionY = useSharedValue(y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const [topNode, setTopNode] = useAtom(topNodeAtom);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setTopNode)(id);
      startX.value = positionX.value;
      startY.value = positionY.value;
    })
    .onUpdate((e) => {
      positionX.value = startX.value + e.translationX;
      positionY.value = startY.value + e.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: positionX.value },
      { translateY: positionY.value },
    ],
  }));

  const nodeImpl = NodeRegistry.get(type);
  if (!nodeImpl) {
    return null; // Or some error component
  }

  return (
    <GestureDetector gesture={panGesture}>
      <NodeTranslateCtx.Provider value={{ tx: positionX, ty: positionY }}>
        <Animated.View
          style={[
            styles.node,
            animatedStyle,
            { zIndex: topNode === id ? 1 : 0 },
          ]}
        >
          <Text style={styles.nodeTitle}>{nodeImpl.type}</Text>

          <View style={styles.nodeBody}>
            {/* Inputs on the left */}
            <View style={styles.inputsContainer}>
              {nodeImpl.inputs.map((input) => (
                <Connectable
                  key={`input-${id}-${input.name}`}
                  nodeId={id}
                  socket={input}
                  type="input"
                />
              ))}
            </View>

            {/* Outputs on the right */}
            <View style={styles.outputsContainer}>
              {nodeImpl.outputs.map((output) => (
                <Connectable
                  key={`output-${id}-${output.name}`}
                  nodeId={id}
                  socket={output}
                  type="output"
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </NodeTranslateCtx.Provider>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  node: {
    position: "absolute",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    minWidth: 150,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nodeTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  nodeBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  inputsContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  outputsContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  portRow: {
    flexDirection: "row",
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
