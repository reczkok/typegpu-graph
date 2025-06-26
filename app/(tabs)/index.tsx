import { useAtomValue } from "jotai";
import { StyleSheet, View } from "react-native";
import { Canvas } from "@/components/Canvas";
import { GraphNodeView } from "@/components/GraphNode";
import { graphNodesAtom } from "@/stores/graphDataAtoms";

export default function MainScreen() {
  const nodes = useAtomValue(graphNodesAtom);

  return (
    <View style={styles.container}>
      <Canvas>
        {nodes.map((node) => <GraphNodeView key={node.id} node={node} />)}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
