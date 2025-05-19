"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const wss = new ws_1.WebSocketServer({ port: 8080 });
const app = (0, express_1.default)();
const clients = [];
const rooms = [];
app.use((0, cors_1.default)());
wss.on("connection", (socket, request) => {
    var _a;
    socket.on("error", () => console.log("Error connecting"));
    clients.push({
        socketVal: socket,
        roomId: Number((_a = request.url) === null || _a === void 0 ? void 0 : _a.replace("/", "")),
    });
    console.log("clients : ", clients);
    socket.send("Connected");
    socket.on("message", (e) => {
        for (const client of clients) {
            if (client.socketVal.readyState === ws_1.WebSocket.OPEN &&
                client.roomId === Number(e.toString().split(":")[2])) {
                client.socketVal.send(`by user ${e.toString().split(":")[0]} : ${e.toString().split(":")[1]}`);
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
