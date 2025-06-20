import { Canvas } from '@/components/Canvas';
import { GraphNode } from '@/components/GraphNode';

export default function TabTwoScreen() {
  return (
    <Canvas>
      <GraphNode
        title="Add Node"
        inputs={['A', 'B']}
        outputs={['Result']}
        initialX={50}
        initialY={100}
      />

      <GraphNode
        title="Multiply Node"
        inputs={['X', 'Y']}
        outputs={['Product']}
        initialX={250}
        initialY={200}
      />

      <GraphNode
        title="Color Node"
        inputs={['R', 'G', 'B']}
        outputs={['RGB', 'HSV']}
        initialX={100}
        initialY={350}
      />
    </Canvas>
  );
}
