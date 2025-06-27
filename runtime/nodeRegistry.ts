import type { GraphNode } from "@/stores/graphDataAtoms";

export type SocketKind = "number";
export interface Socket {
  name: string;
  kind: SocketKind;
}

export interface NodeImpl {
  /** unique key, e.g. "input", "add", "noise" … */
  type: string;
  /** ordered list → left column in the node */
  inputs: Socket[];
  /** ordered list → right column in the node */
  outputs: Socket[];
  compute(
    args: Record<string, string>,
    node: GraphNode,
  ): Record<string, string>;
}

/** central registry */
export const NodeRegistry = new Map<string, NodeImpl>();

export function registerNode(node: NodeImpl) {
  NodeRegistry.set(node.type, node);
}
