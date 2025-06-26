import { useAtom, useSetAtom } from "jotai";
import { createContext } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Connectable } from "@/components/Connectable";
import { ShaderCanvas } from "@/components/ShaderCanvas";
import { NodeRegistry } from "@/runtime/nodeRegistry";
import { graphNodesAtom, removeNodeAtom, topNodeAtom } from "@/stores";
import type { GraphNode } from "@/stores/graphDataAtoms";

export const NodeTranslateCtx = createContext<
  {
    tx: SharedValue<number>;
    ty: SharedValue<number>;
  } | null
>(null);

export function GraphNodeView({ node }: { node: GraphNode }) {
  const { id, type, x, y, data } = node;
  const positionX = useSharedValue(x);
  const positionY = useSharedValue(y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const [topNode, setTopNode] = useAtom(topNodeAtom);
  const setNodes = useSetAtom(graphNodesAtom);
  const removeNode = useSetAtom(removeNodeAtom);

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
    throw new Error(`Node type "${type}" not found in registry`);
  }

  const handleValueChange = (newValue: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, value: newValue } } : n
      )
    );
  };

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
          {type !== "output" && type !== "input" && (
            <Pressable
              style={styles.removeButton}
              onPress={() => removeNode(id)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </Pressable>
          )}
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

          {node.type === "constant" && (
            <TextInput
              style={styles.inputField}
              value={data?.value?.toString() ?? "1.0"}
              onChangeText={handleValueChange}
              keyboardType="numeric"
            />
          )}

          {node.type === "output" && <ShaderCanvas />}
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
  outputResult: {
    color: "#fff",
    fontSize: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 4,
    backgroundColor: "#333",
    flexWrap: "nowrap",
  },
  inputField: {
    backgroundColor: "#333",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 4,
    padding: 4,
    marginTop: 8,
    fontSize: 12,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    left: -8,
    backgroundColor: "#ff3b30",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  portLabel: {
    color: "#ccc",
    fontSize: 12,
  },
});
