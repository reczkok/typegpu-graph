import { atom } from "jotai";
import "@/runtime/builtinNodes";
import { compileGraph } from "@/runtime/compileGraph";
import { connectionsAtom } from "./connectionsAtoms.ts";

export interface GraphNode {
  id: string;
  type: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

const initialNodes: GraphNode[] = [
  { id: "input_1", type: "input", x: 50, y: 100 },
  { id: "add_1", type: "add", x: 250, y: 150 },
  { id: "output_1", type: "output", x: 450, y: 200 },
];

export const topNodeAtom = atom<string | null>(null);
export const graphNodesAtom = atom<GraphNode[]>(initialNodes);

export const addNodeAtom = atom(null, (get, set, type: string) => {
  const currentNodes = get(graphNodesAtom);
  const newNode: GraphNode = {
    id: `${type}_${Date.now()}`,
    type,
    x: Math.random() * 200,
    y: Math.random() * 200,
    data: type === "constant" ? { value: 1.0 } : {},
  };
  set(graphNodesAtom, [...currentNodes, newNode]);
});

export const removeNodeAtom = atom(null, (get, set, nodeId: string) => {
  if (nodeId !== "output_1") {
    const currentNodes = get(graphNodesAtom);
    const filteredNodes = currentNodes.filter((node) => node.id !== nodeId);
    set(graphNodesAtom, filteredNodes);

    // Also remove connections associated with the removed node
    const currentConnections = get(connectionsAtom);
    const filteredConnections = currentConnections.filter((conn) => {
      // Filter out malformed connections (where conn, conn.from, or conn.to is undefined/null)
      if (!conn || !conn.from || !conn.to) {
        return false;
      }
      // Keep the connection only if neither its source nor its target is the node being removed
      return conn.from.nodeId !== nodeId && conn.to.nodeId !== nodeId;
    });
    set(connectionsAtom, filteredConnections);

    set(topNodeAtom, null);
  }
});

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
