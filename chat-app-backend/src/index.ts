import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import cors from "cors";
const wss = new WebSocketServer({ port: 8080 });
const app = express();

const clients: { socketVal: WebSocket; roomId: number }[] = [];
const rooms: number[] = [];

app.use(cors());
wss.on("connection", (socket: WebSocket, request) => {
  socket.on("error", () => console.log("Error connecting"));

  clients.push({
    socketVal: socket,
    roomId: Number(request.url?.replace("/", "")),
  });
  console.log("clients : ", clients);

  socket.send("Connected");

  socket.on("message", (e) => {
    for (const client of clients) {
      if (
        client.socketVal.readyState === WebSocket.OPEN &&
        client.roomId === Number(e.toString().split(":")[2])
      ) {
        client.socketVal.send(
          `by user ${e.toString().split(":")[0]} : ${
            e.toString().split(":")[1]
          }`
        );
      }
    }
  });

  socket.on("close", () => console.log("Connection closed"));
});

console.log("Websocket server running ");

app.get("/getRandomRoomId", (req, res) => {
  while (1) {
    const roomId = Math.floor(Math.random() * 9999);
    if (!rooms.includes(roomId)) {
      rooms.push(roomId);
      console.log("Rooms : ", rooms);
      res.json({ roomId });
      return;
    }
  }
  res.json({ message: "no room id generated" });
});

app.get("/checkValidRoomId", (req, res) => {
  const { id } = req.query;
  console.log(id);
  console.log("Room includes the id :", rooms.includes(Number(id)));
  console.log("Rooms : ", rooms);
  if (rooms.includes(Number(id))) {
    res.status(200).json({ isValid: true });
    return;
  }

  res.status(404).json({ isValid: false });
});

app.listen(3000, () => {
  console.log("Express server is running : 3000");
});
