import { S3 } from "aws-sdk";

//first only copy from base/language to code/ 

//instance of S3(seting up connection with our r2 bucket)
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT

});


//export a function that copy the base code to a user repl in the s3 bucket

export async function copyS3Folder(sourcePrefix: string, destinationPrefix: string, continuationToken?: string): Promise<void> {


}