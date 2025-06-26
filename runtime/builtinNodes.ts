import { registerNode } from "./nodeRegistry.ts";

registerNode({
  type: "input",
  inputs: [],
  outputs: [
    { name: "u", kind: "number" },
    { name: "v", kind: "number" },
  ],
  compute() {
    return { u: "u", v: "v" };
  },
});

registerNode({
  type: "output",
  inputs: [
    { name: "r", kind: "number" },
    { name: "g", kind: "number" },
    { name: "b", kind: "number" },
    { name: "a", kind: "number" },
  ],
  outputs: [],
  compute(args) {
    return { rgba: `vec4(${args.r},${args.g},${args.b},${args.a})` };
  },
});

registerNode({
  type: "add",
  inputs: [
    { name: "a", kind: "number" },
    { name: "b", kind: "number" },
  ],
  outputs: [{ name: "out", kind: "number" }],
  compute({ a, b }) {
    return { out: `(${a} + ${b})` };
  },
});
