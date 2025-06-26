import { StyleSheet } from "react-native";
import { ShaderCanvas } from "@/components/ShaderCanvas";
import { ThemedView } from "@/components/ThemedView";

export default function FullscreenShaderScreen() {
  return (
    <ThemedView style={styles.container}>
      <ShaderCanvas />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
