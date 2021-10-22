import { Server } from "socket.io";
// import { io } from "socket.io-client";
// const socket = io("ws://localhost:3002");

const ioServer = new Server();

ioServer.on("connection", socketServer => {

    console.log(socketServer.id);

    // either with send()
    socketServer.send("Hello!");

    // or with emit() and custom event names
    socketServer.emit("greetings", "Hey!", { "ms": "jane" }, Buffer.from([4, 3, 3, 1]));

    // handle the event sent with socket.send()
    socketServer.on("message", (data) => {
        console.log(data);
    });

    // handle the event sent with socket.emit()
    socketServer.on("salutations", (elem1, elem2, elem3) => {
        console.log(elem1, elem2, elem3);
    });
});

ioServer.listen(3001);