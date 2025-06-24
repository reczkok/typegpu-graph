import { atom } from "jotai";
import { makeMutable } from "react-native-reanimated";

export type Connection = {
  inputNodeId: string;
  outputNodeId: string;
};

export const connectionsAtom = atom<Connection[]>([]);
export const addConnectionAtom = atom(
  null,
  (get, set, connection: Connection) => {
    const connections = get(connectionsAtom);
    const existingConnection = connections.find(
      (conn) => conn.inputNodeId === connection.inputNodeId,
    );

    if (existingConnection) {
      set(
        connectionsAtom,
        connections.map((conn) =>
          conn.inputNodeId === existingConnection.inputNodeId
            ? connection
            : conn
        ),
      );
    } else {
      set(connectionsAtom, [...connections, connection]);
    }
  },
);
export const removeConnectionsAtom = atom(
  null,
  (get, set, nodeId: string) => {
    const connections = get(connectionsAtom);
    set(
      connectionsAtom,
      connections.filter(
        (conn) => conn.inputNodeId !== nodeId && conn.outputNodeId !== nodeId,
      ),
    );
  },
);

export type NodePositions = Record<
  string,
  { x: number; y: number; type: "input" | "output" }
>;
export const nodePositionsData = makeMutable<NodePositions>({});
