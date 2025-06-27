import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { NodeCardDisplay } from "@/components/NodeCardDisplay";
import { NodeRegistry } from "@/runtime/nodeRegistry";
import { addNodeAtom } from "@/stores/graphDataAtoms";

export default function NodeLibraryScreen() {
  const addNode = useSetAtom(addNodeAtom);
  const router = useRouter();
  // Filter out 'input' and 'output' nodes as they are special
  const availableNodes = Array.from(NodeRegistry.keys()).filter(
    (type) => type !== "input" && type !== "output",
  );

  const handleAddNode = (type: string) => {
    addNode(type);
    router.push("/"); // Navigate back to the Graph tab
  };

  const renderItem = ({ item }: { item: string }) => (
    <Pressable
      key={item}
      onPress={() => handleAddNode(item)}
    >
      <NodeCardDisplay nodeType={item} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={availableNodes}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1a1a1a",
  },
  gridContainer: {
    justifyContent: "center",
  },
  nodeCard: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nodeText: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
