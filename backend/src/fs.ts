import fs from "fs";

interface File {
    type: "dir" | "file";
    name: string
}
//fetches the files in the current root folder
export const fetchDir = (dir: string, baseDir: string): Promise<File[]> => {
    return new Promise((resolve, reject) => {
        //readdir with { withFileTypes: true } return files as dirent objects with information like isDirectory or isFile
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve(files.map(file => ({ type: file.isDirectory() ? "dir" : "file", name: file.name, path: `${baseDir}/${file.name}` })))
            }
        })
    })

}

export const fetchFileContent = (file: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })

};

export const saveFile = (file: string, content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, content, "utf-8", (err) => {
            if (err) {
                reject(err);
            };

            resolve();
        })
    })
}