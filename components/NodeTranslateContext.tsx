import { createContext } from "react";
import type { SharedValue } from "react-native-reanimated";

export const NodeTranslateCtx = createContext<
  {
    tx: SharedValue<number>;
    ty: SharedValue<number>;
  } | null
>(null);
