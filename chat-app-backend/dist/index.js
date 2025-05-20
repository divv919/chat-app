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
const clients = new Map();
const usernames = new Map();
const sendToAllRoomUsers = (roomId, message) => {
    const usersOfTheRoom = clients.get(roomId) || [];
    for (const user of usersOfTheRoom) {
        user.send(message);
    }
};
app.use((0, cors_1.default)());
wss.on("connection", (socket, request) => {
    socket.on("error", () => console.log("Error connecting"));
    // console.log("clients : ", clients);
    socket.on("message", (e) => {
        var _a;
        const parsedData = JSON.parse(e.toString());
        if (parsedData.type === "message") {
            sendToAllRoomUsers(parsedData.roomId, e.toString());
        }
        else if (parsedData.type === "join") {
            usernames.set(socket, parsedData.user);
            if (clients.has(parsedData.roomId)) {
                (_a = clients.get(parsedData.roomId)) === null || _a === void 0 ? void 0 : _a.push(socket);
            }
            else {
                clients.set(parsedData.payload.roomId, [socket]);
            }
            sendToAllRoomUsers(parsedData.roomId, JSON.stringify({
                type: "announcement",
                payload: { message: `${parsedData.user} has joined this room` },
            }));
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
