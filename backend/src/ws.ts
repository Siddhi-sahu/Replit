import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { TerminalManager } from "./pty";
import { fetchS3Folder } from "./aws";
import path from "path";
import { fetchDir } from "./fs";


const terminalManager = new TerminalManager();

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
            socket.disconnect();
            terminalManager.clear(socket.id);
            return;
        }

        //fetch everything from s3 locally
        await fetchS3Folder(`code/${replId}`, path.join(__dirname, `../temp/${replId}`));

        //and emit a loaded event with all the root content of that specific repl
        socket.emit('loaded', {
            //get list of files and directories using fetchDir
            rootcontent: await fetchDir(path.join(__dirname, `../temp/${replId}`), "")
        })
    })



}

//how would we emit a event as fetchDir or fetchContent in socket?? do we do it from the frontend?