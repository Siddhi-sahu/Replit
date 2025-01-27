import { S3 } from "aws-sdk";
import fs from "fs";
import path, { resolve } from "path";


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

//a function for downloading all the files from a given folder in S3 to our local directory 
// a specified folder = key
//file.key = Get the file's key (its full path in the bucket)

export async function fetchS3Folder(key: string, localPath: string): Promise<void> {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET ?? "",
            Prefix: key
        }

        const response = await s3.listObjectsV2(params).promise();

        if (response.Contents) {
            await Promise.all(response.Contents.map(async (file) => {
                const fileKey = file.Key;
                if (fileKey) {
                    const getObjectParams = {
                        Bucket: process.env.S3_BUCKET ?? "",
                        Key: fileKey
                    }

                    const data = await s3.getObject(getObjectParams).promise();

                    if (data.Body) {
                        const fileData = data.Body as Buffer;
                        //remove folder name??
                        const filePath = `${localPath}/${fileKey.replace(key, "")}`;

                        await writeFile(filePath, fileData);

                    }
                }
            }))
        }

    } catch (error) {
        console.error('Error fetching folder:', error);
    }

}

function writeFile(filePath: string, fileData: Buffer): Promise<void> {
    return new Promise(async (resolve, reject) => {
        await createFolder(path.dirname(filePath));

        fs.writeFile(filePath, fileData, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

function createFolder(dirName: string) {
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(dirName, { recursive: true }, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}