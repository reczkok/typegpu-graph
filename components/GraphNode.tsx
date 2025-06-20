import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface NodeProps {
  title: string;
  inputs: string[];
  outputs: string[];
  initialX?: number;
  initialY?: number;
}

export function GraphNode({
  title,
  inputs,
  outputs,
  initialX = 0,
  initialY = 0,
}: NodeProps) {
  const positionX = useSharedValue(initialX);
  const positionY = useSharedValue(initialY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = positionX.value;
      startY.value = positionY.value;
    })
    .onUpdate((e) => {
      positionX.value = startX.value + e.translationX;
      positionY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      // Position is already updated, no need to do anything
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: positionX.value },
      { translateY: positionY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.node, animatedStyle]}>
        <Text style={styles.nodeTitle}>{title}</Text>

        <View style={styles.nodeBody}>
          {/* Inputs on the left */}
          <View style={styles.inputsContainer}>
            {inputs.map((input, index) => (
              <View key={`input-${index}`} style={styles.portRow}>
                <View style={[styles.port, styles.inputPort]} />
                <Text style={styles.portLabel}>{input}</Text>
              </View>
            ))}
          </View>

          {/* Outputs on the right */}
          <View style={styles.outputsContainer}>
            {outputs.map((output, index) => (
              <View key={`output-${index}`} style={styles.portRow}>
                <Text style={styles.portLabel}>{output}</Text>
                <View style={[styles.port, styles.outputPort]} />
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 150,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  nodeBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inputsContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  outputsContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  portRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  port: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  inputPort: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
    marginRight: 6,
  },
  outputPort: {
    backgroundColor: '#FF9800',
    borderColor: '#E65100',
    marginLeft: 6,
  },
  portLabel: {
    color: '#ccc',
    fontSize: 12,
  },
});
