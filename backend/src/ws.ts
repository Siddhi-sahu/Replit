import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
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
        });

        initHandlers(socket, replId);
    })



}

//how would we emit a event as fetchDir or fetchContent in socket?? do we do it from the frontend? are these events made by us?
//yea by socket.emit("event") client would send us this way

function initHandlers(socket: Socket, replId: string) {
    socket.on("disconnect", () => {
        console.log("user disconnected")
    });

    socket.on("fetchDir", async (dir: string, callback) => {
        //arguments: dirPath=> from where the files should be fetched ; baseDir(dir)=>where the files should be resolved
        const dirPath = path.join(__dirname, `../tmp/${replId}/${dir}`);
        const contents = await fetchDir(dirPath, dir);
        callback(contents);
    })


}