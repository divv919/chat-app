import { useEffect, useState, useRef } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import "./App.css";
import { ScrollArea } from "./components/ui/scroll-area";

function App() {
  const [messages, setMessages] = useState<
    { type: string; user?: string; payload: { message: string } }[]
  >([]);
  const socketRef = useRef<WebSocket>(null);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState<string>();
  const usernameRef = useRef<HTMLInputElement>(null);
  const [roomId, setRoomId] = useState<number>();
  const [createdRoomId, setCreatedRoomId] = useState<number>();
  const roomIdRef = useRef<HTMLInputElement>(null);

  // console.log("work");
  useEffect(() => {
    try {
      socketRef.current = new WebSocket("ws://localhost:8080");
      socketRef.current.onmessage = (event) => {
        console.log(event.data);
        console.log("working now");
        setMessages((prev) => [...prev, JSON.parse(event.data)]);
      };

      socketRef.current.onclose = () =>
        setMessages((prev) => [
          ...prev,
          {
            type: "announcement",
            payload: { message: `${username} has left the room` },
          },
        ]);
    } catch (err) {
      console.error(err);
    }
  });

  const sendMessage = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "message",
          user: username,
          payload: { roomId: roomId, message: input, timestamp: Date.now() },
        })
      );
      setInput("");
    }
  };

  const createRandomRoomId = async () => {
    try {
      const response = await fetch("http://localhost:3000/getRandomRoomId");
      if (!response.ok) {
        throw new Error("Could not create new room id");
      }
      const json = await response.json();
      setCreatedRoomId(json.roomId);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEnterRoom = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/checkValidRoomId?id=" + roomIdRef.current?.value
      );
      if (response.ok) {
        setRoomId(Number(roomIdRef.current?.value));
        socketRef.current?.send(
          JSON.stringify({
            type: "join",
            user: username,
            payload: { roomId },
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="container font-inter">
      {username && roomId ? (
        <div>
          <h1>{username}</h1>
          {/* <div className="messages-container"> */}
          {/* <ul
              {messages.map((msg) => (
                <li>{msg}</li>
              ))}
            </ul> */}
          <ScrollArea className="h-64 border p-4 rounded-md">
            {messages.map((msg) => {
              if (msg.type === "announcement") {
                return <div>Announcement : {msg.payload.message}</div>;
              }
              return (
                <div>{`message by ${msg.user} : ${msg.payload.message}`}</div>
              );
            })}
          </ScrollArea>
          {/* </div> */}
          <div>
            <Input
              placeholder="Enter message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button className="dark" onClick={sendMessage}>
              Send
            </Button>
          </div>
        </div>
      ) : username ? (
        <div>
          {createdRoomId && <div>{createdRoomId}</div>}
          <Button onClick={createRandomRoomId}>Create own room</Button>
          <Input ref={roomIdRef} placeholder="enter room id" />
          <Button onClick={handleEnterRoom}>Enter room</Button>
        </div>
      ) : (
        <div>
          <Input ref={usernameRef} placeholder="Enter username" />
          <Button onClick={() => setUsername(usernameRef?.current?.value)}>
            Enter
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
