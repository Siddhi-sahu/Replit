import { Server as HttpServer } from "http";
import { Server } from "socket.io";

export async function initWs(httpServer: HttpServer) {
    //initial a web socket serverr for 2 way connection
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', async (socket) => {
        const replId = socket.handshake.query.roomId as string;

        if (!replId) {
            socket.disconnect()
        }
    })



}