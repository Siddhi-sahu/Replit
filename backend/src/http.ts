import { Express } from "express";
import express from "express";
import { copyS3Folder } from "./aws";
export async function initHTTP(app: Express) {

    app.use(express.json());

    app.post("/project", async (req, res) => {
        const { replId, language } = req.body;

        if (!replId) {
            res.status(400).send("Bad request");
            return;
        }
        //copy base code to the replid repl in s3 bucket
        await copyS3Folder(`base/${language}`, `code/${replId}`);

        res.send("Project created");
    })
}