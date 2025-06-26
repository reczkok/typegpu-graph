import { Canvas } from "@/components/Canvas";
import { GraphNodeView } from "@/components/GraphNode";
import { graphNodesAtom } from "@/stores/graphDataAtoms";
import { useAtomValue } from "jotai";

export default function MainScreen() {
  const nodes = useAtomValue(graphNodesAtom);

  return (
    <Canvas>
      {nodes.map((node) => <GraphNodeView key={node.id} node={node} />)}
    </Canvas>
  );
}
