import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Canvas } from "@/components/Canvas";
import { GraphNode } from "@/components/GraphNode";
import { graphNodesAtom } from "@/stores";

export default function TabTwoScreen() {
  const nodes = useAtomValue(graphNodesAtom);

  useEffect(() => {
    console.log("Initial node positions:");
    for (const node of Object.values(nodes)) {
      console.log(`Node ${node.title} initial position:`, {
        x: node.initialX,
        y: node.initialY,
      });
    }
  }, [nodes]);

  return (
    <Canvas>
      {Object.values(nodes).map((node) => (
        <GraphNode
          key={node.title}
          title={node.title}
          inputs={node.inputs}
          outputs={node.outputs}
          initialX={node.initialX}
          initialY={node.initialY}
        />
      ))}
    </Canvas>
  );
}
