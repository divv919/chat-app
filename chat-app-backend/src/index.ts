import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import cors from "cors";
const wss = new WebSocketServer({ port: 8080 });
const app = express();

const clients = new Map<number, WebSocket[]>();
const usernames = new Map<WebSocket, string>();

const sendToAllRoomUsers = (roomId: number, message: string) => {
  const usersOfTheRoom = clients.get(roomId) || [];
  for (const user of usersOfTheRoom) {
    user.send(message);
  }
};

app.use(cors());
wss.on("connection", (socket: WebSocket, request) => {
  socket.on("error", () => console.log("Error connecting"));

  // console.log("clients : ", clients);

  socket.on("message", (e) => {
    const parsedData = JSON.parse(e.toString());
    if (parsedData.type === "message") {
      sendToAllRoomUsers(parsedData.roomId, e.toString());
    } else if (parsedData.type === "join") {
      usernames.set(socket, parsedData.user);
      if (clients.has(parsedData.roomId)) {
        clients.get(parsedData.roomId)?.push(socket);
      } else {
        clients.set(parsedData.payload.roomId, [socket]);
      }
      sendToAllRoomUsers(
        parsedData.roomId,
        JSON.stringify({
          type: "announcement",
          payload: { message: `${parsedData.user} has joined this room` },
        })
      );
    }
  });

  socket.on("close", () => console.log("Connection closed"));
});

console.log("Websocket server running ");

app.get("/getRandomRoomId", (req, res) => {
  while (1) {
    const roomId = Math.floor(Math.random() * 9999);
    if (!clients.has(roomId)) {
      clients.set(roomId, []);

      res.json({ roomId });
      return;
    }
  }
  res.json({ message: "no room id generated" });
});

app.get("/checkValidRoomId", (req, res) => {
  const { id } = req.query;

  if (clients.has(Number(id))) {
    res.status(200).json({ isValid: true });
    return;
  }

  res.status(404).json({ isValid: false });
});

app.listen(3000, () => {
  console.log("Express server is running : 3000");
});
