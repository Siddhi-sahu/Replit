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
    try {

        const listParams = {
            Bucket: process.env.S3_BUCKET ?? "",
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken

        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

        await Promise.all(listedObjects.Contents.map(async (object) => {

            if (!object.Key) return;

            let destinationKey = object.Key.replace(sourcePrefix, destinationPrefix);

            let copyParams = {
                Bucket: process.env.S3_BUCKET ?? "",
                CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
                Key: destinationKey
            }

            console.log(copyParams);

            await s3.copyObject(copyParams).promise();
            console.log(`Copied ${object.Key} to ${destinationKey}`);


        }));

        if (listedObjects.IsTruncated) {
            listParams.ContinuationToken = listedObjects.NextContinuationToken;
            await copyS3Folder(sourcePrefix, destinationPrefix, continuationToken);
        }
    } catch (error) {
        console.error('Error copying folder:', error);
    }



}