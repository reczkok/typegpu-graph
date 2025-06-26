import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { NodeRegistry, type Socket } from "@/runtime/nodeRegistry";

interface NodeCardDisplayProps {
  nodeType: string;
}

const SocketDisplay: React.FC<{ socket: Socket; type: "input" | "output" }> = ({
  socket,
  type,
}) => {
  const colorScheme = useColorScheme();
  const portStyle = type === "input" ? styles.inputPort : styles.outputPort;
  const labelStyle = type === "input" ? styles.inputLabel : styles.outputLabel;

  return (
    <View style={styles.portRow}>
      {type === "input" && (
        <View
          style={[
            styles.port,
            portStyle,
            { borderColor: Colors[colorScheme ?? "light"].icon },
          ]}
        />
      )}
      <Text
        style={[
          styles.portLabel,
          labelStyle,
          { color: Colors[colorScheme ?? "light"].text },
        ]}
      >
        {socket.name}
      </Text>
      {type === "output" && (
        <View
          style={[
            styles.port,
            portStyle,
            { borderColor: Colors[colorScheme ?? "light"].icon },
          ]}
        />
      )}
    </View>
  );
};

export const NodeCardDisplay: React.FC<NodeCardDisplayProps> = ({
  nodeType,
}) => {
  const nodeImpl = NodeRegistry.get(nodeType);
  const colorScheme = useColorScheme();

  if (!nodeImpl) {
    throw new Error(`Node type "${nodeType}" not found in registry.`);
  }

  return (
    <View
      style={[
        styles.nodeCard,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
        { borderColor: Colors[colorScheme ?? "light"].icon },
      ]}
    >
      <Text
        style={[
          styles.nodeTitle,
          { color: Colors[colorScheme ?? "light"].text },
          { borderBottomColor: Colors[colorScheme ?? "light"].icon },
        ]}
      >
        {nodeImpl.type}
      </Text>
      <View style={styles.nodeBody}>
        <View style={styles.inputsContainer}>
          {nodeImpl.inputs.map((input) => (
            <SocketDisplay key={input.name} socket={input} type="input" />
          ))}
        </View>
        <View style={styles.outputsContainer}>
          {nodeImpl.outputs.map((output) => (
            <SocketDisplay key={output.name} socket={output} type="output" />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nodeCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    minWidth: 120,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  inputPort: {
    backgroundColor: "#4CAF50",
    marginRight: 4,
  },
  outputPort: {
    backgroundColor: "#FF9800",
    marginLeft: 4,
  },
  portLabel: {
    fontSize: 10,
  },
  inputLabel: {
    textAlign: "left",
  },
  outputLabel: {
    textAlign: "right",
  },
});
