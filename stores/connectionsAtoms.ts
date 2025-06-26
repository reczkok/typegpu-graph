import { atom } from "jotai";
import { makeMutable } from "react-native-reanimated";

export type Connection = {
  from: { nodeId: string; socket: string };
  to: { nodeId: string; socket: string };
};

export const connectionsAtom = atom<Connection[]>([]);

export const addConnectionAtom = atom(
  null,
  (get, set, connection: Connection) => {
    const connections = get(connectionsAtom);
    const existingConnection = connections.find(
      (conn) =>
        conn.to.nodeId === connection.to.nodeId &&
        conn.to.socket === connection.to.socket,
    );

    if (existingConnection) {
      set(
        connectionsAtom,
        connections.map((conn) =>
          conn.to.nodeId === existingConnection.to.nodeId &&
            conn.to.socket === existingConnection.to.socket
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
        (conn) => conn.from.nodeId !== nodeId && conn.to.nodeId !== nodeId,
      ),
    );
  },
);

export type NodePositions = Record<
  string,
  { x: number; y: number; type: "input" | "output"; width: number; height: number }
>;
export const nodePositionsData = makeMutable<NodePositions>({});
