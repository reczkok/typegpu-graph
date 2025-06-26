import type { Connection } from "@/stores/connectionsAtoms";
import type { GraphNode } from "@/stores/graphDataAtoms";
import { NodeRegistry } from "./nodeRegistry.ts";

export function compileGraph(
  nodes: Map<string, GraphNode>,
  connections: Connection[],
): string {
  const emitted = new Set<string>();
  const codeLines: string[] = [];

  function walk(nodeId: string, socketName: string): string {
    const symbol = `${nodeId}_${socketName}`;
    if (emitted.has(symbol)) return symbol;

    const node = nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    const impl = NodeRegistry.get(node.type);
    if (!impl) {
      throw new Error(`Node implementation for type ${node.type} not found`);
    }

    const args: Record<string, string> = {};
    for (const input of impl.inputs) {
      const connection = connections.find(
        (c) => c.to.nodeId === nodeId && c.to.socket === input.name,
      );
      if (!connection) {
        args[input.name] = "0"; // Default to 0 if unconnected
      } else {
        if (!nodes.has(connection.from.nodeId)) continue;
        args[input.name] = walk(connection.from.nodeId, connection.from.socket);
      }
    }

    const result = impl.compute(args, node);
    for (const [sock, expr] of Object.entries(result)) {
      const sym = `${nodeId}_${sock}`;
      codeLines.push(`let ${sym} = ${expr};`);
      emitted.add(sym);
    }
    return `${nodeId}_${socketName}`;
  }

  let finalOutput = "";
  for (const [nodeId, node] of nodes.entries()) {
    if (node.type === "output") {
      const outputImpl = NodeRegistry.get("output");
      if (!outputImpl) {
        throw new Error("Output node implementation not found");
      }
      const args: Record<string, string> = {};
      for (const input of outputImpl.inputs) {
        const connection = connections.find(
          (c) => c.to.nodeId === nodeId && c.to.socket === input.name,
        );
        if (!connection) {
          args[input.name] = "0";
        } else {
          if (!nodes.has(connection.from.nodeId)) continue;
          args[input.name] = walk(
            connection.from.nodeId,
            connection.from.socket,
          );
        }
      }
      const result = outputImpl.compute(args, node);
      finalOutput = result.rgba;
    }
  }

  return `${codeLines.join("\n")}\n${finalOutput}`;
}
