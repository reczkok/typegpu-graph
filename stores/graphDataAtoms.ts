import { atom } from "jotai";
import "@/runtime/builtinNodes";
import { compileGraph } from "@/runtime/compileGraph";
import { connectionsAtom } from "./connectionsAtoms";

export interface GraphNode {
  id: string;
  type: string;
  x: number;
  y: number;
}

const initialNodes: GraphNode[] = [
  { id: "input_1", type: "input", x: 50, y: 100 },
  { id: "add_1", type: "add", x: 250, y: 150 },
  { id: "output_1", type: "output", x: 450, y: 200 },
];

export const topNodeAtom = atom<string | null>(null);
export const graphNodesAtom = atom<GraphNode[]>(initialNodes);

export const nodesMapAtom = atom((get) => {
  const nodes = get(graphNodesAtom);
  const map = new Map<string, GraphNode>();
  for (const node of nodes) {
    map.set(node.id, node);
  }
  return map;
});

export const compiledGraphAtom = atom((get) => {
  const nodes = get(nodesMapAtom);
  const connections = get(connectionsAtom);
  return compileGraph(nodes, connections);
});
