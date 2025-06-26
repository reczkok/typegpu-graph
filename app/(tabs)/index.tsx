import { Canvas } from "@/components/Canvas";
import { GraphNodeView } from "@/components/GraphNode";
import { Button, View, StyleSheet, Text, Pressable } from "react-native";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import {
  graphNodesAtom,
  addNodeAtom,
} from "@/stores/graphDataAtoms";
import { NodeRegistry } from "@/runtime/nodeRegistry";

const availableNodes = Array.from(NodeRegistry.keys()).filter(
  (type) => type !== "input" && type !== "output"
);

export default function MainScreen() {
  const nodes = useAtomValue(graphNodesAtom);
  const addNode = useSetAtom(addNodeAtom);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Canvas>
        {nodes.map((node) => (
          <GraphNodeView key={node.id} node={node} />
        ))}
      </Canvas>
      <View style={styles.controls}>
        <Button title="Add Node" onPress={() => setMenuVisible(!menuVisible)} />
        {menuVisible && (
          <View style={styles.menu}>
            {availableNodes.map((type) => (
              <Pressable
                key={type}
                style={styles.menuItem}
                onPress={() => {
                  addNode(type);
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuItemText}>{type}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    top: 40,
    left: 10,
  },
  menu: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginTop: 4,
    borderColor: "#444",
    borderWidth: 1,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 14,
  },
});
