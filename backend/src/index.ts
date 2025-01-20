import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initHTTP } from "./http";

const app = express();
app.use(cors());

const httpServer = createServer(app);

initHTTP(app);


const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
    console.log(`app listening on port ${port}`)
})