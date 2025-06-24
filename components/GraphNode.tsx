import { useAtom } from "jotai";
import { createContext, useId } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Connectable } from "@/components/Connectable";
import { topNodeAtom } from "@/stores";

export interface NodeProps {
  title: string;
  inputs: string[];
  outputs: string[];
  initialX?: number;
  initialY?: number;
}

export const NodeTranslateCtx = createContext<
  {
    tx: SharedValue<number>;
    ty: SharedValue<number>;
  } | null
>(null);

export function GraphNode({
  title,
  inputs,
  outputs,
  initialX = 0,
  initialY = 0,
}: NodeProps) {
  const id = useId();
  const positionX = useSharedValue(initialX);
  const positionY = useSharedValue(initialY);
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

  return (
    <GestureDetector gesture={panGesture}>
      <NodeTranslateCtx.Provider value={{ tx: positionX, ty: positionY }}>
        <Animated.View
          style={[styles.node, animatedStyle, {
            zIndex: topNode === id ? 1 : 0,
          }]}
        >
          <Text style={styles.nodeTitle}>{title}</Text>

          <View style={styles.nodeBody}>
            {/* Inputs on the left */}
            <View style={styles.inputsContainer}>
              {inputs.map((input) => (
                <Connectable
                  title={input}
                  type="input"
                  key={`input-${input}`}
                />
              ))}
            </View>

            {/* Outputs on the right */}
            <View style={styles.outputsContainer}>
              {outputs.map((output) => (
                <Connectable
                  title={output}
                  type="output"
                  key={`output-${output}`}
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
