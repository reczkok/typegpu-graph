import { atom } from "jotai";
import type { NodeProps } from "@/components/GraphNode";

export const topNodeAtom = atom<string | null>(null);
export const graphNodesAtom = atom<Record<string, NodeProps>>({
  "Add Node": {
    title: "Add Node",
    inputs: ["A", "B"],
    outputs: ["Result"],
    initialX: 50,
    initialY: 100,
  },
  "Multiply Node": {
    title: "Multiply Node",
    inputs: ["X", "Y"],
    outputs: ["Product"],
    initialX: 250,
    initialY: 200,
  },
  "Color Node": {
    title: "Color Node",
    inputs: ["R", "G", "B"],
    outputs: ["RGB", "HSV"],
    initialX: 100,
    initialY: 350,
  },
});
