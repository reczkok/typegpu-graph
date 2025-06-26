import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";
import {
  Canvas,
  type RNCanvasContext,
  useCanvasEffect,
} from "react-native-wgpu";
import tgpu, {
  type TgpuFragmentFn,
  type TgpuRenderPipeline,
  type TgpuRoot,
  type TgpuVertexFn,
} from "typegpu";
import * as d from "typegpu/data";
import { compiledGraphAtom } from "@/stores";

export function ShaderCanvas(
  { width, height }: { width?: number; height?: number },
) {
  const compiledGraph = useAtomValue(compiledGraphAtom);

  const gpuRef = useRef<
    {
      root: TgpuRoot;
      context: RNCanvasContext;
      format: GPUTextureFormat;
    } | null
  >(null);
  const vertexMainRef = useRef<TgpuVertexFn<{}, { uv: d.Vec2f }>>(null);
  const pipelineRef = useRef<TgpuRenderPipeline>(null);
  const frameIdRef = useRef<number>(0);

  const canvasRef = useCanvasEffect(async () => {
    const root = await tgpu.init();
    const format = navigator.gpu.getPreferredCanvasFormat();
    const ctx = canvasRef.current.getContext("webgpu");

    if (!ctx) {
      throw new Error("WebGPU context not available");
    }

    const canvas = ctx.canvas as HTMLCanvasElement;
    canvas.width = canvas.clientWidth * PixelRatio.get();
    canvas.height = canvas.clientHeight * PixelRatio.get();

    ctx.configure({ device: root.device, format, alphaMode: "premultiplied" });

    vertexMainRef.current = tgpu["~unstable"].vertexFn({
      in: { vertexIndex: d.builtin.vertexIndex },
      out: { pos: d.builtin.position, uv: d.vec2f },
    })((input) => {
      const pos = [d.vec2f(-1, -1), d.vec2f(3, -1), d.vec2f(-1, 3)];
      const uv = [d.vec2f(0, 0), d.vec2f(2, 0), d.vec2f(0, 2)];

      return {
        pos: d.vec4f(pos[input.vertexIndex], 0, 1),
        uv: uv[input.vertexIndex],
      };
    });

    gpuRef.current = { root, context: ctx, format };
    pipelineRef.current = makePipeline(
      root,
      format,
      vertexMainRef.current,
      compiledGraph,
    );

    const render = () => {
      const pipeline = pipelineRef.current;
      if (!pipeline) return;

      pipeline
        .withColorAttachment({
          view: ctx.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
        })
        .draw(3);

      ctx.present();
      frameIdRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  });

  useEffect(() => {
    const gpu = gpuRef.current;
    if (!gpu || !vertexMainRef.current || !compiledGraph) return;

    const { root, format } = gpu;

    pipelineRef.current = makePipeline(
      root,
      format,
      vertexMainRef.current,
      compiledGraph,
    );
  }, [compiledGraph]);

  return (
    <View style={styles.container}>
      <Canvas
        ref={canvasRef}
        style={width && height ? { width, height } : styles.webgpu}
      />
    </View>
  );
}

function makePipeline(
  root: Awaited<ReturnType<typeof tgpu.init>>,
  format: GPUTextureFormat,
  vert: TgpuVertexFn<{}, { uv: d.Vec2f }>,
  frag: TgpuFragmentFn<{ uv: d.Vec2f }, d.Vec4f>,
) {
  return root["~unstable"]
    .withVertex(vert, {})
    .withFragment(frag, { format })
    .createPipeline();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webgpu: { flex: 1 },
});
