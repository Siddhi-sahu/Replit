import { Express } from "express";
import express from "express";
export async function initHTTP(app: Express) {

    app.use(express.json());

    app.post("/project", (req, res) => {
        const { replId, language } = req.body;

        if (!replId) {
            res.status(400).send("Bad request");
            return;
        }
        //copy base code to the replid repl in s3 bucket

        res.send("Project created");
    })
}