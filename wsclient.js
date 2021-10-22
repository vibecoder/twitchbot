// ES6 import or TypeScript
import { io } from "socket.io-client";
// CommonJS
// const io = require("socket.io-client");

const socket = io("ws://localhost:3001");

socket.on("connect", () => {  
    // either with send
    socket.send("Hello!");
    // or with emit() and custom event names  
    socket.emit("salutations", "Hello!", { "mr": "john" }, Uint8Array.from([1, 2, 3, 4]));
});

socket.on("connection", (socket) => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx});
});

// handle the event sent with socket.send()
socket.on("message", data => {  console.log(data);});
// handle the event sent with socket.emit()
socket.on("greetings", (elem1, elem2, elem3) => {  console.log(elem1, elem2, elem3);});