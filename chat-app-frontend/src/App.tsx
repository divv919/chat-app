import { useEffect, useState, useRef } from "react";

import "./App.css";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<WebSocket>(null);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState<string>();
  const usernameRef = useRef<HTMLInputElement>(null);
  const [roomId, setRoomId] = useState<number>();
  const [createdRoomId, setCreatedRoomId] = useState<number>();
  const roomIdRef = useRef<HTMLInputElement>(null);

  const sendMessage = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log("working");
      socketRef.current.send(`${username}:${input}:${roomId}`);
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
        socketRef.current = new WebSocket(
          "ws://localhost:8080/" + roomIdRef.current?.value
        );

        socketRef.current.onmessage = (event) =>
          setMessages((prev) => [...prev, event.data]);

        socketRef.current.onclose = () =>
          setMessages((prev) => [...prev, "Connection closed"]);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="container">
      {username && roomId ? (
        <div>
          <h1>{username}</h1>
          <ul>
            {messages.map((msg) => (
              <li>{msg}</li>
            ))}
          </ul>
          <div>
            <input
              placeholder="Enter message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      ) : username ? (
        <div>
          {createdRoomId && <div>{createdRoomId}</div>}
          <button onClick={createRandomRoomId}>Create own room</button>
          <input ref={roomIdRef} placeholder="enter room id" />
          <button onClick={handleEnterRoom}>Enter room</button>
        </div>
      ) : (
        <div>
          <input ref={usernameRef} placeholder="Enter username" />
          <button onClick={() => setUsername(usernameRef?.current?.value)}>
            Enter
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
